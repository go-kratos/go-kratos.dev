---
id: tracing
title: 链路追踪
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

Tracing 中间件使用 OpenTelemetry 实现了链路追踪。

### 配置

有两种方法可用于使用`WithTracerProvider()` and `WithPropagator()`进行配置。

#### `WithTracerProvider`

```go
func WithTracerProvider(provider trace.TracerProvider) Option {
    return func(opts *options) {
        opts.TracerProvider = provider
    }
}    
```

`WithTracerProvider` 用于设置 provider，它接收的参数为 `trace.TracerProvider`。

#### `WithPropagator`

```go
func WithPropagator(propagator propagation.TextMapPropagator) Option {
    return func(opts *options) {
        opts.Propagator = propagator
    }
}
```

`WithPropagator` 用于设置 text map propagator，它接收的参数为 `propagation.TextMapPropagator`。


### 使用方法

#### server 中使用 tracing 采集数据

```go
package server

import (
	"github.com/go-kratos/kratos/v2/middleware/tracing"
	"github.com/go-kratos/kratos/v2/transport/grpc"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

// 设置全局trace
func initTracer(endpoint string) error {
	// 创建 exporter
	exporter, err := otlptracehttp.New(context.Background(),
		otlptracehttp.WithEndpoint(endpoint),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return err
	}
	tp := tracesdk.NewTracerProvider(
		// 将基于父span的采样率设置为100%
		tracesdk.WithSampler(tracesdk.ParentBased(tracesdk.TraceIDRatioBased(1.0))),
		// 始终确保在生产中批量处理
		tracesdk.WithBatcher(exporter),
		// 在资源中记录有关此应用程序的信息
		tracesdk.WithResource(resource.NewSchemaless(
			semconv.ServiceNameKey.String("docs-trace"),
			attribute.String("exporter", "otlp"),
			attribute.Float64("float", 312.23),
		)),
	)
	otel.SetTracerProvider(tp)
	return nil
}

// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server, executor *service.ExecutorService) *grpc.Server {
	err := initTracer("localhost:4318")
	if err != nil {
		panic(err)
	}
	//tr := otel.Tracer("component-main")
	var opts = []grpc.ServerOption{
		grpc.Middleware(
			tracing.Server(),
		),
	}
	// ...
}
```

#### client 中使用 tracing 采集数据

```go
package client

import (
	"context"

	"github.com/go-kratos/kratos/v2/middleware/tracing"
	"github.com/go-kratos/kratos/v2/transport/grpc"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	googlegrpc "google.golang.org/grpc"
)

// 设置全局trace
func initTracer(endpoint string) error {
	// 创建 exporter
	exporter, err := otlptracehttp.New(context.Background(),
		otlptracehttp.WithEndpoint(endpoint),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return err
	}
	tp := tracesdk.NewTracerProvider(
		// 将基于父span的采样率设置为100%
		tracesdk.WithSampler(tracesdk.ParentBased(tracesdk.TraceIDRatioBased(1.0))),
		// 始终确保在生产中批量处理
		tracesdk.WithBatcher(exporter),
		// 在资源中记录有关此应用程序的信息
		tracesdk.WithResource(resource.NewSchemaless(
			semconv.ServiceNameKey.String("docs-trace"),
			attribute.String("exporter", "otlp"),
			attribute.Float64("float", 312.23),
		)),
	)
	otel.SetTracerProvider(tp)
	return nil
}

func grpcCli() (*googlegrpc.ClientConn, error) {
	// 如果本项目没有初始化initTracer 请初始化
	return grpc.DialInsecure(
		context.Background(),
		grpc.WithMiddleware(
			tracing.Client(),
		),
	)
}
```

#### 自动采集数据

如果不想手动修改代码，您还可以使用一些框架进行OpenTelemetry数据的自动采集，比如[Alibaba Go Auto Instrumentation](https://github.com/alibaba/opentelemetry-go-auto-instrumentation) (后续将正式捐赠至[OpenTelemetry官方](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation))。

您可以参考[文档](https://github.com/alibaba/opentelemetry-go-auto-instrumentation/blob/main/README.md)来编译您的Kratos应用。

### References

* https://opentelemetry.io/
* https://github.com/open-telemetry/opentelemetry-go/tree/main/example
* https://pkg.go.dev/go.opentelemetry.io/otel
* https://github.com/alibaba/opentelemetry-go-auto-instrumentation
* https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation
