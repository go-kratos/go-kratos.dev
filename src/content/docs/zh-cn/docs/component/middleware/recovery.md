---
id: recovery
title: 恢复
---

`recovery.Recovery()` 将 handler 中的 panic 转换为错误，使服务进程继续运行。默认返回 `recovery.ErrUnknownRequest`。

```go
srv := grpc.NewServer(grpc.Middleware(
    recovery.Recovery(recovery.WithLogger(logger)),
))
```

logger 必须是 `*slog.Logger`。使用 `recovery.WithHandler(func(ctx context.Context, req, err any) error { ... })` 选择 panic 后返回的错误。默认 handler 返回 `ErrUnknownRequest`；自定义 handler 的返回值会替换它，包括 `nil`。

通常应返回非 nil 的公开错误。返回 `nil` 会让调用以 nil error 和 nil reply 结束，
可能使客户端和指标无法发现失败。自定义 handler 的 context 中还包含
`recovery.Latency{}`，其值是 `float64` 类型的已耗时秒数，可用于上报。

## 生产行为

Recovery 总会通过 logger 记录恢复值、请求和当前 goroutine stack。可用自定义 handler 上报或分类，再返回安全的 Kratos error。不要向 HTTP/gRPC client 暴露 panic 值或 stack trace。

如果完成日志需要记录转换后的错误，应把 recovery 放在 logging 内层；同时它必须
位于所有需要捕获 panic 的中间件外层。Recovery 只能保护嵌套在它内部的中间件和
handler。

recovery 是最后保护，不是常规控制流。修复 panic 根因并添加测试；panic 前部分修改的资源仍可能需要应用专属清理或补偿逻辑。
