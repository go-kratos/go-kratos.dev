---
id: circuitbreaker
title: Circuit Breaker
---

`circuitbreaker.Client()` protects outgoing calls. It maintains a breaker for each client operation and returns `circuitbreaker.ErrNotAllowed` (HTTP 503) when a request is rejected locally.

```go
conn, err := grpc.NewClient(ctx,
    grpc.WithEndpoint("dns:///orders.example:9000"),
    grpc.WithMiddleware(circuitbreaker.Client()),
)
```

The default v3 breaker is internal to Kratos; v3 does not make Aegis a core dependency. To provide another implementation, pass `circuitbreaker.WithBreakerFactory(func() circuitbreaker.CircuitBreaker { ... })`. The breaker marks Internal Server, Service Unavailable, and Gateway Timeout errors as failures; other replies mark success.

## Configure behavior

The factory is called lazily for each client operation. Return an independent `CircuitBreaker` instance from it; sharing mutable breaker state across unrelated operations changes isolation semantics. A breaker implementation must decide admission in `Allow` and record the result with `MarkSuccess` or `MarkFailed`.

```go
type CircuitBreaker interface {
	Allow() error
	MarkSuccess()
	MarkFailed()
}
```

Kratos marks a call as failed only when its returned error maps to Internal
Server Error, Service Unavailable, or Gateway Timeout. Other errors, including
client input and authorization failures, call `MarkSuccess` because they do not
show that the dependency is unavailable. A locally rejected request also calls
`MarkFailed` so the breaker's drop observation continues.

Circuit breaking is client-side protection, not a substitute for timeouts, capacity planning, or server-side load shedding. Log the operation and rejection reason, and ensure fallback behavior does not immediately retry the same rejected call.

The middleware obtains its key from the client transport context, so install it
through an HTTP or gRPC client. Applying it to a handler without a client
transport context is unsupported. When used as stream middleware, the returned
result describes stream establishment; later `Send` and `Recv` failures are not
fed back to this middleware automatically.
