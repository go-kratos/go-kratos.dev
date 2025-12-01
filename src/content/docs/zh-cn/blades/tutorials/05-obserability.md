---
title: "可观测性"
description: "对中间件OpenTelemetry在Blades中的集成进行说明"
reference:
  [
    "https://github.com/go-kratos/blades/blob/main/examples/middleware-otel/main.go",
  ]
---

Blades 为 AI 代理（Agent）应用提供了强大的可观测性能力，包括 Tracing（分布式追踪） 与 性能可视化。通过集成 OpenTelemetry，你可以轻松获得调用链、耗时统计以及系统行为洞察。
本文基于示例代码：
🔗 https://github.com/go-kratos/blades/blob/main/examples/middleware-otel/main.go

## 环境准备

确保你已安装 Go 1.20+ 并在项目中引入依赖：

```bash
go get github.com/go-kratos/blades
go get github.com/go-kratos/blades/contrib/otel
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/sdk/trace
go get go.opentelemetry.io/otel/exporters/stdout/stdouttrace
```

如果你要接入 OpenTelemetry Collector、Jaeger、Zipkin，请替换 Exporter 即可。

## 初始化 Tracer Provider

下面展示了如何初始化一个 OpenTelemetry TracerProvider，用于记录和导出追踪数据：

```go
// 创建并初始化 OpenTelemetry TracerProvider
func createTracerProvider() func(context.Context) error {
    exporter, err := stdouttrace.New(
        stdouttrace.WithPrettyPrint(),
    )
    if err != nil {
        log.Fatal(err)
    }

    resource, err := resource.New(context.Background(),
        resource.WithAttributes(
            semconv.ServiceNameKey.String("blades-performance-monitoring"),
        ),
    )
    if err != nil {
        log.Fatal(err)
    }

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter, sdktrace.WithBatchTimeout(1*time.Millisecond)),
        sdktrace.WithResource(resource),
    )

    otel.SetTracerProvider(tp)

    // 返回 shutdown 方法，以便在 main() 中释放
    return tp.Shutdown
}
```

功能解析

- stdouttrace.New()
  用于将追踪数据以可读格式输出到控制台，便于开发调试。
- resource.New()
  设置服务名称、环境标签等元信息。
- sdktrace.NewTracerProvider()
  批量导出 traces，并绑定资源信息。
- otel.SetTracerProvider()
  将 TracerProvider 注册到全局，使中间件与框架能自动生成 spans。

## 在 Agent 中使用 Tracing 中间件

Blades 提供了统一的中间件机制，可在 Agent 调用前后自动生成 trace spans。

示例：

```go
// Configure OpenAI API key and base URL using environment variables:
model := openai.NewModel("gpt-5", openai.Config{
	APIKey: os.Getenv("OPENAI_API_KEY"),
})
agent, err := blades.NewAgent(
    "Example Agent",
    blades.WithModel(model),
    blades.WithInstruction("Answer briefly."),
    blades.WithMiddleware(
        middleware.Tracing(
            middleware.WithSystem("openai"), // 可选标签，标识 backend
        ),
    ),
)
if err != nil {
    log.Fatal(err)
}
```

## 示例 main 程序

完整可运行的示例代码：

```go
package main

import (
	"context"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.34.0"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	middleware "github.com/go-kratos/blades/contrib/otel"
)

func main() {
	exporter, err := stdouttrace.New()
	if err != nil {
		log.Fatal(err)
	}
	resource, err := resource.New(context.Background(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String("otel-demo"),
		),
	)
	if err != nil {
		log.Fatal(err)
	}
	otel.SetTracerProvider(
		sdktrace.NewTracerProvider(
			sdktrace.WithBatcher(exporter, sdktrace.WithBatchTimeout(15*time.Second)),
			sdktrace.WithResource(resource),
		),
	)
	// Create a blades agent with OpenTelemetry middleware
    model := openai.NewModel("gpt-5", openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	agent, err := blades.NewAgent(
		"OpenTelemetry Agent",
		blades.WithModel(model),
		blades.WithMiddleware(middleware.Tracing()),
	)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("Write a diary about spring, within 100 words")
	runner := blades.NewRunner(agent)
	msg, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(msg.Text())
	// Shutdown the exporter to flush any remaining spans
	if err := exporter.Shutdown(context.Background()); err != nil {
		log.Fatal(err)
	}
}
```

## 总结

通过本文示例，你可以：

- 初始化 OpenTelemetry TracerProvider
- 使用 stdouttrace 导出器调试 Trace
- 在 Agent 中启用 Tracing 中间件
- 让每次 AI 调用自动被追踪，无需侵入性代码

你可以将此扩展到：

- Jaeger / Zipkin / OTLP Collector
- HTTP / gRPC 服务链路追踪
- 自定义 Span 标签和事件

Blades 提供了开箱即用的可观测性体系，使得 AI Agent 项目在生产环境中更易分析、排查与优化。
