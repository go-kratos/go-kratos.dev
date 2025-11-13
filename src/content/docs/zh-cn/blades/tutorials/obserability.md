---
title: "可观测性"
description: "对中间件OpenTelemetry在Blades中的集成进行说明"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/middleware-otel/main.go"]
---
Blades 嵌入了OpenTelemetry（简称OTel）作为可观测性解决方案（关于对OTel的说明可以参考 `https://go-kratos.dev/zh-cn/blog/tags/opentelemetry/` ），目标是用一套API和工具，就能将应用遥测数据发送到任何兼容的后端而无需为每个后端写不同的代码。

## 代码示例
接下来我们讲解一个代码示例，使用OpenTelemetry对Agent的调用过程进行追踪，并将追踪数据输出。首先导入依赖：
```go
import (
	"context"
	"log"
	"time"

	// OpenTelemetry 
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.34.0"

	// Blades 
	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	middleware "github.com/go-kratos/blades/contrib/otel"
)
```
:::note
在运行本示例前，请先检查是否配置APIKEY和BASE_URL。
:::
### 设置 OpenTelemetry
配置一个追踪器，将追踪信息（如请求的开始和结束时间等）打印到标准输出。
```go
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
			sdktrace.WithBatcher(exporter, sdktrace.WithBatchTimeout(1*time.Millisecond)),
			sdktrace.WithResource(resource),
		),
	)
```
### 创建Agent并集成追踪中间件
使用Blades框架创建一个名为“OpenTelemetry Agent”的Agent。你可以自己指定所需的模型，并通过OpenAI兼容的接口进行通信。在创建Agent的过程中加入OpenTelemetry中间件（这样Agent执行的每一步都会被自动追踪了😀）。
```go
agent, err := blades.NewAgent(
		"OpenTelemetry Agent",
		blades.WithMiddleware(middleware.Tracing()),
		blades.WithModel("qwen-max"),
		blades.WithProvider(openai.NewChatProvider()),
	)
	if err != nil {
		log.Fatal(err)
	}
```
### 执行任务
```go
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
```
### 输出结果与追踪数据
输出结果如下：
```bash
2025/11/13 23:04:17 **March 21st**

Spring arrived today, not with a fanfare, but a whisper. A single, brave crocus pierced the damp earth. The air, once sharp, now carries the sweet, earthy scent of thawing soil. From a high branch, a robin’s song punctuates the quiet.    

I shed my heavy coat, feeling the weak but determined sun warm my face. The world is stretching, waking from its grey slumber. In the garden, buds swell tight, holding their green secrets close. There’s a promise in the breeze, a feeling that everything is beginning again. Hope, it seems, is perennial.
{"Name":"invoke_agent OpenTelemetry Agent","SpanContext":{"TraceID":"6c0b148c407979350ba1fb3a1a5dd557","SpanID":"30c2f708819e64ca","TraceFlags":"01","TraceState":"","Remote":false},"Parent":{"TraceID":"00000000000000000000000000000000","SpanID":"0000000000000000","TraceFlags":"00","TraceState":"","Remote":false},"SpanKind":1,"StartTime":"2025-11-13T23:04:10.7582879+08:00","EndTime":"2025-11-13T23:04:17.1580255+08:00","Attributes":[{"Key":"gen_ai.operation.name","Value":{"Type":"STRING","Value":"invoke_agent"}},{"Key":"gen_ai.system","Value":{"Type":"STRING","Value":"_OTHER"}},{"Key":"gen_ai.agent.name","Value":{"Type":"STRING","Value":"OpenTelemetry Agent"}},{"Key":"gen_ai.agent.description","Value":{"Type":"STRING","Value":""}},{"Key":"gen_ai.request.model","Value":{"Type":"STRING","Value":"deepseek-chat"}},{"Key":"gen_ai.request.top_p","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.request.seed","Value":{"Type":"INT64","Value":0}},{"Key":"gen_ai.request.temperature","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.request.stop_sequences","Value":{"Type":"STRINGSLICE","Value":[]}},{"Key":"gen_ai.request.presence_penalty","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.request.frequency_penalty","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.conversation.id","Value":{"Type":"STRING","Value":"5233e8c9-6513-42fe-b647-fcb8b27e7c24"}},{"Key":"gen_ai.response.finish_reasons","Value":{"Type":"STRINGSLICE","Value":["stop"]}},{"Key":"gen_ai.usage.input_tokens","Value":{"Type":"INT64","Value":14}},{"Key":"gen_ai.usage.output_tokens","Value":{"Type":"INT64","Value":132}}],"Events":null,"Links":null,"Status":{"Code":"Ok","Description":""},"DroppedAttributes":0,"DroppedEvents":0,"DroppedLinks":0,"ChildSpanCount":0,"Resource":[{"Key":"service.name","Value":{"Type":"STRING","Value":"otel-demo"}}],"InstrumentationScope":{"Name":"blades","Version":"","SchemaURL":"","Attributes":null},"InstrumentationLibrary":{"Name":"blades","Version":"","SchemaURL":"","Attributes":null}}
```