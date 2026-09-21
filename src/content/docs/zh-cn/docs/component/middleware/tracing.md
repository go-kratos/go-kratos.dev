---
id: tracing
title: 链路追踪
description: 使用 Kratos v3 contrib middleware 传播并记录 OpenTelemetry span。
---

Tracing 已从 core 移至 `github.com/go-kratos/kratos/contrib/otel/v3/tracing`。应用负责创建 OpenTelemetry tracer provider 和 exporter，contrib module 提供 transport middleware 与 propagation。

```go
serverTracing := tracing.Server(
	tracing.WithTracerProvider(provider),
	tracing.WithTracerName("todo-service"),
)
clientTracing := tracing.Client(
	tracing.WithTracerProvider(provider),
	tracing.WithTracerName("todo-service"),
)
```

未传 provider 时，constructor 使用全局 OpenTelemetry provider。默认 tracer name 为 `kratos`。默认 propagator 组合 Kratos metadata、W3C baggage 和 W3C trace context；只有整个服务集群已经选择另一套兼容策略时才使用 `WithPropagator`。

## Server 与 client 行为

Server middleware 从请求 header 提取 parent context，以规范 RPC operation 为名称启动 server span，记录 request attribute，并根据 reply/error 结束 span。Client middleware 启动 client span，并在出站调用前注入 propagation header。

Error 会被记录到 span。Kratos error code 会写入 `rpc.status_code`；reply 实现 `proto.Message` 时会记录 protobuf reply size。只有存在 transport context 时 middleware 才能完成这些操作。

## 关联日志

`TraceID`、`SpanID` 和 `TraceAttrs` 从 active span context 读取值。当前 layout 把 `tracing.TraceAttrs` 传给 `log.WithExtractor`，使使用 request context 写出的日志包含 trace/span ID。

```go
logger := log.NewLogger(
	slog.NewTextHandler(os.Stdout, nil),
	log.WithExtractor(tracing.TraceAttrs),
)
```

应使用带 request context 的 `InfoContext`/`ErrorContext`；使用 background context 的 package helper 无法取得 active span。

## 停止与 sampling

Provider 应在 transport server 前创建，并在它们停止后 shutdown，同时设置有限的 flush 时间。Resource identity、sampling、batching、exporter TLS 和凭据都由应用配置，Kratos middleware 不会替应用选择这些策略。
