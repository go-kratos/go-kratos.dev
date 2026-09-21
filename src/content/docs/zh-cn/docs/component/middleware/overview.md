---
id: overview
title: 中间件概览
---

Kratos 中间件用于包装 RPC 处理函数。HTTP 和 gRPC 使用同一种抽象，因此认证、
校验、日志等请求策略不必为每种传输分别实现。

```go
type Middleware func(Handler) Handler

type Handler func(context.Context, any) (any, error)
```

## 执行顺序

`middleware.Chain(a, b, c)` 的请求侧执行顺序是 `a -> b -> c -> handler`，
响应侧则按相反顺序返回。服务端和客户端的传输选项都会保留传入顺序。

```go
srv := http.NewServer(http.Middleware(
	metadata.Server(),
	tracing.Server(),
	logging.Server(logger),
	recovery.Recovery(recovery.WithLogger(logger)),
	validate.Validator(),
))
```

这个例子先让后续链路获得元数据和追踪上下文。日志包在恢复中间件外层，因此
panic 被恢复为错误后仍会出现在完成日志中。校验紧邻服务处理函数执行。应根据
每个中间件依赖的数据和需要观察的失败来确定顺序，不存在适用于所有服务的固定
排列。

## 可用中间件

v3 核心包含：

| 包 | 常用位置 | 用途 |
| --- | --- | --- |
| `circuitbreaker` | 客户端 | 依赖持续失败时拒绝调用 |
| `logging` | 两端 | 记录操作、耗时、状态和传输信息 |
| `metadata` | 两端 | 在服务调用之间传递选定的请求元数据 |
| `ratelimit` | 服务端 | 通过限流器接收或拒绝工作 |
| `recovery` | 服务端 | 把 panic 转换为 Kratos 错误 |
| `selector` | 两端 | 只对选定操作应用另一个中间件 |
| `validate` | 服务端 | 调用生成的请求校验方法 |

JWT 认证位于 `github.com/go-kratos/kratos/contrib/middleware/jwt/v3`，指标和
追踪位于 `github.com/go-kratos/kratos/contrib/otel/v3`。核心没有提供重试
中间件；请在客户端或应用边界明确重试和幂等策略。

## 安装中间件

一元服务端调用使用 `http.Middleware` 或 `grpc.Middleware`，客户端构造函数
使用 `WithMiddleware`。gRPC 流式调用另有 `StreamMiddleware` 和
`WithStreamMiddleware`，可为长连接配置不同的生命周期或授权策略。

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

HTTP 和 gRPC 服务端还提供 `Use(pattern, middleware...)`。模式匹配规范 RPC
操作名：`/*`、`/package.Service/*` 或 `/package.Service/Method`。生成的绑定
会在执行中间件链之前设置操作名。

## 选择操作

当策略只适用于部分 API 时，使用 `selector.Server` 或 `selector.Client`。
`Path`、`Prefix`、`Regex` 和 `Match` 检查的是
`/todo.v1.TodoService/GetTodo` 这类规范操作名，而不是 HTTP 路径。

```go
auth := selector.Server(jwt.Server(keyFunc)).
	Prefix("/todo.v1.TodoService/").
	Build()
```

## 编写中间件

除非要主动拒绝请求，中间件应当只调用一次 `next`。请求级数据应放入返回的
context，共享状态必须支持并发；属于公开 API 契约的失败应返回 Kratos 错误。

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

中间件需要操作名、端点、请求头或响应头时，使用
`transport.FromServerContext` 或 `transport.FromClientContext`。只有策略确实
与传输有关时，才依赖原生 HTTP 或 gRPC 的 context 类型。
