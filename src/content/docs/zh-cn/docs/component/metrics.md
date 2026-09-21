---
id: metrics
title: 指标
description: 为 Kratos v3 服务配置 OpenTelemetry metrics。
---

Kratos v3 core 不提供 metrics facade 或 exporter。请求 instrumentation 位于独立的 `github.com/go-kratos/kratos/contrib/otel/v3/metrics` module，并使用应用提供的 OpenTelemetry metric instrument。

## 职责划分

应用必须构造并停止自己的 OpenTelemetry SDK meter provider、reader 和 exporter。Kratos contrib middleware 只在 HTTP/gRPC handler 周围记录请求数量与耗时。导出间隔、temporality、resource attribute、endpoint 认证和重试策略属于 SDK/exporter 配置。

应在 server 之前初始化 provider，将其设为全局 provider 或用它的 meter 构造 instrument，并在 transport 停止后 flush/shutdown。Provider 启动失败应作为应用启动失败处理。

## Instrument 与 label

Contrib package 提供 `Int64Counter` 和 `Float64Histogram` helper。默认名称为：

| 方向 | Counter | Duration histogram |
| --- | --- | --- |
| Server | `server_requests_code_total` | `server_requests_seconds` |
| Client | `client_requests_code_total` | `client_requests_seconds` |

Counter 记录 `kind`、`operation`、HTTP 等价 `code` 和 Kratos error `reason`。Histogram 记录 `kind` 和 `operation`，耗时单位是秒。提供的 histogram helper 使用从 5 ms 到 1 s 的显式 bucket boundary。

Operation name 来自生成的 RPC descriptor，例如 `/todo.v1.TodoService/GetTodo`，因此基数有界。不要把 request ID、user ID、原始 URL 或无界错误消息加入 metric label。

## 导出与 dashboard

可选择 Prometheus、OTLP 或 OpenTelemetry 支持的其它 exporter。Kratos 默认不会选择或配置 exporter。Endpoint 和凭据应放在运行时配置中；dashboard 和 alert 依赖 instrument name 后，应保持名称稳定。

构造方式见[指标 Middleware](/zh-cn/docs/component/middleware/metrics/)，导出 API 可查阅 [metrics package](https://github.com/go-kratos/kratos/tree/main/contrib/otel/metrics)。
