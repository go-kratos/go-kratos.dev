---
id: overview
title: Overview
---

Kratos middleware wraps an RPC handler. The same abstraction works with HTTP
and gRPC, so authentication, validation, logging, and other request policies do
not need separate transport implementations.

```go
type Middleware func(Handler) Handler

type Handler func(context.Context, any) (any, error)
```

## Execution order

`middleware.Chain(a, b, c)` executes the request side as `a -> b -> c ->
handler`, then unwinds the response side in reverse. Server and client transport
options preserve the order supplied to them.

```go
srv := http.NewServer(http.Middleware(
	metadata.Server(),
	tracing.Server(),
	logging.Server(logger),
	recovery.Recovery(recovery.WithLogger(logger)),
	validate.Validator(),
))
```

In this example, metadata and tracing are available to the remaining chain.
Logging surrounds recovery, so a panic converted to an error by recovery is
included in the completion log. Validation runs immediately before the service
handler. Select an order from the data each middleware needs and the failures it
must observe; there is no single chain suitable for every service.

## Available middleware

The v3 core contains:

| Package | Typical side | Purpose |
| --- | --- | --- |
| `circuitbreaker` | Client | Reject calls while a dependency is failing |
| `logging` | Both | Record operation, duration, status, and transport data |
| `metadata` | Both | Move selected request metadata across service calls |
| `ratelimit` | Server | Admit or reject work through a limiter |
| `recovery` | Server | Convert a panic into a Kratos error |
| `selector` | Both | Apply another middleware to selected operations |
| `validate` | Server | Call generated request validation |

JWT authentication is in
`github.com/go-kratos/kratos/contrib/middleware/jwt/v3`. Metrics and tracing are
in `github.com/go-kratos/kratos/contrib/otel/v3`. The core does not include a
retry middleware; define retry and idempotency policy at the client or
application boundary.

## Install middleware

Use `http.Middleware` or `grpc.Middleware` for unary server calls. Client
constructors use `WithMiddleware`. gRPC streaming has separate
`StreamMiddleware` and `WithStreamMiddleware` options, which is useful when a
stream needs a different lifetime or authorization policy.

```go
conn, err := grpc.NewClient(ctx,
	grpc.WithEndpoint("dns:///127.0.0.1:9000"),
	grpc.WithMiddleware(
		metadata.Client(),
		logging.Client(logger),
		circuitbreaker.Client(),
	),
)
```

HTTP and gRPC servers also provide `Use(pattern, middleware...)`. Patterns
match canonical RPC operations: `/*`, `/package.Service/*`, or
`/package.Service/Method`. Generated bindings set the operation before running
the chain.

## Select operations

Use `selector.Server` or `selector.Client` when a policy applies to only part of
an API. `Path`, `Prefix`, `Regex`, and `Match` inspect canonical operations such
as `/todo.v1.TodoService/GetTodo`, rather than HTTP paths.

```go
auth := selector.Server(jwt.Server(keyFunc)).
	Prefix("/todo.v1.TodoService/").
	Build()
```

## Write middleware

A middleware should call `next` exactly once unless it deliberately rejects the
request. Store request-scoped values in the returned context, keep shared state
safe for concurrent use, and return Kratos errors when the failure is part of
the public API contract.

```go
func audit(logger *slog.Logger) middleware.Middleware {
	return func(next middleware.Handler) middleware.Handler {
		return func(ctx context.Context, request any) (any, error) {
			start := time.Now()
			reply, err := next(ctx, request)
			logger.InfoContext(ctx, "request completed",
				"elapsed", time.Since(start),
				"error", err,
			)
			return reply, err
		}
	}
}
```

Use `transport.FromServerContext` or `transport.FromClientContext` when the
middleware needs the operation, endpoint, request headers, or reply headers.
Avoid depending on native HTTP or gRPC context types unless the policy is truly
transport-specific.
