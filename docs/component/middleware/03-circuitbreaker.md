---
id: circuitbreaker
title: 熔断器
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

熔断器中间件，用于提供客户端熔断功能，默认实现了[sre breaker](https://github.com/go-kratos/aegis/tree/main/circuitbreaker/sre) 算法。

### 配置

#### `WithGroup`

breaker 依赖于 `container/group` 来实现对于针对不同`Operation`使用互相独立的 breaker。
`WithGroup`可以配置自定义的Group来替换默认的熔断算法：

```go
// WithGroup with circuit breaker group.
// NOTE: implements generics circuitbreaker.CircuitBreaker
func WithGroup(g *group.Group) Option {
	return func(o *options) {
		o.group = g
	}
}
```

默认配置会针对不同的`Operation`生成独立的 breaker：
```go
opt := &options{
	group: group.NewGroup(func() interface{} {
		return sre.NewBreaker()
	}),
}
```

### 使用方法

#### 在 Client 请求中使用熔断器

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithMiddleware(
		circuitbreaker.Client(),
	),
	http.WithEndpoint("127.0.0.1:8000"),
)
```

#### 触发熔断

当熔断器触发时，会在一段时间内对于该`Operation`的调用快速失败，并返回错误`ErrNotAllowed`，定义如下：

```go
// ErrNotAllowed is request failed due to circuit breaker triggered.
var ErrNotAllowed = errors.New(503, "CIRCUITBREAKER", "request failed due to circuit breaker triggered")
```
