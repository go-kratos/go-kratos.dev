---
id: api
title: API Definition and Generation
---

Kratos services normally define their public contract in Protobuf. One contract
can produce protobuf messages, native gRPC bindings, HTTP transcoding bindings,
and an OpenAPI document. Application implementation types stay under
`internal`; clients import only the versioned API package.

## Files in the project template

The Todo API demonstrates the generated outputs:

```text
api/todo/v1/
├── todo.proto
├── todo.pb.go
├── todo_grpc.pb.go
├── todo_http.pb.go
├── error_reason.proto
└── error_reason.pb.go
```

`buf.yaml` defines the `api` and `internal` modules and their remote
dependencies. `buf.gen.yaml` configures Go protobuf, gRPC, Kratos HTTP, and
OpenAPI generation. Configuration messages use the separate
`buf.gen.config.yaml` template.

## Define a service

Keep the protobuf package and `go_package` versioned and stable. HTTP annotations
are optional; when present, they generate an adapter over the same service
method.

```protobuf
syntax = "proto3";

package todo.v1;

import "google/api/annotations.proto";
import "google/api/field_behavior.proto";

option go_package = "example.com/todo/api/todo/v1;v1";

service TodoService {
	rpc GetTodo(GetTodoRequest) returns (Todo) {
		option (google.api.http) = {get: "/v1/todos/{id}"};
	}
}

message GetTodoRequest {
	string id = 1 [(google.api.field_behavior) = REQUIRED];
}
```

Comments are part of the contract and appear in generated Go and OpenAPI
output. Field behavior annotations describe required input. Runtime validation
runs only when the service installs `validate.Validator()` and either the
request has a `Validate()` method or the middleware receives a custom validator.

## Generate artifacts

Run the template's target after changing API files:

```bash
make api
go test ./...
```

`make api` calls `buf generate --template buf.gen.yaml`. Generator versions are
declared in that file with `go run module@version`, so contributors use the same
tools without relying on arbitrary binaries in `PATH`. `make all` additionally
regenerates configuration and Wire output and runs `go mod tidy`.

Generated files should be committed with their source proto changes. Do not
edit them manually; changes disappear on the next generation.

## Implement and register the service

The service layer implements the generated interfaces. Register the same
implementation with both transports:

```go
v1.RegisterTodoServiceServer(grpcServer, todoService)
v1.RegisterTodoServiceHTTPServer(httpServer, todoService)
```

The gRPC binding exposes native protobuf RPCs. The HTTP binding decodes annotated
paths, queries, and bodies, runs Kratos middleware, and calls the same method.
Both use `/todo.v1.TodoService/GetTodo` as the canonical operation, so logging,
metrics, tracing, and selectors have consistent names.

Generated clients are created with `v1.NewTodoServiceClient(grpcConn)` or
`v1.NewTodoServiceHTTPClient(httpClient)`. Keep transport construction, TLS,
discovery, middleware, and timeouts outside generated packages.

## Error reasons and compatibility

Define stable error reasons near the public API. The layout uses an enum and
constructs Kratos errors with its string value:

```go
var ErrTodoNotFound = errors.NotFound(
	v1.ErrorReason_TODO_NOT_FOUND.String(),
	"todo not found",
)
```

Once clients use an API, do not reuse protobuf field numbers or enum values.
Reserve removed numbers and names, preserve published HTTP paths, and create a
new API package version for incompatible changes.

See [Protobuf API Design](/docs/guide/api-protobuf/),
[OpenAPI](/docs/guide/openapi/), and
[Complete Service Development](/docs/guide/service-development/) for the full
workflow.
