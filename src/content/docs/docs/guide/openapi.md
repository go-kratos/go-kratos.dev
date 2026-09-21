---
id: openapi
title: OpenAPI
---

The project template generates an OpenAPI document from the same annotated
protobuf files used for HTTP and gRPC bindings. This keeps paths, request
messages, and response schemas tied to the API contract.

## Describe HTTP behavior

Import `google/api/annotations.proto` and attach `google.api.http` to an RPC.
Path variables must name request fields. `body` selects the message field read
from the request body; fields outside the path and body can be represented as
query parameters.

```protobuf
rpc UpdateTodo(UpdateTodoRequest) returns (Todo) {
	option (google.api.http) = {
		put: "/v1/todos/update"
		body: "todo"
	};
}
```

Use comments on services, methods, messages, and fields because generators can
carry them into API descriptions. Mark required fields with
`google.api.field_behavior` so the contract communicates required input. The
runtime validator still determines whether a request is accepted.

## Generate the specification

The layout's `buf.gen.yaml` runs four local plugins through pinned Go module
versions: Go protobuf, Go gRPC, Kratos HTTP, and Gnostic OpenAPI. Run:

```bash
make api
```

The OpenAPI plugin combines all API input and writes `openapi.yaml` at the
repository root. The template enables fully-qualified schema names and disables
the generated default response. Go and HTTP bindings are written beside their
source proto files under `api`.

Do not edit `openapi.yaml` by hand. Change the protobuf contract and generator
configuration, regenerate, and review the resulting specification with the
generated Go diff.

## Publish and check it

The generated file can be imported into an OpenAPI UI, client generator, API
gateway, or contract checker. A production workflow commonly:

1. runs `make api` in a clean checkout;
2. fails if regeneration changes tracked files;
3. validates `openapi.yaml` with the chosen OpenAPI tool;
4. publishes that exact artifact after the service contract is reviewed.

Generation documents the protobuf and HTTP annotations; it does not prove
authorization, business validation, pagination semantics, or backward
compatibility. Cover those behaviors with service tests and API review.

## Streaming endpoints

Kratos v3 generates SSE bindings for server-streaming HTTP RPCs and WebSocket
bindings for client-streaming and bidirectional RPCs. OpenAPI tooling has
limited ways to express these long-lived protocols. Treat the generated HTTP
binding and a written streaming contract as authoritative for event names,
message encoding, cancellation, and error behavior.

See [Protobuf API Design](/docs/guide/api-protobuf/) for contract conventions
and [HTTP Transport](/docs/component/transport/http/) for runtime binding.
