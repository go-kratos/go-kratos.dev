---
id: circuitbreaker
title: 熔断器
---

`circuitbreaker.Client()` 保护出站调用。它为每个 client operation 维护一个熔断器；请求被本地拒绝时返回 `circuitbreaker.ErrNotAllowed`（HTTP 503）。

```go
conn, err := grpc.NewClient(ctx,
    grpc.WithEndpoint("dns:///orders.example:9000"),
    grpc.WithMiddleware(circuitbreaker.Client()),
)
```

v3 默认熔断器是 Kratos internal 实现，核心不再依赖 Aegis。要使用其他实现，传入 `circuitbreaker.WithBreakerFactory(func() circuitbreaker.CircuitBreaker { ... })`。Internal Server、Service Unavailable 与 Gateway Timeout 错误会标记为失败，其他响应标记为成功。

## 配置行为

factory 会为每个 client operation 惰性调用。它必须返回独立的 `CircuitBreaker` 实例；跨无关 operation 共享可变状态会改变隔离语义。实现需要在 `Allow` 判断准入，并通过 `MarkSuccess`、`MarkFailed` 记录结果。

```go
type CircuitBreaker interface {
	Allow() error
	MarkSuccess()
	MarkFailed()
}
```

只有返回错误映射为 Internal Server Error、Service Unavailable 或 Gateway Timeout
时，Kratos 才把调用标记为失败。客户端输入错误和授权错误等其他失败会调用
`MarkSuccess`，因为它们不能说明依赖不可用。本地拒绝的请求也会调用
`MarkFailed`，使 breaker 继续观察丢弃情况。

熔断是 client 侧保护，不替代 timeout、容量规划或 server 侧限流。记录 operation 和拒绝原因，确保 fallback 不会立刻重试同一个被拒绝调用。

中间件从客户端传输 context 获取 key，因此应通过 HTTP 或 gRPC 客户端安装。把它
应用到没有客户端传输 context 的 handler 属于不支持用法。作为 stream middleware
使用时，返回结果只代表建立 stream；后续 `Send` 和 `Recv` 的失败不会自动反馈给
此中间件。
