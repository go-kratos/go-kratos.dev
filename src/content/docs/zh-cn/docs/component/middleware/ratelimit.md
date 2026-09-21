---
id: ratelimit
title: 限流
---

`ratelimit.Server()` 执行服务端准入控制。limiter 拒绝请求时返回 `ratelimit.ErrLimitExceed`（HTTP 429）；请求获准后，middleware 会在 handler 返回时将错误传给 limiter 的完成回调。

```go
srv := http.NewServer(http.Middleware(ratelimit.Server()))
```

默认 limiter 位于 Kratos internal 实现。默认策略不适合服务时，可通过 `ratelimit.WithLimiter(limiter)` 提供自己的 `ratelimit.Limiter`。limiter 必须实现导出的 `Limiter` contract，包括 `Allow` 返回的完成回调。

```go
type Limiter interface {
	Allow() (DoneFunc, error)
}

type DoneInfo struct {
	Err error
}
```

`Allow` 在 handler 前执行。返回任意非 nil 错误都会拒绝请求，中间件会返回稳定的
`RATELIMIT` 错误，而不会暴露 limiter 内部错误。请求被接收时必须返回非 nil 完成
函数；请求结束后 Kratos 会以 handler 结果调用它一次。

## 应用与观测限制

将 limiter 放在 server middleware chain 外层，使被拒绝请求不会消耗昂贵工作。只有部分 operation 需要不同策略时使用 `selector.Server(...)`。返回标准限流错误以保留可预测的 HTTP/gRPC 映射，不要手写 transport 专属拒绝响应。

完成回调会收到 handler 结果。自定义 limiter 可用于自适应策略，但必须并发安全且不得无限阻塞请求完成。容量限制仍是部署和服务设计决策。

默认实现是框架内部的自适应 BBR 风格 limiter，其内部调优参数不是公开配置 API。
服务需要固定配额、分布式配额、租户策略或供应商实现时使用 `WithLimiter`，并通过
应用自己的指标系统暴露拒绝次数。
