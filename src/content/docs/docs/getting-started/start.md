---
id: start
title: Quick Start
description: Create, generate, test, and run the current Kratos v3 project layout.
---

The maintained project template is the most complete starting point for a v3
service. It includes protobuf APIs, HTTP and gRPC servers, Wire, Ent, tests, and
an OpenAPI document. The commands and directory structure below follow the
[current project layout](https://github.com/go-kratos/kratos-layout).

## Prerequisites

- Go 1.25.7 or a compatible supported release. The core module requires Go
  1.25; the current layout records the patch-level version in `go.mod`.
- Git and Make.
- MySQL for the template's default runtime configuration.
- Buf and Wire for regeneration; the layout installs these with `make init`.

Clone the template and install its development commands:

```bash
git clone https://github.com/go-kratos/kratos-layout.git todo-service
cd todo-service
make init
```

`make init` currently installs `buf@latest` and `wire@latest`. The actual
protoc plugins invoked by Buf are versioned in `buf.gen.yaml`. In repeatable CI,
pin command versions rather than depending on a moving `latest` installation.

## Rename the template

Set your own module path before editing generated or application code:

```bash
go mod edit -module github.com/your-org/todo-service
```

Replace imports beginning with `github.com/go-kratos/kratos-layout`, then rename
the command, API package, application name, and example resource as needed.
Changing only `go.mod` leaves old Go imports unresolved. The Todo code is a
reference implementation, not a framework-owned type.

## Generate and test

```bash
make all
go test ./...
go vet ./...
```

`make all` runs `make api`, `make config`, and `make generate`. Those targets
generate protobuf HTTP/gRPC/OpenAPI files, configuration bindings, Ent output,
Wire output, and module metadata according to the checked-in project files.
Never hand-edit generated `.pb.go`, `_http.pb.go`, `_grpc.pb.go`, Ent, or
`wire_gen.go` files.

## Prepare the database

The default `configs/config.yaml` uses the `mysql` driver. It resolves its
`DATABASE_SOURCE` placeholder from `KRATOS_DATABASE_SOURCE` through the
configured `KRATOS` environment source, and enables Ent debug logging and
automatic schema creation. Start MySQL and create the selected database, then
set a DSN appropriate for your environment:

```bash
export KRATOS_DATABASE_SOURCE='root:root@tcp(127.0.0.1:3306)/test?timeout=5s&parseTime=True&loc=Local&charset=utf8mb4'
```

Do not commit production credentials. Disable `debug` and `auto_migrate` in
production and apply reviewed migrations separately. Although SQLite is in the
module, the runtime binary imports MySQL; SQLite is used by repository tests.

## Run the service

```bash
go run ./cmd/server -conf ./configs
```

The default listeners are HTTP `0.0.0.0:8000` and gRPC `0.0.0.0:9000`.
Successful process startup does not prove the database is reachable if no query
has run; call an endpoint as part of the check.

Create a Todo, copy the returned ID, and read it:

```bash
curl -sS -X POST http://127.0.0.1:8000/v1/todos/create \
  -H 'Content-Type: application/json' \
  -d '{"title":"learn Kratos","content":"run the v3 layout"}'

curl -sS http://127.0.0.1:8000/v1/todos/REPLACE_WITH_ID
```

Routes come from `google.api.http` annotations in the API proto. Replace these
Todo paths after replacing the example API.

## Project structure

```text
api/              Protobuf API definitions and generated bindings
cmd/              Application entrypoints and Wire injectors
configs/          Runtime configuration without secrets
internal/conf/    Configuration proto and generated bindings
internal/server/  HTTP and gRPC server construction
internal/service/ Transport-facing service methods and DTO conversion
internal/biz/     Usecases, domain objects, errors, repository interfaces
internal/data/    Ent repository implementations and storage clients
openapi.yaml      Generated OpenAPI document
```

Continue with [Build a Service from the Layout](/docs/guide/service-development/)
for the request flow and ownership rules, and [Application Lifecycle](/docs/component/application/)
for startup, registration, and graceful shutdown.

## Install the CLI

The project can be used directly without the CLI. Install it when you want its
template, proto scaffolding, run, upgrade, or changelog commands:

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
kratos --help
```

The CLI and layout are separate modules. Always inspect command help and the
generated project's `go.mod` instead of assuming that every installed CLI
version produces the same template.
