---
id: api-protobuf
title: Protobuf Guideline
---

Define public APIs in versioned protobuf packages such as `api/todo/v1/todo.proto`. Keep the protobuf `package` and Go `go_package` stable; introduce a new API version for incompatible public changes. HTTP transcoding is optional and uses `google/api/annotations.proto`.

The layout declares its `api` and `internal` Buf modules and the Google APIs
dependency in `buf.yaml`. Generation settings live in `buf.gen.yaml`,
`buf.gen.config.yaml`, and the Makefile. Run `make api` after changing an API,
commit the generated bindings, and do not edit generated `*.pb.go`,
`*_grpc.pb.go`, or `*_http.pb.go` files.

## Package and directory layout

Keep one API version under a stable directory and package. The Go package should identify the generated API package, not an internal server implementation.

```protobuf
syntax = "proto3";

package todo.v1;

import "google/api/annotations.proto";

option go_package = "example.com/todo/api/todo/v1;v1";

service TodoService {
	rpc GetTodo(GetTodoRequest) returns (Todo) {
		option (google.api.http) = {get: "/v1/todos/{id}"};
	}
}

message GetTodoRequest { string id = 1; }
message Todo { string id = 1; string title = 2; }
```

Generated gRPC operations use `/todo.v1.TodoService/GetTodo`. Keep package, service, method, field numbers, and field types stable after clients depend on them.

## Imports, naming, and comments

Resolve imports through the modules and dependencies in `buf.yaml`; update
`buf.lock` with `buf dep update` when dependencies change. Use clear nouns for
messages, verb-noun RPC methods, and plural collection fields. Add comments to
exported services, methods, messages, and fields because generators use
protobuf comments in generated documentation.

## Evolve an API

Add optional fields rather than changing field types or reusing field numbers. Reserve deleted field numbers and names. Add methods compatibly when possible; make a new `v2` package for an incompatible public contract. HTTP paths are part of the public API too, so preserve existing paths and add new bindings deliberately.

Place error reason definitions next to the API that exposes them. Generate error helpers with the project's configured tooling and return Kratos `errors` from service implementations so HTTP and gRPC clients receive the same reason and metadata.

## Generation checklist

1. Update `.proto` files and, when required, dependencies in `buf.yaml`.
2. Run `make api`.
3. Implement new generated methods in `internal/service`.
4. Register generated HTTP and gRPC services in `internal/server`.
5. Run `go test ./...` and review generated diffs.

## References

- [Google API Improvement Proposals](https://google.aip.dev/)
- [Protocol Buffers documentation](https://protobuf.dev/)
- [API definition](/docs/component/api/)
