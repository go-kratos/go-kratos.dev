---
title: "Observability"
description: "Explains the integration of OpenTelemetry middleware in Blades"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/middleware-otel/main.go"]
---
Blades provides powerful observability capabilities for AI Agent applications, including Tracing (distributed tracing) and performance visualization. By integrating OpenTelemetry, you can easily obtain call chains, time consumption statistics, and insights into system behavior.
This article is based on the example code:
🔗 https://github.com/go-kratos/blades/blob/main/examples/middleware-otel/main.go

## Environment Preparation
Ensure you have installed Go 1.20+ and introduced dependencies in your project:
```bash
go get github.com/go-kratos/blades
go get github.com/go-kratos/blades/contrib/otel
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/sdk/trace
go get go.opentelemetry.io/otel/exporters/stdout/stdouttrace
```
If you want to connect to OpenTelemetry Collector, Jaeger, or Zipkin, simply replace the Exporter.

## Initialize Tracer Provider
The following shows how to initialize an OpenTelemetry TracerProvider for recording and exporting trace data:
```go
// Create and initialize OpenTelemetry TracerProvider
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

    // Return shutdown method for cleanup in main()
    return tp.Shutdown
}
```
Function Analysis
- stdouttrace.New()
  Used to output trace data in a readable format to the console for development and debugging.
- resource.New()
  Sets metadata such as service name and environment labels.
- sdktrace.NewTracerProvider()
  Exports traces in batches and binds resource information.
- otel.SetTracerProvider()
  Registers the TracerProvider globally, enabling middleware and framework to automatically generate spans.

## Using Tracing Middleware in Agent
Blades provides a unified middleware mechanism that automatically generates trace spans before and after Agent calls.

Example:
```go
agent := blades.NewAgent(
    "Example Agent",
    blades.WithModel("gpt-4"),
    blades.WithInstructions("Answer briefly."),
    blades.WithProvider(openai.NewChatProvider()),
    blades.WithMiddleware(
        middleware.Tracing(
            middleware.WithSystem("openai"), // Optional label to identify backend
        ),
    ),
)
```

## Example Main Program
Complete runnable example code:
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
	agent, err := blades.NewAgent(
		"OpenTelemetry Agent",
		blades.WithMiddleware(middleware.Tracing()),
		blades.WithModel("gpt-5"),
		blades.WithProvider(openai.NewChatProvider()),
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

## Summary
Through the examples in this article, you can:
- Initialize OpenTelemetry TracerProvider
- Use stdouttrace exporter to debug Trace
- Enable Tracing middleware in Agent
- Automatically trace each AI call without invasive code

You can extend this to:
- Jaeger / Zipkin / OTLP Collector
- HTTP / gRPC service chain tracing
- Custom Span tags and events

Blades provides an out-of-the-box observability system, making AI Agent projects easier to analyze, troubleshoot, and optimize in production environments.