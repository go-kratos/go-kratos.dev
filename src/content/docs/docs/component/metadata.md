---
id: metadata
title: Metadata
---

Kratos metadata carries string header values through a `context.Context` without
coupling application code to HTTP headers or native gRPC metadata. Its type is
`map[string][]string`; keys are normalized to lowercase by `Add`, `Set`, `Get`,
and `Values`.

## Work with metadata values

Use `metadata.New`, `Set`, `Add`, `Get`, `Values`, `Range`, and `Clone` to manage
a value. `Set` replaces the values for a key, while `Add` appends one.

```go
md := metadata.New()
md.Set("x-md-global-request-id", requestID)
md.Add("x-md-global-tag", "checkout")
ctx := metadata.NewClientContext(context.Background(), md)
```

`AppendToClientContext` is convenient for adding pairs to an existing outgoing
context. It requires an even number of strings and panics on an unmatched key.

```go
ctx = metadata.AppendToClientContext(ctx,
	"x-md-global-request-id", requestID,
	"x-md-local-caller", serviceName,
)
reply, err := client.GetTodo(ctx, request)
```

Use `FromClientContext` to inspect metadata intended for the next call and
`FromServerContext` to inspect metadata received by the current server.
`MergeToClientContext` returns a new context with the supplied map merged in.

## Install transport middleware

Metadata does not cross the network until both transports install the matching
middleware:

```go
server := grpc.NewServer(grpc.Middleware(metadata.Server()))
client, err := grpc.NewClient(ctx,
	grpc.WithEndpoint(endpoint),
	grpc.WithMiddleware(metadata.Client()),
)
```

The middleware uses the common `transport.Header`, so the same metadata code
works with HTTP and gRPC.

## Default propagation rules

The server middleware reads incoming header keys beginning with `x-md-` and
stores them in server metadata. The client middleware writes three sources to
the outgoing request:

1. constants configured on that client middleware;
2. every value in the explicit client metadata context;
3. values from the current server context whose keys begin with
   `x-md-global-`.

These defaults give the prefixes useful hop semantics. An incoming
`x-md-global-*` value continues to downstream services. An incoming
`x-md-local-*` value is visible to the receiving service but is not forwarded
automatically. Explicit client metadata is always sent to the next service, so
use it only for headers intended for that call.

`metadata.WithPropagatedPrefix` replaces the default prefix list. On the server
it selects accepted headers; on the client it selects which received server
metadata is forwarded. `metadata.WithConstants` adds fixed values, such as a
caller identity, at the middleware instance.

## Security and middleware order

Metadata is caller-controlled input at the first trust boundary. Authenticate
before trusting identity or tenant fields, bound header sizes, and never forward
authorization or privacy-sensitive headers through broad prefixes. Use stable,
documented keys and avoid putting credentials in logs.

Place `metadata.Server()` outside middleware that reads incoming values. On a
client, place `metadata.Client()` outside middleware that expects the outgoing
transport header to have been populated. Tracing propagation is handled by the
OpenTelemetry tracing middleware and does not need an `x-md-` key.
