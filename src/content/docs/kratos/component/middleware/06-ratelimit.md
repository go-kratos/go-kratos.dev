---
id: ratelimit
title: Rate Limiter
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---

Rate limiter middleware for server-side traffic control, with [bbr limiter](https://github.com/go-kratos/aegis/tree/main/ratelimit/bbr) algorithm implemented by default.

### Configuration

#### `WithLimiter`

Used to replace the default limiter algorithm

```go
// WithLimiter set Limiter implementation,
// default is bbr limiter
func WithLimiter(limiter ratelimit.Limiter) Option {
    return func(o *options) {
        o.limiter = limiter
    }
}
```

The custom limiter needs to implement the `Limiter` interface of [aegis/ratelimit](https://github.com/go-kratos/aegis/blob/main/ratelimit/ratelimit.go).

```go
// Limiter is a rate limiter.
type Limiter interface {
    Allow() (DoneFunc, error)
}
```

### Usage

#### Use rate limiter in Server

```go
var opts = []http.ServerOption{
    http.Middleware(
        // default is bbr limiter
        ratelimit.Server(),
        // custom limiter
        //ratelimit.Server(ratelimit.WithLimiter(limiter)),
    ),
}

srv := http.NewServer(opts...)
```

#### Trigger rate limiter

When the rate limiter is triggered, the current request is rejected directly and error `ErrLimitExceed` will be returned, as defined below:

```go
// ErrLimitExceed is service unavailable due to rate limit exceeded.
var ErrLimitExceed = errors.New(429, "RATELIMIT", "service unavailable due to rate limit exceeded")
```
