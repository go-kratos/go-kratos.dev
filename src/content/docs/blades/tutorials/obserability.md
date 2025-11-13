---
title: "Observability"
description: "Explanation of OpenTelemetry middleware integration in Blades"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/middleware-otel/main.go"]
---
Blades embeds OpenTelemetry (abbreviated as OTel) as an observability solution (for an explanation of OTel, refer to `https://go-kratos.dev/zh-cn/blog/tags/opentelemetry/`). The goal is to use a single set of APIs and tools to send application telemetry data to any compatible backend without writing different code for each backend.

## Code Example
Next, we'll explain a code example that uses OpenTelemetry to trace the Agent's invocation process and output the trace data.
:::note
Before running this example, please check if APIKEY and BASE_URL are configured.
:::
### Setting up OpenTelemetry
Configure a tracer to print trace information (such as request start and end times) to standard output.
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
`stdouttrace.New()` creates an exporter that determines where trace data is sent.
`resource.New(...)` creates a resource object, where a resource is the entity that generates telemetry data.
`semconv.ServiceNameKey.String("otel-demo")` adds a name to this service. This way, when viewing trace data, you'll know which service the data comes from.
`otel.SetTracerProvider(...)` is a global setting for OpenTelemetry.
`sdktrace.NewTracerProvider(...)` creates a tracer provider instance.
`sdktrace.WithBatcher(exporter, ...)` tells the tracer provider to use batch mode for sending data. It collects a batch of trace data (called "Spans") and sends them all at once via the exporter, rather than sending each Span immediately.
`sdktrace.WithBatchTimeout(1*time.Millisecond)` sets the batch timeout duration. Here it's set very short (1 millisecond), so data will be output almost immediately, which is convenient for demonstration.
`sdktrace.WithResource(resource)` attaches the previously created resource object with service name information to the tracer provider.
### Create Agent and Integrate Tracing Middleware
Use the Blades framework to create an Agent named "OpenTelemetry Agent". You can specify the desired model yourself and communicate through an OpenAI-compatible interface. Add OpenTelemetry middleware during Agent creation (so every step executed by the Agent will be automatically traced 🤔).
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
### 🚀 Execute Task
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
### Output Results and Trace Data
The output results are as follows:
```bash
2025/11/13 23:04:17 **March 21st**

Spring arrived today, not with a fanfare, but a whisper. A single, brave crocus pierced the damp earth. The air, once sharp, now carries the sweet, earthy scent of thawing soil. From a high branch, a robin’s song punctuates the quiet.    

I shed my heavy coat, feeling the weak but determined sun warm my face. The world is stretching, waking from its grey slumber. In the garden, buds swell tight, holding their green secrets close. There’s a promise in the breeze, a feeling that everything is beginning again. Hope, it seems, is perennial.
{"Name":"invoke_agent OpenTelemetry Agent","SpanContext":{"TraceID":"6c0b148c407979350ba1fb3a1a5dd557","SpanID":"30c2f708819e64ca","TraceFlags":"01","TraceState":"","Remote":false},"Parent":{"TraceID":"00000000000000000000000000000000","SpanID":"0000000000000000","TraceFlags":"00","TraceState":"","Remote":false},"SpanKind":1,"StartTime":"2025-11-13T23:04:10.7582879+08:00","EndTime":"2025-11-13T23:04:17.1580255+08:00","Attributes":[{"Key":"gen_ai.operation.name","Value":{"Type":"STRING","Value":"invoke_agent"}},{"Key":"gen_ai.system","Value":{"Type":"STRING","Value":"_OTHER"}},{"Key":"gen_ai.agent.name","Value":{"Type":"STRING","Value":"OpenTelemetry Agent"}},{"Key":"gen_ai.agent.description","Value":{"Type":"STRING","Value":""}},{"Key":"gen_ai.request.model","Value":{"Type":"STRING","Value":"deepseek-chat"}},{"Key":"gen_ai.request.top_p","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.request.seed","Value":{"Type":"INT64","Value":0}},{"Key":"gen_ai.request.temperature","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.request.stop_sequences","Value":{"Type":"STRINGSLICE","Value":[]}},{"Key":"gen_ai.request.presence_penalty","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.request.frequency_penalty","Value":{"Type":"FLOAT64","Value":0}},{"Key":"gen_ai.conversation.id","Value":{"Type":"STRING","Value":"5233e8c9-6513-42fe-b647-fcb8b27e7c24"}},{"Key":"gen_ai.response.finish_reasons","Value":{"Type":"STRINGSLICE","Value":["stop"]}},{"Key":"gen_ai.usage.input_tokens","Value":{"Type":"INT64","Value":14}},{"Key":"gen_ai.usage.output_tokens","Value":{"Type":"INT64","Value":132}}],"Events":null,"Links":null,"Status":{"Code":"Ok","Description":""},"DroppedAttributes":0,"DroppedEvents":0,"DroppedLinks":0,"ChildSpanCount":0,"Resource":[{"Key":"service.name","Value":{"Type":"STRING","Value":"otel-demo"}}],"InstrumentationScope":{"Name":"blades","Version":"","SchemaURL":"","Attributes":null},"InstrumentationLibrary":{"Name":"blades","Version":"","SchemaURL":"","Attributes":null}}
```