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
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

// 设置全局trace
func initTracer(url string) error {
	// 创建 Jaeger exporter
	exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
	if err != nil {
		return err
	}
	tp := tracesdk.NewTracerProvider(
		// 将基于父span的采样率设置为100%
		tracesdk.WithSampler(tracesdk.ParentBased(tracesdk.TraceIDRatioBased(1.0))),
		// 始终确保再生成中批量处理
		tracesdk.WithBatcher(exp),
		// 在资源中记录有关此应用程序的信息
		tracesdk.WithResource(resource.NewSchemaless(
			semconv.ServiceNameKey.String("kratos-trace"),
			attribute.String("exporter", "jaeger"),
			attribute.Float64("float", 312.23),
		)),
	)
	otel.SetTracerProvider(tp)
	return nil
}

// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server, executor *service.ExecutorService) *grpc.Server {
	err := initTracer("http://localhost:14268/api/traces")
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
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	googlegrpc "google.golang.org/grpc"
)

// 设置全局trace
func initTracer(url string) error {
	// 穿件 Jaeger exporter
	exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
	if err != nil {
		return err
	}
	tp := tracesdk.NewTracerProvider(
		// 将基于父span的采样率设置为100%
		tracesdk.WithSampler(tracesdk.ParentBased(tracesdk.TraceIDRatioBased(1.0))),
		// 始终确保再生成中批量处理
		tracesdk.WithBatcher(exp),
		// 在资源中记录有关此应用程序的信息
		tracesdk.WithResource(resource.NewSchemaless(
			semconv.ServiceNameKey.String("kratos-trace"),
			attribute.String("exporter", "jaeger"),
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

### References

* https://opentelemetry.io/
* https://github.com/open-telemetry/opentelemetry-go/tree/main/example
* https://pkg.go.dev/go.opentelemetry.io/otel
