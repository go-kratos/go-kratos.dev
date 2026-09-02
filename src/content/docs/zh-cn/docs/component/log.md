---
id: log
title: 日志
description: Kratos v3 日志基于 Go 标准库 log/slog，提供结构化属性、可组合 Handler 和 OpenTelemetry 集成。
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---

日志可以帮助我们观察程序行为、诊断故障和配置告警。Kratos v3 使用 Go 标准库的 [`log/slog`](https://pkg.go.dev/log/slog) 模型，日志记录采用结构化形式，可以交给标准库 Handler，也可以接入自定义 Handler。

## 设计理念

v3 日志包主要包含两个标准库基础类型：

- `slog.Logger` 创建日志记录，并提供 `Info`、`Warn`、`Error` 等方法。
- `slog.Handler` 编码和写出日志记录，可以输出文本或 JSON，也可以设置等级阈值，或者替换为可观测性后端。

Kratos 在这些标准库类型之上提供了简单的构建工具：

- `log.NewHandler` 创建带有 Kratos 默认配置的 Handler：输出到 stderr，默认使用文本格式和 `Info` 等级，并自动合并通过 `ContextWithAttrs` 绑定的属性。
- `log.NewLogger` 用 Kratos 的 context 属性提取和过滤能力包装已有 Handler。
- 包级别的日志方法使用通过 `log.SetDefault` 注册的默认 Logger。

这样业务代码只依赖 `*slog.Logger`，而 Handler 可以根据环境替换为本地输出、JSON 日志收集或可观测性平台。

## 基本使用

创建 Handler 和 Logger。如果项目需要随时使用包级别的日志方法，可以在初始化时注册为默认 Logger：

```go
package main

import (
	"context"
	"os"

	"github.com/go-kratos/kratos/v3/log"
)

func main() {
	logger := log.NewLogger(log.NewHandler(
		log.WithWriter(os.Stdout),
		log.WithFormat(log.FormatJSON),
	))
	log.SetDefault(logger)

	log.Info("service started", "service.name", "helloworld")
	log.InfoContext(context.Background(), "request completed", "request_id", "req-1")
}
```

如果直接使用标准库创建 Handler，可以通过 `slog.New` 创建 Logger：

```go
handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
	Level: slog.LevelInfo,
})
logger := slog.New(handler)
logger.Info("service started", "service.name", "helloworld")
```

## 全局 Logger

包级别的方法与对应的 `slog.Logger` 方法保持一致。第一个参数是日志消息，后面可以传入键值对或类型明确的 `slog.Attr`：

```go
log.Debug("cache miss", "key", key)
log.Info("user created", slog.String("user_id", userID))
log.Warn("retrying request", "attempt", attempt)
log.Error("request failed", "error", err)
log.InfoContext(ctx, "request completed", "request_id", requestID)
```

在应用初始化时调用 `log.SetDefault`，即可修改这些包级别方法所使用的 Logger。`log.Default` 返回当前的默认 Logger。

```go
logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.FormatJSON),
	log.WithLevel(log.LevelDebug),
))
log.SetDefault(logger)
```

v3 不再提供 `DefaultLogger`、`SetLogger` 和 `NewHelper`。需要显式依赖日志的组件应直接注入 `*slog.Logger`，不要依赖全局状态。

## Builder 和属性

当项目自己管理日志输出位置时，可以使用 `log.NewHandler`。当项目已经有 `slog.Handler`，或者还需要增加 Kratos 的过滤和 context 属性提取能力时，可以使用 `log.NewLogger`。

```go
logger := log.NewLogger(
	log.NewHandler(
		log.WithWriter(os.Stdout),
		log.WithFormat(log.FormatJSON),
		log.WithLevel(log.LevelDebug),
		log.WithAddSource(true),
	),
).With(
		slog.String("service.name", serviceName),
		slog.String("service.version", version),
)

logger.Info("service ready", "addr", address)
```

使用 `With` 为 Logger 的每条日志添加固定属性。使用 `WithGroup` 可以把相关属性放进同一组：

```go
requestLogger := logger.WithGroup("request")
requestLogger.Info("finished", "id", requestID, "latency_ms", latency)
```

`slog.String`、`slog.Int` 和 `slog.Any` 等类型化属性可以明确值的类型。简单日志可以使用键值对；当属性来自一个切片时，使用 `LogAttrs` 更合适：

```go
logger.LogAttrs(ctx, log.LevelInfo, "user created",
		slog.String("user_id", userID),
		slog.String("source", "api"),
)
```

## Context 属性

使用 `ContextWithAttrs` 将请求范围内的属性绑定到 context。`log.NewLogger` 返回的 Logger 或 `log.NewHandler` 创建的 Handler，会在带 context 的日志调用中自动提取这些属性：

```go
ctx = log.ContextWithAttrs(ctx,
		slog.String("request_id", requestID),
		slog.String("trace_id", traceID),
)

logger.InfoContext(ctx, "handling request")
```

Context 属性只会添加到使用该 context 的日志调用中。对于整个 Logger 生命周期固定的服务名、版本等属性，应使用 `With`。

如果需要从 context 中提取其他数据，可以实现 `log.Extractor`，并通过 `log.WithExtractor` 传入：

```go
logger := log.NewLogger(
	log.NewHandler(),
	log.WithExtractor(func(ctx context.Context) []slog.Attr {
		return []slog.Attr{slog.String("tenant_id", tenantIDFromContext(ctx))}
	}),
)
```

## 过滤和脱敏

当日志需要脱敏或丢弃时，使用 `log.WithFilter` 在底层 Handler 之前处理日志记录。

`log.FilterKey` 会把匹配属性的值替换成 `***`。它支持 `password` 这样的叶子键，也支持 `user.password` 这样的点号路径：

```go
logger := log.NewLogger(
	log.NewHandler(log.WithFormat(log.FormatJSON)),
	log.WithFilter(log.FilterKey("password", "token", "user.password")),
)

logger.Info("login", "username", username, "password", password)
```

`log.FilterFunc` 接收已经完成键脱敏的日志记录。返回 `true` 时会丢弃该记录：

```go
logger := log.NewLogger(
	log.NewHandler(),
	log.WithFilter(log.FilterFunc(func(_ context.Context, record slog.Record) bool {
		return record.Level < log.LevelInfo
	})),
)
```

过滤器属于 Logger 配置。所有可能接收敏感数据的 Logger，包括传给请求日志中间件的 Logger，都应使用一致的过滤配置。

## 等级和输出

默认 Handler 将文本日志写入 stderr，并输出 `Info` 及以上等级的记录。可以通过 Builder 选项配置输出位置、格式、等级、源码位置和属性替换：

```go
logger := log.NewLogger(log.NewHandler(
	log.WithWriter(os.Stdout),
	log.WithFormat(log.FormatJSON),
	log.WithLevel(log.LevelDebug),
	log.WithAddSource(true),
	log.WithReplaceAttr(func(groups []string, attr slog.Attr) slog.Attr {
		if attr.Key == "password" {
			return slog.String(attr.Key, "***")
		}
		return attr
	}),
))
```

Kratos 提供的等级别名包括 `LevelDebug`、`LevelInfo`、`LevelWarn`、`LevelError` 和 `LevelFatal`。包级别的快捷方法包括 `Debug`、`Info`、`Warn` 和 `Error`；需要传入明确等级时使用 `Log` 或 `LogAttrs`。

## 请求日志中间件

`middleware/logging` 会记录服务端和客户端请求的传输类型、操作、状态码、耗时等信息。它接收 `*slog.Logger`：

```go
import (
	kratoshttp "github.com/go-kratos/kratos/v3/transport/http"
	"github.com/go-kratos/kratos/v3/middleware/logging"
)

srv := kratoshttp.NewServer(
	kratoshttp.Middleware(logging.Server(logger)),
)
```

在 HTTP 或 gRPC 客户端的 middleware 选项中使用 `logging.Client(logger)`，可以记录发出的请求。对于请求对象，如果包含敏感数据，应实现 `Redact() string`；同时还应在 Logger 中通过 `FilterKey` 配置敏感属性脱敏。

## OpenTelemetry 日志

OpenTelemetry Bridge 位于可选的 contrib 模块中。它会把 `slog` 记录转换为 OpenTelemetry Logs；当 context 中存在有效 Span 时，还会增加链路关联属性：

```go
import (
	otellog "github.com/go-kratos/kratos/contrib/otel/v3/log"
	"github.com/go-kratos/kratos/v3/log"
)

logger := log.NewLogger(otellog.NewHandler("helloworld"))
log.SetDefault(logger)
```

可以使用 `otellog.WithLoggerProvider`、`otellog.WithSchemaURL`、`otellog.WithSource` 和 `otellog.WithVersion` 配置 OpenTelemetry `LoggerProvider` 或 Bridge：

```go
logger := log.NewLogger(
	otellog.NewHandler("helloworld", otellog.WithLoggerProvider(provider)),
	log.WithFilter(log.FilterKey("password")),
).With(slog.String("service.name", "helloworld"))
```

contrib 的导入路径是 `github.com/go-kratos/kratos/contrib/otel/v3/log`，核心日志包的导入路径是 `github.com/go-kratos/kratos/v3/log`。

## kratos-layout

v3 项目模板会在应用入口初始化 `*slog.Logger`，再注入到各个 service 层。典型配置如下：

```go
logger := log.NewLogger(log.NewHandler(
	log.WithWriter(os.Stdout),
	log.WithFormat(log.FormatJSON),
)).With(
		slog.String("service.id", id),
		slog.String("service.name", Name),
		slog.String("service.version", Version),
)
```

将 Logger 直接注入 service，并使用带 context 的方法：

```go
func NewGreeterService(uc *GreeterUsecase, logger *slog.Logger) *GreeterService {
	return &GreeterService{uc: uc, log: logger}
}

func (s *GreeterService) SayHello(ctx context.Context, in *v1.HelloRequest) (*v1.HelloReply, error) {
	s.log.InfoContext(ctx, "SayHello received", "name", in.GetName())
	return &v1.HelloReply{Message: "Hello " + in.GetName()}, nil
}
```

当前生成项目的结构可以参考 [kratos-layout](https://github.com/go-kratos/kratos-layout) 仓库。

## 从 v2 迁移

| v2 | v3 |
| --- | --- |
| `github.com/go-kratos/kratos/v2/log` | `github.com/go-kratos/kratos/v3/log` |
| `log.Logger` 和 `log.NewHelper` | `*slog.Logger` 和 `slog.Handler` |
| `log.DefaultLogger` 和 `log.NewStdLogger` | `log.NewHandler` 和 `log.NewLogger` |
| `log.SetLogger` | `log.SetDefault` |
| `Infof`、`Errorf`、`Infow` | `Info`、`Error` 和类型化的 `slog.Attr` |
| `Valuer` | `Logger.With`、`Logger.WithGroup` 或 `ContextWithAttrs` |
| `FilterLevel` 和 `FilterValue` | `WithLevel` 和 `FilterKey` |

v3 API 遵循 `log/slog`，已有实现 `slog.Handler` 接口的 Handler 可以继续复用。升级时请同时更新依赖和导入路径，并检查所有敏感字段是否已纳入新的 Handler 配置。
