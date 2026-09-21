---
id: design
title: Design Philosophy
description: The design principles, project structure, and component boundaries of Kratos v3.
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---

Kratos is a Go framework for building services. More precisely, it is a toolbox:
applications select the parts they need and keep control of their own
architecture and infrastructure. Kratos does not require a particular database,
ORM, cache, message queue, registry, configuration center, or deployment
platform.

This design began with the v2 rewrite and remains the foundation of v3. V3
updates the public APIs and toolchain, but it continues to favor small
interfaces, explicit assembly, generated transport adapters, and replaceable
infrastructure.

## Design principles

The original Kratos design set out several goals that still guide the project:

- **Simple:** use ordinary Go and avoid unnecessary framework machinery.
- **General:** provide reusable service capabilities rather than encode one
  company's business conventions.
- **Efficient:** reduce repeated integration and code-generation work so teams
  can focus on service behavior.
- **Stable and robust:** keep core contracts testable and make common failures
  explicit.
- **Performance-conscious:** provide suitable performance without relying on
  opaque or unsafe application patterns.
- **Extensible:** define focused interfaces that applications and contrib
  modules can implement.
- **Fault-aware:** include timeouts, graceful shutdown, rate limiting, circuit
  breaking, recovery, and observable errors as normal service concerns.
- **Tool-supported:** keep API, configuration, and dependency-wiring generation
  repeatable through project-owned commands.

These principles explain why Kratos leaves business architecture and provider
selection to the application. A framework default should be useful, but it
should not make a database or vendor SDK part of the business model.

## Project ecosystem

The main projects have distinct responsibilities:

- [`go-kratos/kratos`](https://github.com/go-kratos/kratos) contains the core
  runtime, CLI and protobuf generators, transports, middleware, configuration,
  errors, logging, registry contracts, and selector implementations.
- [`go-kratos/kratos-layout`](https://github.com/go-kratos/kratos-layout) is the
  reference service template. It demonstrates dependency direction, Buf and
  Wire generation, HTTP/gRPC servers, configuration, and a data layer.
- [`contrib`](https://github.com/go-kratos/kratos/tree/main/contrib) contains
  optional integrations. In v3, integrations such as OpenTelemetry are
  independently versioned modules and must be added explicitly by an
  application.
- [`go-kratos/gateway`](https://github.com/go-kratos/gateway) is a separate API
  gateway project. A Kratos service does not require it.

The layout is an example rather than a condition for using the framework. A
team can modify its directories, use another dependency-injection approach, or
adopt an existing project structure while continuing to use Kratos transports
and components.

## Why v2 was redesigned

Kratos v1 already provided a broad set of microservice libraries. As services
and teams grew, however, tightly coupled framework and project structures made
changes more expensive. Modules were harder to test in isolation, and replacing
third-party infrastructure required work across business code.

V2 addressed this by redesigning the framework and `kratos-layout` around ideas
from Domain-Driven Design and Clean Architecture. The key result was dependency
direction: business rules define the interfaces they need, while transport and
infrastructure code implement adapters at the edges. This structure improves
readability, testing, and the ability to replace external systems as a service
evolves.

The framework was deliberately designed like a socket. Core packages provide
standard connection points; an application plugs in implementations that match
its production environment. That approach also lets the community add
integrations without expanding the core runtime for every provider.

## How v3 extends the design

V3 keeps the v2 architecture and sharpens its boundaries:

- Core imports use the `/v3` module path and require the v3 Go toolchain.
- Logging uses the standard `log/slog` API instead of a Kratos-specific
  `Logger`/`Helper` abstraction.
- OpenTelemetry tracing and metrics and JWT middleware are independent contrib
  modules, so applications own their setup and shutdown.
- Go JSON and protobuf JSON are separate codecs with explicit wire behavior.
- HTTP code generation supports server streams with SSE and client or
  bidirectional streams with WebSocket.
- Configuration adds typed `config.Get[T]`, validation accepts custom validator
  functions, and errors add helpers such as `Join` and `TooManyRequests`.
- Rate limiting and circuit breaking have core default implementations without
  requiring Aegis; custom implementations still use the exposed interfaces.

These changes update how components are integrated. They do not require a new
business-layer architecture. See [New Features in Kratos
v3](/docs/migration/v3-new-features/) and [Migrate from v2 to
v3](/docs/migration/v2-to-v3/) for the feature and migration details.

## Application lifecycle

`kratos.App` is a lifecycle coordinator. It accepts service identity, one or
more `transport.Server` values, an optional registrar, hooks, a logger, and
shutdown timeouts. It does not construct databases or providers implicitly.

```go
app := kratos.New(
	kratos.ID(instanceID),
	kratos.Name("todo"),
	kratos.Version(version),
	kratos.Metadata(map[string]string{"region": region}),
	kratos.Logger(logger),
	kratos.Server(httpServer, grpcServer),
	kratos.Registrar(registrar),
	kratos.StopTimeout(10*time.Second),
)

if err := app.Run(); err != nil {
	return err
}
```

`Run` executes `BeforeStart` hooks, starts the servers, registers the resulting
service instance, and then runs `AfterStart` hooks. A configured signal, an
explicit `Stop`, or a server failure begins shutdown. `Stop` executes
`BeforeStop`, deregisters the instance, cancels the application context, and
lets each server stop within the configured budget; `AfterStop` runs after the
servers have exited.

Server endpoints are collected through `transport.Endpointer` unless explicit
endpoints are supplied. Lifecycle hooks receive a context containing `AppInfo`,
which exposes the current ID, name, version, metadata, and endpoints. See
[Application and lifecycle](/docs/component/application/) for ordering and
failure behavior.

## Reference project structure

The current layout keeps the v2 dependency-boundary design and applies it to a
complete Todo service:

```text
api/                    Protobuf contracts and generated clients/servers
cmd/server/             Process entry point and Wire provider assembly
configs/                Runtime configuration files
internal/biz/           Entities, use cases, and repository interfaces
internal/data/          Repository implementations and external clients
internal/service/       Transport-facing service implementation
internal/server/        HTTP and gRPC server construction
```

Dependencies point toward `internal/biz`. A use case can depend on a repository
interface, while the concrete Ent repository stays in `internal/data`.
`internal/service` translates generated API messages to use-case calls, and
`internal/server` registers that service with HTTP and gRPC. Wire assembles the
providers in `cmd/server`; it does not act as a runtime service locator.

Kratos does not enforce these directories. Their purpose is to prevent
transport, persistence, and vendor SDK types from spreading through business
logic. The [layout guide](/docs/intro/layout/) and [complete service
walkthrough](/docs/guide/service-development/) explain each layer.

## Infrastructure remains an application choice

Database, cache, and message-queue libraries are outside the core framework.
Choose them for the service's data model and operational requirements, then
hide provider-specific types behind repository or client interfaces where
replacement and focused tests matter.

The reference layout currently demonstrates Ent with a MySQL driver. That is a
template decision, not a Kratos requirement. An application may use
`database/sql`, another ORM, a document database, an in-memory implementation,
or no database. The same rule applies to Redis clients, Kafka clients, and other
infrastructure: construct them explicitly, inject them into the data layer, and
close them through the application's dependency lifecycle.

## CLI and generation

The `kratos` CLI creates projects and API/service scaffolding and can run a
service in development. The layout owns its repeatable generation commands:

```bash
make api       # generate API protobuf, gRPC, HTTP, and OpenAPI output
make config    # generate configuration protobuf output
make generate  # run go generate and go mod tidy
make all       # run API, configuration, and Go generation
```

The exact generated files are determined by the project's Buf templates and Go
tool commands. Generated `*.pb.go`, HTTP/gRPC bindings, OpenAPI documents, and
`wire_gen.go` are outputs: change their source definition, regenerate, and
review the diff instead of editing them manually. See [CLI](/docs/getting-started/usage/)
and [API generation](/docs/component/api/).

## Protobuf-first APIs

Kratos uses Protobuf as the service contract. One RPC definition can produce a
gRPC binding and, when it has `google.api.http` annotations, an HTTP binding.
This keeps request types, field numbers, service methods, and generated client
interfaces aligned across transports.

```proto
syntax = "proto3";

package todo.v1;

import "google/api/annotations.proto";

option go_package = "example/api/todo/v1;v1";

service TodoService {
  rpc GetTodo (GetTodoRequest) returns (Todo) {
    option (google.api.http) = { get: "/v1/todos/{id}" };
  }

  rpc WatchTodos (WatchTodosRequest) returns (stream TodoEvent) {
    option (google.api.http) = { get: "/v1/todos/watch" };
  }
}
```

V3 maps the server-streaming HTTP method to SSE. Client-streaming and
bidirectional HTTP methods use WebSocket, while gRPC retains its native stream.
See [HTTP Streaming with SSE and
WebSocket](/docs/component/transport/http-streaming/).

Protobuf does not have to describe every endpoint. File uploads, provider
callbacks, or formats that do not fit a protobuf contract can use a native
`net/http.Handler`, a Kratos `http.HandlerFunc`, or a manually defined struct
on the HTTP router. This escape hatch is an intentional part of the transport
design.

## Error contract

Kratos errors carry four public fields with distinct purposes:

1. `code` is the broad status category. It uses HTTP status semantics and maps
   to a gRPC status for the gRPC transport.
2. `reason` is a stable, readable service error identifier such as
   `USER_NOT_FOUND`. Callers should branch on this value instead of the message.
3. `message` is a client-facing explanation and must be safe to expose.
4. `metadata` contains optional structured details and must not contain secrets.

```json
{
  "code": 404,
  "reason": "USER_NOT_FOUND",
  "message": "user does not exist",
  "metadata": {
    "resource": "users/42"
  }
}
```

`WithCause` retains an internal Go cause without changing the public response.
`errors.Is`, `Code`, `Reason`, and `FromError` inspect wrapped errors, and v3's
`errors.Join` can preserve multiple failures. Build stable public errors at the
business or service boundary; keep driver and SDK errors inside the data layer.
See [Errors](/docs/component/errors/).

## Configuration and dynamic state

The configuration abstraction consists of `Source`, `Watcher`, `Config`, and
`Value`. A source loads key-value data and may watch for updates. `Config`
decodes, merges, resolves placeholders, caches observed values, and notifies
key-specific observers.

Core supplies file and environment sources. Remote systems are contrib modules
that implement the same contracts. Later sources override earlier values, so a
service can load checked-in defaults and then deployment-specific overrides.
Use `Scan` for the complete tree or v3's `config.Get[T]` for one key.

Dynamic updates are deliberately low-level: the observer must validate the new
value and safely replace application state. Listener addresses, drivers, and
other startup-only dependencies usually require a controlled restart. See
[Configuration](/docs/component/config/).

## Registry, discovery, and load balancing

`registry.Registrar` publishes a `ServiceInstance`; `registry.Discovery`
watches instances for a service name. `App` registers after server startup has
begun and deregisters before canceling its server context. HTTP and gRPC clients
can combine a discovery implementation with a `discovery:///service-name`
endpoint.

Discovery answers which instances exist. `selector.Selector` decides which
eligible node receives a call. Kratos includes weighted round-robin, P2C,
random, and other selector implementations; HTTP and gRPC clients initialize
weighted round-robin as the global default. Node filters and subsets can narrow
the candidate set before selection, and the returned `DoneFunc` records the
result for adaptive selectors. See [Registry](/docs/component/registry/) and
[Selector](/docs/component/selector/).

## Metadata

Metadata carries request-scoped values outside the protobuf payload. Transport
middleware converts selected HTTP headers or gRPC metadata into the Kratos
metadata context and can forward selected values to an outgoing call.

Propagation is a protocol decision. Kratos does not forward every header by
default: local metadata remains in the current service, while global metadata
can cross a service boundary. Define a small allowlist for request IDs, locale,
tenant context, or other approved fields, and keep credentials under the
authentication middleware's policy. See [Metadata](/docs/component/metadata/).

## Logging and observability

V3 uses `*slog.Logger` throughout the application and middleware APIs. The core
log package can build text or JSON handlers, filter records or attributes, and
attach `slog.Attr` values to a context. Standard slog handlers from other
libraries can be supplied directly or wrapped by `log.NewLogger`.

Tracing and metrics are provided by the independent
`github.com/go-kratos/kratos/contrib/otel/v3` module. The application constructs
the OpenTelemetry providers and exporters, installs server and client
middleware, and shuts providers down after transports stop. This ownership
keeps credentials, resources, sampling, export policy, and flush errors visible
to the application. See [Logging](/docs/component/log/),
[Tracing](/docs/component/middleware/tracing/), and
[Metrics](/docs/component/metrics/).

## Middleware and resilience

HTTP and gRPC unary calls use the same `middleware.Middleware` shape. Middleware
wraps generated handlers and is the extension point for recovery, logging,
validation, authentication, metadata, rate limiting, circuit breaking, and
telemetry. Order matters: in `middleware.Chain(a, b)`, `a` is the outer wrapper
and observes the call before and after `b`.

The core rate-limit middleware uses its built-in limiter unless
`WithLimiter` supplies another implementation. The client circuit breaker keeps
one breaker per operation and can replace its factory with
`WithBreakerFactory`. These mechanisms reject or contain work; they do not
choose retry safety, timeouts, or idempotency for the application. Stream RPCs
also need their transport-specific middleware and lifetime handling. See the
[middleware overview](/docs/component/middleware/overview/).

## Encoding

HTTP codecs are registered by subtype and selected from `Content-Type` and
`Accept`. V3 separates standard Go `encoding/json` under `json` from protobuf
JSON under `protojson`. This makes wire behavior explicit, including field
names, enums, well-known types, and default values.

Codec registration is global, and registering another codec with the same name
replaces the previous value. Import only the formats the service intends to
support and test public response bytes before changing an existing API. See
[Encoding and serialization](/docs/component/encoding/).

## Extension and evolution

Use core interfaces at the boundary and keep provider lifecycle in the
application. A contrib module can supply a registry, configuration source,
middleware, logger handler, or other integration, but its SDK types should stay
behind those interfaces or inside the data layer. Because contrib modules are
versioned independently, declare and upgrade each one explicitly.

The same rule applies to project examples: check their module path and generated
tool configuration before copying code. Start with the [current
layout](/docs/intro/layout/), use the [example index](/docs/getting-started/examples/)
for focused integrations, and see [Plugins](/docs/getting-started/plugin/) for
the wider ecosystem.

Kratos evolves through its public contracts and community. Preserve protobuf
field numbers, HTTP paths, error reasons, and serialization behavior when
services of different versions coexist. Changes that affect callers should be
tested at the transport boundary and documented as part of the service API.
