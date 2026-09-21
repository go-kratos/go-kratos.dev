---
id: logging
title: 日志 Middleware
description: 使用 log/slog 记录完成的 Kratos v3 transport 调用。
---

Logging middleware 会在每个 handler 完成后输出一条结构化记录。它接收 `*slog.Logger`；传入 `nil` 时使用 `slog.Default()`。

```go
logger := log.NewLogger(log.NewHandler(log.WithWriter(os.Stdout)))
srv := http.NewServer(http.Middleware(logging.Server(logger)))
```

入站调用使用 `logging.Server`，出站调用使用 `logging.Client`。二者都会读取标准化的 transport 信息和 Kratos error。

## 记录的 attribute

记录包含方向（`client` 或 `server`）、transport kind、规范 RPC operation、格式化 request 参数、HTTP 等价 status code、error reason 和以秒为单位的 latency。失败时还包含 error 和其格式化 stack text。成功调用使用 info level，返回错误的调用使用 error level。

Request 按以下顺序格式化：

1. Request 实现 `logging.Redacter` 时调用 `Redact() string`。
2. 否则，对实现 `fmt.Stringer` 的值调用 `String()`，生成的 protobuf message 属于此类。
3. 其它值使用 `%+v` 格式化。

可能包含密钥的应用 request type 应实现 `Redact`。Logger key filter 可作为第二层保护，但无法对已经展平到 `args` string 中的内容脱敏。

## Context attribute

通过 `log.ContextWithAttrs` 添加 request value，并使用同一个 context 写应用日志。`log.NewLogger` 创建的 logger 会把这些 attribute 合并到 record。

Logging 需要使用 metadata/tracing 加入的 context 值时，应放在它们内层。如果 recovered panic 也要作为 error 返回给 logging 并产生 completed-call record，应把 logging 放在 recovery 外层。

v2 `log.Logger`、`log.Helper` 和 `log.NewStdLogger` API 与 v3 不兼容。Handler 配置见[日志](/zh-cn/docs/component/log/)。
