---
id: overview
title: Kratos v3 Documentation
description: Build Go microservices with Kratos v3 HTTP/gRPC transports and explicit, composable infrastructure.
---

Kratos v3 is a lightweight Go framework for cloud-native services. It provides
application lifecycle management, generated HTTP and gRPC transports,
middleware, configuration, structured errors, metadata, encoding, logging, and
service-discovery interfaces. Applications select persistence, registry,
telemetry, and remote configuration implementations through independent
modules.

The guides cover the v3 API and the current
[Kratos project layout](https://github.com/go-kratos/kratos-layout). Core and
contrib packages are documented separately so it is clear which dependencies
an application must add itself.

## Start here

1. Follow [Quick Start](/docs/getting-started/start/) to prepare tools, copy the
   project template, generate code, run tests, and start a service.
2. Read [Build a Service from the Layout](/docs/guide/service-development/) to
   understand the Todo example from protobuf API to Ent repository.
3. Use the [component pages](/docs/component/application/) when configuring an
   application, transport, middleware, registry, or codec.
4. Existing v2 services should begin with [Migrate from v2 to v3](/docs/migration/v2-to-v3/), then review [New Features in Kratos v3](/docs/migration/v3-new-features/).

## Core model

An application receives one or more servers and owns their start/stop
lifecycle. Generated bindings adapt protobuf methods to HTTP and gRPC. A shared
middleware type lets transport-independent behavior wrap generated handlers.
Small interfaces define configuration sources, registries, selectors, and
codecs without requiring a particular provider.

The core module is `github.com/go-kratos/kratos/v3`. The CLI and each contrib
integration are separate Go modules and can have their own versions. Check the
module path before copying an example.

## What v3 provides

| Area | Core behavior |
| --- | --- |
| Application | Concurrent server lifecycle, hooks, signals, registration, graceful shutdown |
| API tooling | Protobuf HTTP/error generators and a project CLI |
| Transport | HTTP and gRPC servers/clients, generated bindings, unary and streaming support |
| Middleware | Recovery, logging, metadata, validation, rate limiting, circuit breaking, selection |
| Data contracts | Structured errors, transport metadata, codec registry, config values |
| Routing | Registry interfaces, discovery integration, selectors and node filters |
| Logging | Standard-library `log/slog` handlers, filtering and context attributes |

JWT and OpenTelemetry tracing/metrics are contrib modules in v3. Database
access, queues, caches, migrations, telemetry exporters, and deployment policy
remain application choices. The framework does not silently configure those
systems.

## Reference layout

The maintained layout demonstrates a protobuf-first API, generated HTTP/gRPC
bindings, Wire dependency injection, `service`/`biz`/`data` layers, Ent-backed
storage, MySQL runtime configuration, SQLite repository tests, AIP list
filtering/ordering/pagination, partial updates, and streaming RPCs.

Treat its structure as a tested starting point. Kratos itself does not require
Wire, Ent, MySQL, or that exact package layout.

## Reliability of examples

Examples are compiled and vetted as part of this site's build. English and
Chinese pages share the same code, and internal links are checked before the
site is published.

## Community and license

- [Kratos source](https://github.com/go-kratos/kratos)
- [Project layout](https://github.com/go-kratos/kratos-layout)
- [Examples](https://github.com/go-kratos/examples)
- [Contribution guide](/docs/community/contribution/)

Kratos is distributed under the [MIT License](https://github.com/go-kratos/kratos/blob/main/LICENSE).
