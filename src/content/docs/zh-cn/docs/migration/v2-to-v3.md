---
id: v2-to-v3
title: 从 v2 迁移到 v3
description: Kratos v2 与 v3 的差异及安全升级顺序。
---

Kratos v3 修改了 module 主版本，采用 `log/slog`，把可选依赖移出 core，并移除了公开 HTTP binding package。升级应视为一次代码迁移，然后重新生成并完成集成测试；只把 `/v2` 替换为 `/v3` 并不够。

本文比较最后一个 v2 版本 v2.9.2 与 Kratos v3，并结合框架的[官方迁移说明](https://github.com/go-kratos/kratos/blob/main/docs/migration/v2-to-v3.md)。

## 差异总览

| 范围 | v2 | v3 | 升级动作 |
| --- | --- | --- | --- |
| Go module | `github.com/go-kratos/kratos/v2` | `github.com/go-kratos/kratos/v3` | 修改 core import 与依赖 |
| Go 基线 | v2.9.2 使用 Go 1.22 | v3.0.0 使用 Go 1.25 | 升级构建、CI 和运行工具链 |
| CLI/generator | `/v2` command module | `/v3` command module | 重新安装工具并生成输出 |
| 日志 | Kratos `Logger`、`Helper`、`Valuer` | 标准 `*slog.Logger` 和 slog handler | 重写 logger 构造与调用 |
| JSON | 一个 `json` codec 混合 Go/protobuf 语义 | 独立 `json` 与 `protojson` codec | 显式选择 wire 行为 |
| JWT | Core `middleware/auth/jwt` | 独立 contrib JWT module | 修改 import 并添加 module |
| Metrics/tracing | Core middleware 依赖 OpenTelemetry | 独立 OpenTelemetry contrib module | 修改 import 并管理 provider 生命周期 |
| Circuit breaker | Core 使用 Aegis 及其 option | 内置默认实现与 `WithBreakerFactory` | 适配自定义 breaker 注入 |
| HTTP binding | 导出的 `transport/http/binding` | Context binding 与 `BuildPath` | 重新生成并替换手写调用 |

## 1. 升级工具链

修改 module 前先安装 v3 支持的 Go 版本，并一起更新本地开发、CI image、Docker builder、linter 和代码生成任务。旧版 Go 无法使用 `go` directive 要求 1.25 的 module。

重新安装 v3 CLI 和 generator，避免 `PATH` 前部残留 v2 binary：

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
go install github.com/go-kratos/kratos/cmd/protoc-gen-go-http/v3@latest
go install github.com/go-kratos/kratos/cmd/protoc-gen-go-errors/v3@latest
kratos --version
```

使用 Buf remote/local plugin 声明的项目也要更新其中的 module path。为了生成结果可重复，应优先使用项目固定版本的 generator 命令。

## 2. 更新 core 与 contrib module

修改全部 core import 并添加 v3：

```go
// v2
import "github.com/go-kratos/kratos/v2"

// v3
import "github.com/go-kratos/kratos/v3"
```

```bash
go get github.com/go-kratos/kratos/v3@latest
go mod tidy
go list -m all
```

Contrib 集成是独立 module。每个依赖都要更新到自己的 `/v3` path，并检查其版本，不能假设 core 版本会自动控制它。重新生成前，应在 source、generator 文件、tools module、测试 fixture、Dockerfile 和 CI 中搜索 `/v2`。

## 3. 将日志迁移到 slog

v3 应用和 middleware option 接收 `*slog.Logger`。替换 v2 `log.Logger`、`log.Helper`、`log.Valuer`、`log.NewStdLogger` 以及 helper 特有的 trace/service field。

```go
logger := log.NewLogger(
	slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}),
	log.WithFilter(log.FilterKey("password")),
).With(
	slog.String("service.name", "orders"),
	slog.String("service.version", version),
)

app := kratos.New(
	kratos.Name("orders"),
	kratos.Logger(logger),
)
```

请求级日志使用 `logger.InfoContext` 或 `log.InfoContext`。第三方 Kratos logger adapter 应替换为该日志库提供的 `slog.Handler`，或由应用维护 adapter。OpenTelemetry log 支持位于 `github.com/go-kratos/kratos/contrib/otel/v3/log`。

## 4. 选择 JSON 行为

v3 在 core 中注册两个名称：

- `encoding/json` 是 subtype 为 `json` 的标准 Go JSON。
- `encoding/protojson` 是 subtype 为 `protojson` 的 protobuf JSON。
- `contrib/encoding/json/v3` 在迁移期间以 subtype `json` 保留 v2-compatible 混合行为。

新的 v3 代码应选择 client 期望的表示：

```go
import (
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
)
```

除非有意替换，否则不要同时注册 core `json` 和兼容 `json` codec。Codec 注册是全局的，后注册者会覆盖前者。修改 wire 行为前，应为 protobuf field name、默认值、enum、timestamp 和未知字段处理添加 contract test。

## 5. 把可选 middleware 移到 contrib

JWT 已从 core 移出：

```go
// v2
import "github.com/go-kratos/kratos/v2/middleware/auth/jwt"

// v3
import "github.com/go-kratos/kratos/contrib/middleware/jwt/v3"
```

```bash
go get github.com/go-kratos/kratos/contrib/middleware/jwt/v3@latest
```

Core `middleware/metrics` 和 `middleware/tracing` 也分别移到 `github.com/go-kratos/kratos/contrib/otel/v3/metrics` 与 `/tracing`。应用现在显式管理 OpenTelemetry provider、exporter、resource、sampling 和 shutdown。修改 middleware import 后，应确认 provider 在 transport 停止后 flush。

## 6. 适配自定义 circuit breaker

默认 `circuitbreaker.Client()` 用法仍然有效。v3 从 core 移除 Aegis，并通过 middleware package 暴露最小 breaker contract。

```go
middleware := circuitbreaker.Client(
	circuitbreaker.WithBreakerFactory(func() circuitbreaker.CircuitBreaker {
		return newBreaker()
	}),
)
```

将 v2 `WithGroup`/`WithCircuitBreaker` 自定义改为 `WithBreakerFactory`，并为每个 operation 返回独立 breaker。如果实现仍使用 Aegis，应用要直接声明 Aegis 依赖。

## 7. 替换 HTTP binding import

公开的 `transport/http/binding` 目录已移除。重新生成的 v3 HTTP 文件会使用当前 API。手写代码应：

- 把 `binding.EncodeURL` 替换为 `http.BuildPath`；
- 在 handler 中使用 `http.Context.Bind`、`BindVars`、`BindQuery` 或 `BindForm`；
- 只有低层 query/form 转换才直接使用 `encoding/form`。

```go
path := http.BuildPath("/v1/users/{id}", &struct {
	ID string `json:"id"`
}{ID: "42"})
```

删除 v2 前先搜索直接 binding import。生成文件应重新生成，不应手工编辑。

## v3 新增能力

完成必需迁移后，v3 还提供生成的 SSE/WebSocket HTTP streaming、泛型
`config.Get[T]`、自定义 validation callback、slog handler 与 context attribute、
独立的 Go JSON/protobuf JSON codec，以及新的 error helper。这些是可选的服务功能，
不是升级步骤。接口、示例与采用时的注意点见
[Kratos v3 新功能](/zh-cn/docs/migration/v3-new-features/)。

## 按依赖顺序重新生成

更新 source import 与 generator path 后执行：

```bash
make api
make config
go generate ./...
go mod tidy
go test ./...
go vet ./...
```

实际命令以项目自身定义为准。审查生成 diff 中是否出现意外 route、JSON、error 和 service interface 变化。Logger constructor 或 provider signature 改变后要重新运行 Wire。

## 部署检查清单

- [ ] 开发、CI、builder 和 runtime image 使用与 v3 兼容的 Go 版本。
- [ ] Core、CLI、generator 和 contrib path 不再指向 `/v2`。
- [ ] Logger 构造和 middleware 使用 `*slog.Logger`。
- [ ] JSON 行为有 contract test，且没有重复 `json` 注册。
- [ ] JWT、OpenTelemetry module、provider 和 cleanup 均为显式配置。
- [ ] 自定义 circuit breaker factory 返回隔离的实例。
- [ ] 手写 HTTP binding import 已替换。
- [ ] Protobuf、HTTP/gRPC、error、config、Ent 和 Wire 输出已重新生成。
- [ ] Unit、integration、HTTP/gRPC contract、启动和优雅停止测试通过。
- [ ] 在 staging 环境检查服务发现 metadata/endpoint 和 telemetry。

按服务现有兼容性策略逐步发布。v2 与 v3 实例共存期间，应保持 protobuf field、HTTP path、error reason、服务发现名称和 JSON 语义，直到所有调用方迁移完成。
