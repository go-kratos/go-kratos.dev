---
id: plugin
title: 集成与 Contrib Module
description: 通过显式接口和独立 contrib module 扩展 Kratos v3。
---

Kratos 不存在运行时 plugin loader。扩展是普通 Go module，在编译期接入 core interface 或 middleware constructor。依赖会清楚地出现在 `go.mod` 中，初始化和清理也由应用负责。

## 扩展点

| 需求 | Core contract | 可用的 contrib module |
| --- | --- | --- |
| 远程配置 | `config.Source` 和 `config.Watcher` | Apollo、Consul、etcd、Kubernetes、Nacos、Polaris |
| 注册与发现 | `registry.Registrar`、`Discovery`、`Watcher` | Consul、discovery、etcd、Eureka、Kubernetes、Nacos、Polaris、ServiceComb、ZooKeeper |
| 身份认证 | `middleware.Middleware` | JWT |
| 可观测性 | `middleware.Middleware`、`slog.Handler`/extractor | OpenTelemetry log、metrics、tracing |
| Encoding | `encoding.Codec` | v2-compatible JSON、MessagePack |
| Error tracking | middleware/integration API | Sentry |
| Transport | `transport.Server` 和生成 contract | MCP transport module |

不同 provider 的 option 和运维保证并不完全相同，准确行为应以所选 module 的 README 和代码为准。

## 加入集成

使用 module 的 `/v3` path，固定经过审查的版本，并在 composition root 初始化。需要集成的 package 只接收 core interface。例如应用启动代码可把 provider 传给 `kratos.Registrar`，出站 HTTP/gRPC client 则通过 `WithDiscovery` 接收它。

Provider 凭据和 endpoint 应放在配置中。如果 provider 拥有连接或 watcher，其 constructor 应返回 cleanup，由 Wire 或应用在 transport 停止后关闭。

## 测试边界

业务 package 应依赖 domain repository interface，不能依赖注册中心、配置 provider 或 telemetry SDK type。单元测试可使用 `registry.Discovery` 或 `config.Source` 的小型 fake；集成测试覆盖 provider 特有的认证、watch、重连和停止行为。

Core 与 contrib 拥有独立 `go.mod`。依赖 core `v3.0.0` 不会自动选择匹配的 contrib 版本；升级时还要审查 contrib module 自身的版本和传递依赖。
