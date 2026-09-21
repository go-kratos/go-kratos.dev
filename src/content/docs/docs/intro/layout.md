---
id: layout
title: Project Layout
---
The [Kratos project template](https://github.com/go-kratos/kratos-layout) is a
reference application layout for a v3 service. It demonstrates a protobuf-first
HTTP and gRPC service with generated dependency injection. The layout is a
template convention, not an API imposed by the Kratos runtime.

## Directories

```text
api/<domain>/<version>/  Protobuf sources and generated stubs; public contract
cmd/<app>/               Entrypoint, `main.go`, and Wire injector
configs/                 Runtime configuration; do not commit secrets
internal/conf/           Configuration proto and generated Go bindings
internal/server/         HTTP and gRPC server construction and registration
internal/service/        Transport adapters, normally one file per resource
internal/biz/            Domain objects, usecases, repository interfaces, errors
internal/data/           Repository implementations and storage clients
buf.yaml                 Buf modules and remote protobuf dependencies
```

Generated `*.pb.go`, `*_grpc.pb.go`, `*_http.pb.go`, and `wire_gen.go` files are
outputs. Change their proto or injector input, then regenerate; do not edit the
generated files directly.

## Layer Boundaries

The template keeps three model shapes distinct:

```text
client -> DTO -> service -> DO -> biz -> DO -> data -> PO -> storage
```

- `service` converts DTOs at the transport boundary and calls usecases. It may
    import `api/...` and `biz`, but not `data` or storage clients.
- `biz` owns domain objects, usecases, business errors, and repository
    interfaces. It does not depend on `service` or `data`.
- `data` implements repository interfaces, owns persistent objects and storage
    client details, and converts between domain and persistent objects. It does
    not import API DTOs or `service`.
- `cmd` composes the layers through Wire. `server` constructs transports and
    registers services; it does not contain transport conversion or business
    logic.

These boundaries are conventions in the template that make storage and
transport changes testable without spreading their dependencies through the
application.

## Generation and Tests

The template provides the following workflow:

```bash
make init    # install Buf and Wire
make api     # generate API bindings and OpenAPI output
make config  # generate configuration bindings
make all     # run all generation, Wire, and go mod tidy
go test ./...
```

Place tests beside the package they cover. The template recommends fake
usecases or repositories for `service` and `biz` tests, and storage-boundary
tests for `data` implementations.
