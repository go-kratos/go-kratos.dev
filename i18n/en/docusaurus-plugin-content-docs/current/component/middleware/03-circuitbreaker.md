---
id: circuitbreaker
title: Circuit Breaker
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

Circuit breaker middleware for providing client-side breaker functionality, with [sre breaker](https://github.com/go-kratos/aegis/tree/main/circuitbreaker/sre) algorithm implemented by default。

### Configuration

#### `WithGroup`

breaker depends on `container/group` to implement the use of mutually independent breaker for different `Operation`.
use `WithGroup` to configure a costom group to replace the default breaker algorithm：

```go
// WithGroup with circuit breaker group.
// NOTE: implements generics circuitbreaker.CircuitBreaker
func WithGroup(g *group.Group) Option {
	return func(o *options) {
		o.group = g
	}
}
```

The default configuration generates separate breakers for different `Operation`(s).

```go
opt := &options{
	group: group.NewGroup(func() interface{} {
		return sre.NewBreaker()
	}),
}
```

### Usage

#### Use circuit breaker in client

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithMiddleware(
		circuitbreaker.Client(),
	),
	http.WithEndpoint("127.0.0.1:8000"),
)
```

#### Trigger circuit breaker

When the breaker is triggered, the client call for this `Operation` fails quickly for a period of time and returns the error `ErrNotAllowed` immediately，which defined as follows：

```go
// ErrNotAllowed is request failed due to circuit breaker triggered.
var ErrNotAllowed = errors.New(503, "CIRCUITBREAKER", "request failed due to circuit breaker triggered")
```
