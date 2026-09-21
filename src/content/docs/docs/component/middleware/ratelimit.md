---
id: ratelimit
title: Rate Limiter
---

`ratelimit.Server()` performs server-side admission control. When its limiter rejects a request, it returns `ratelimit.ErrLimitExceed` (HTTP 429). For admitted calls, the middleware invokes the limiter's completion function with the handler error after the handler returns.

```go
srv := http.NewServer(http.Middleware(ratelimit.Server()))
```

The default limiter is implemented inside Kratos. Supply your own `ratelimit.Limiter` with `ratelimit.WithLimiter(limiter)` when the default policy does not fit the service. A limiter must implement the exported `Limiter` contract, including its `Allow` completion callback.

```go
type Limiter interface {
	Allow() (DoneFunc, error)
}

type DoneInfo struct {
	Err error
}
```

`Allow` runs before the handler. Any non-nil error rejects the request and the
middleware returns its stable `RATELIMIT` error rather than exposing the
limiter's internal error. On admission, return a non-nil completion function;
Kratos calls it once with the handler result after the request finishes.

## Apply and observe limits

Place the limiter near the outside of the server middleware chain so rejected requests do not consume expensive work. Use `selector.Server(...)` when only selected operations require a different policy. Return the standard limit error to preserve predictable HTTP/gRPC mapping instead of writing a transport-specific rejection.

The completion callback receives handler outcome information. A custom limiter can use it for adaptive policy, but it must be safe under concurrent requests and must not block request completion indefinitely. Capacity limits remain a deployment and service-design decision.

The default is an adaptive BBR-style limiter owned by the framework. Its
internal tuning is not a public configuration API. Use `WithLimiter` when the
service requires a fixed quota, distributed quota, tenant-aware policy, or
provider-specific implementation, and expose rejection counts through the
application's metrics system.
