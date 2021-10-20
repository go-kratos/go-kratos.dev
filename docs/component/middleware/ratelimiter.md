---
id: ratelimiter
title: 限流器
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

限流器器中间件，默认使用[bbr limiter](https://github.com/go-kratos/aegis/tree/main/ratelimit/bbr)算法

### 配置

`WithLimiter`可以替换默认的限流算法

```go
// WithLimiter set Limiter implementation,
// default is bbr limiter
func WithLimiter(limiter ratelimit.Limiter) Option {
	return func(o *options) {
		o.limiter = limiter
	}
}
```

所提供的限流器需要实现 aegis 的 Limiter 接口, 更多信息可以参考[aegis/ratelimit](https://github.com/go-kratos/aegis/blob/main/ratelimit/ratelimit.go)
```go
// Limiter is a rate limiter.
type Limiter interface {
	Allow() (DoneFunc, error)
}
```

### 使用方法

```go
var opts = []http.ServerOption{
	http.Middleware(
		ratelimit.Server(),
	),
}

srv := http.NewServer(opts...)
```

当触发限流器时，会直接拒绝当前请求，并返回错误`ErrLimitExceed`

```go
// ErrLimitExceed is service unavailable due to rate limit exceeded.
var ErrLimitExceed = errors.New(429, "RATELIMIT", "service unavailable due to rate limit exceeded")
```
