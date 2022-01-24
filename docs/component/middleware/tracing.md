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

Tracing 中间件中提供了一个配置方法 `SetTracerProvider()`。

#### `SetTracerProvider`

```go
package otel
...
func SetTracerProvider(tp trace.TracerProvider) {
    global.SetTracerProvider(tp)
}   
```

SetTracerProvider 用于设置 tracing 的链路追踪程序的提供者，该方法接收一个 trace.TracerProvider。



### 使用方法

#### server 中使用 tracing 采集数据

```go
package server

func initTracer() func() {
	// 创建一个 jaeger 的 pipeline,其他收集方式可以查看 opentelemetry 文档
	flush, err := jaeger.InstallNewPipeline(
		jaeger.WithCollectorEndpoint("http://localhost:14268/api/traces"),
		jaeger.WithSDKOptions(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
			sdktrace.WithResource(resource.NewWithAttributes(
				semconv.ServiceNameKey.String("kratos-trace"),
				attribute.String("exporter", "jaeger"),
				attribute.Float64("float", 312.23),
			)),
		),
	)
	if err != nil {
		log.Fatal(err)
	}
	return flush
}
// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server, executor *service.ExecutorService) *grpc.Server {
	flush := initTracer()
	defer flush()
	//tr := otel.Tracer("component-main")
	var opts = []grpc.ServerOption{
		grpc.Middleware(
			middleware.Chain(
				tracing.Server(),
			),
		),
	}
   // ...
}
```

#### client 中使用 tracing 采集数据

```go

func initTracer() func() {
	// 创建一个 jaeger 的 pipeline,其他收集方式可以查看 opentelemetry 文档
	flush, err := jaeger.InstallNewPipeline(
		jaeger.WithCollectorEndpoint("http://localhost:14268/api/traces"),
		jaeger.WithSDKOptions(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
			sdktrace.WithResource(resource.NewWithAttributes(
				semconv.ServiceNameKey.String("kratos-trace"),
				attribute.String("exporter", "jaeger"),
				attribute.Float64("float", 312.23),
			)),
		),
	)
	if err != nil {
		log.Fatal(err)
	}
	return flush
}
func grpcCli() (*grpc.ClientConn, error) {
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
