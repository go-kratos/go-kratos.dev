---
id: service-development
title: Build a Service from the Layout
description: Follow the current kratos-layout Todo example from protobuf API to tested Ent repository.
---

The current [kratos-layout](https://github.com/go-kratos/kratos-layout)
is an executable reference for a layered Kratos v3 service. Its Todo example
uses generated HTTP and gRPC bindings, AIP list helpers, Wire, Ent, MySQL for
the default runtime configuration, and SQLite for repository tests.

This guide explains what the checked-in code does. The Todo resource is a
teaching example rather than a framework requirement.

## Prepare the project

Use Go 1.25.7 or a compatible newer supported toolchain because that is the
version declared by the current layout. Copy the template, change its module
path, then update imports that still use `github.com/go-kratos/kratos-layout`.

```bash
git clone https://github.com/go-kratos/kratos-layout.git todo-service
cd todo-service
go mod edit -module github.com/your-org/todo-service
make init
make all
go test ./...
```

`make init` installs the latest Buf and Wire commands. The generator versions
used by `buf generate` are pinned in `buf.gen.yaml`; review tool changes before
updating those pins. `make all` runs API generation, configuration generation,
`go generate ./...`, and `go mod tidy`.

The default runtime config selects the MySQL driver and enables debug output
and automatic schema creation for development. Start a matching database or
change `configs/config.yaml` to a driver that the binary actually imports.
Keeping a driver in `go.mod` is insufficient: `database/sql` drivers register
through a blank import at runtime.

## Follow the data flow

```text
client -> generated HTTP/gRPC binding -> service DTO conversion
       -> biz usecase and domain object -> biz repository interface
       -> data repository -> Ent persistent object -> database
```

The dependencies point inward: `service` imports `biz`; `data` implements an
interface owned by `biz`; `biz` never imports `data`. `cmd/server` is the
composition root where Wire connects all layers.

| Layer | Owns | Responsibility |
| --- | --- | --- |
| `api/todo/v1` | DTO and public contract | RPCs, HTTP paths, messages, error reasons |
| `internal/service` | Transport adapter | Validate request shape and convert DTO ↔ DO |
| `internal/biz` | DO, usecase, repo interface | Business validation and orchestration |
| `internal/data` | Repository implementation | Convert DO ↔ Ent model and map storage errors |
| `internal/server` | Transport construction | Middleware and generated service registration |
| `cmd/server` | Process bootstrap | Config, logger, Wire, application lifecycle |

## Define the public API

The Todo protobuf declares unary CRUD plus server-streaming and bidirectional
streaming methods. HTTP annotations are inputs to `protoc-gen-go-http`; they do
not implement handlers by themselves.

```proto
rpc GetTodo (GetTodoRequest) returns (Todo) {
  option (google.api.http) = {
    get: "/v1/todos/{id}"
  };
}

rpc UpdateTodo (UpdateTodoRequest) returns (Todo) {
  option (google.api.http) = {
    put: "/v1/todos/update"
    body: "todo"
  };
}
```

`CreateTodoRequest.todo`, IDs, and `update_mask` carry
`google.api.field_behavior = REQUIRED`. The HTTP server adds a custom v3
validator that calls `fieldbehavior.ValidateRequiredFields` for protobuf
messages. The core validator alone only invokes a message's `Validate` method;
field-behavior annotations require the custom function used by the layout.

`make api` generates Go messages, gRPC bindings, HTTP bindings, error reason
helpers, and `openapi.yaml`. Never edit generated `.pb.go`, `_grpc.pb.go`, or
`_http.pb.go` files.

## Implement the business boundary

The business package owns the storage-independent `Todo`, `TodoUsecase`, and
`TodoRepo`. It validates UUID and title requirements and exposes list options
without exposing Ent builders.

```go
type TodoRepo interface {
	FindByID(context.Context, uuid.UUID) (*Todo, error)
	ListTodos(context.Context, ...ListOption) ([]*Todo, error)
	CreateTodo(context.Context, *Todo) (*Todo, error)
	UpdateTodo(context.Context, *Todo) (*Todo, error)
	DeleteTodo(context.Context, uuid.UUID) error
}

type TodoUsecase struct {
	repo TodoRepo
}
```

Package-level Kratos errors use generated reason enums. Storage implementations
translate `ent.IsNotFound` into `biz.ErrTodoNotFound`, so callers do not depend
on Ent error types.

## Convert requests in the service layer

The service embeds `UnimplementedTodoServiceServer`, parses string IDs to
UUIDs, converts protobuf DTOs to domain objects, and maps results back to DTOs.
For partial updates it loads the current resource and applies the supplied
field mask before calling the usecase.

```go
func (s *TodoService) UpdateTodo(ctx context.Context, req *v1.UpdateTodoRequest) (*v1.Todo, error) {
	if req.GetTodo().GetId() == "" || req.GetUpdateMask() == nil || len(req.GetUpdateMask().GetPaths()) == 0 {
		return nil, biz.ErrTodoInvalidArgument
	}
	current, err := s.GetTodo(ctx, &v1.GetTodoRequest{Id: req.GetTodo().GetId()})
	if err != nil {
		return nil, err
	}
	fieldmask.Update(req.GetUpdateMask(), current, req.GetTodo())
	todo, err := s.uc.UpdateTodo(ctx, convertTodo(current))
	if err != nil {
		return nil, err
	}
	return convertTodoReply(todo), nil
}
```

A field mask controls which supplied values overwrite the current DTO. The
usecase still enforces domain rules.

List requests are parsed with `filtering.ParseFilter`,
`ordering.ParseOrderBy`, and `pagination.ParsePageToken`. The service declares
allowed filter fields and validates ordering paths before passing typed options
to the usecase. The data repository translates those options to Ent predicates
and order expressions.

## Persist with Ent

`NewData` opens one long-lived Ent client. The cleanup returned to Wire closes
it after the application stops. `debug` prints generated statements and
`auto_migrate` calls `db.Schema.Create`; both are development conveniences and
should be disabled in production in favor of reviewed migrations.

The Todo schema uses UUIDv7 IDs, created/updated time mixins, an indexed status,
and soft deletion. Every read and update filters for active rows. List queries
append ID as a final ordering key so offset pagination remains deterministic
when requested fields contain ties.

Generate Ent code through the checked-in directive:

```bash
go generate ./internal/data/ent
```

Changing schema source without regenerating leaves the compiled repository out
of sync. Keep generated files in the same change as their schema.

## Wire the process

Each package exports a provider set. The injector accepts server and data
configuration plus `*slog.Logger`, then combines server, data, biz, and service
providers with the application constructor.

```go
func wireApp(*conf.Server, *conf.Data, *slog.Logger) (*kratos.App, func(), error) {
	panic(wire.Build(server.ProviderSet, data.ProviderSet, biz.ProviderSet, service.ProviderSet, newApp))
}
```

Run `make all` after changing a constructor or provider set. The generated
`wire_gen.go` is ordinary compile-time Go code; Wire is not used at runtime.

## Run and call the service

With MySQL reachable through `KRATOS_DATABASE_SOURCE`, start the application:

```bash
export KRATOS_DATABASE_SOURCE='root:root@tcp(127.0.0.1:3306)/test?timeout=5s&parseTime=True&loc=Local&charset=utf8mb4'
go run ./cmd/server -conf ./configs
```

Create and retrieve a Todo over HTTP:

```bash
curl -sS -X POST http://127.0.0.1:8000/v1/todos/create \
  -H 'Content-Type: application/json' \
  -d '{"title":"verify docs","content":"run the example"}'

curl -sS http://127.0.0.1:8000/v1/todos/REPLACE_WITH_ID
```

The generated bindings determine JSON shape and HTTP status mapping. Do not
assume the example ID or response before using the value returned by create.

## Streaming behavior

The proto exposes `WatchTodos` and `SyncTodos`. In the current implementation,
`WatchTodos` sends the selected snapshot and then returns; despite the proto
comment saying the stream remains open, no event subscription loop exists in
the checked-in service. `SyncTodos` reads client messages until EOF and sends a
created, updated, or deleted event for each accepted action. Document and test
the implementation that exists before promising live notifications.

## Test at layer boundaries

- Service tests use an in-memory fake implementing `biz.TodoRepo` to verify DTO
  conversion, field masks, pagination tokens, validation, and streams.
- Data tests use in-memory SQLite with a real Ent client to verify CRUD,
  filtering, ordering, stable pagination, and soft deletion.
- Server wiring should be covered by a small integration test when custom
  codecs, middleware, or transport options are added.

Run `go test ./...` after every change. Treat the reference repository's tests
as part of the example contract, and keep the complete package buildable rather
than checking isolated snippets alone.
