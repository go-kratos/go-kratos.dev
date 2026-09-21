---
id: overview
title: Overview
---

Kratos supplies HTTP and gRPC transports around the same protobuf service
contract. Both implement the `transport.Server` lifecycle and attach a
`transport.Transporter` to the request context. Middleware can therefore read
the transport kind, endpoint, canonical operation, and headers without knowing
which server accepted the request.

## Server lifecycle

Construct transports in `internal/server`, register generated services, and
pass the finished servers to the application. `App.Run` obtains their endpoints,
starts every server, registers the service after startup, and stops the servers
during graceful shutdown.

```go
app := kratos.New(
	kratos.Name("todo"),
	kratos.Server(httpServer, grpcServer),
)
if err := app.Run(); err != nil {
	return err
}
```

The `Endpoint()` method reports the real listener endpoint. This matters when a
server listens on `:0`: Kratos resolves the allocated port before it builds
registration metadata.

## Generated bindings

A service normally has one protobuf definition and two generated adapters:

| Binding | Server registration | Client construction |
| --- | --- | --- |
| gRPC | `RegisterTodoServiceServer` | `NewTodoServiceClient` |
| HTTP | `RegisterTodoServiceHTTPServer` | `NewTodoServiceHTTPClient` |

Generated adapters decode transport input, set the canonical operation, invoke
the middleware chain, call the service implementation, and encode the result.
Keep domain behavior in the service and business layers instead of modifying
generated files.

## Context information

Use `transport.FromServerContext` in server middleware and
`transport.FromClientContext` in client middleware. A `Transporter` provides
`Kind`, `Endpoint`, `Operation`, `RequestHeader`, and `ReplyHeader`.

## Choosing a transport

HTTP is convenient for browsers, public JSON APIs, SSE, and WebSocket clients.
gRPC provides native protobuf RPCs, unary and streaming calls, health checking,
and reflection. A service can expose both at once from one implementation, as
the project template does. Configure independent addresses and timeouts because
the two listeners have separate traffic and shutdown behavior.

See [HTTP](/docs/component/transport/http/) and
[gRPC](/docs/component/transport/grpc/) for their server and client options.
