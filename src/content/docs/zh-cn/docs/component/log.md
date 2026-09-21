---
id: log
title: 日志
---

Kratos v3 使用标准库 `log/slog` API。使用 `log.NewLogger` 创建 `*slog.Logger`，再传给应用和 middleware。这取代了 v2 的 `log.Logger` 与 `log.Helper` 接口。

```go
logger := log.NewLogger(
	slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}),
	log.WithFilter(log.FilterKey("password")),
).With(slog.String("service.name", "example"))

app := kratos.New(kratos.Name("example"), kratos.Logger(logger))
```

## 配置 handler

`log.NewHandler` 使用 Kratos option 构建 text 或 JSON handler，默认向标准输出写入 text。无需自己构造 `slog.Handler`，即可设置格式、writer、最低级别、调用位置和 `slog.HandlerOptions.ReplaceAttr` 回调。

```go
level := new(slog.LevelVar)
level.Set(slog.LevelDebug)

logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.JSONFormat),
	log.WithWriter(os.Stdout),
	log.WithLevel(level),
	log.WithAddSource(true),
))
```

`log.ParseLevel` 接受标准 slog 级别名。通过 `logger.With(...)` 添加应用级字段；调用 `log.SetDefault(logger)` 后，也可使用 `log.With(...)`。

```go
logger = logger.With(
	slog.String("service.name", "example"),
	slog.String("service.version", version),
)
logger.Info("server started", "address", ":8000")
```

## 过滤敏感值

`FilterKey` 按叶子 key 或点分组路径脱敏属性值。创建 Kratos handler 时用 `log.WithFilter` 包装它；自定义 `FilterFunc` 返回 `false` 时可丢弃整条记录。

```go
logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.JSONFormat),
	log.WithFilter(log.FilterKey("password", "authorization.token")),
))
logger.Info("login", "user", "alice", "password", "secret")
```

过滤保护输出，但不会让凭据存储在请求对象中变得安全。优先不要记录敏感值。

## 请求级属性

`log.ContextWithAttrs` 将 `slog.Attr` 添加到 context。由 `NewLogger` 或 `NewHandler` 创建的 logger 会把这些属性添加到使用该 context 的记录中；`log.AttrsFromContext` 返回已保存属性的副本。

```go
ctx = log.ContextWithAttrs(ctx,
	slog.String("request.id", requestID),
	slog.String("trace.id", traceID),
)
logger.InfoContext(ctx, "creating order", "order.id", orderID)
```

一致使用标准 slog 的 `Debug`、`Info`、`Warn`、`Error` 或包级 `log.InfoContext`、`log.ErrorContext`。将该 logger 传给 `logging.Server(logger)` 与 `logging.Client(logger)`，即可记录完成的 transport 调用。

## OpenTelemetry

Kratos core 不配置 OpenTelemetry 日志 exporter。可选集成为 `github.com/go-kratos/kratos/contrib/otel/v3/log`，仅在应用已有 OpenTelemetry 日志 pipeline 时添加。原 Kratos 的 `Logger`、`Helper`、`Valuer` 和 `NewStdLogger` 属于 v2 API，不能与 v3 `slog` 代码混用。