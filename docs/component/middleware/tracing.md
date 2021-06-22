---
id: tracing
title: Tracing
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

Tracing 中间件使用 opentelemetry 实现了链路追踪。

### 配置

Tracing 中间件中提供了两个配置方法 `WithTracerProvider()`，`WithPropagator()`。

#### `WithTracerProvider`

```go
func WithTracerProvider(provider trace.TracerProvider) Option {
	return func(opts *options) {
		opts.TracerProvider = provider
	}
}    
```

WithTracerProvider 用于设置 tracing 的链路追踪程序的提供者，该方法接收一个 trace.TracerProvider。

#### `WithPropagator`

```go
func WithPropagator(propagator propagation.TextMapPropagator) Option {
	return func(opts *options) {
		opts.Propagator = propagator
	}
}
```


WithPropagator 用于设置 tracing 的文本映射的传播器，该方法接收一个 propagation.TextMapPropagator。

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
				tracing.Server(tracing.WithTracerProvider(otel.GetTracerProvider())),
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
			tracing.Client(
				tracing.WithTracerProvider(
					otel.GetTracerProvider(),
				),
			),
		),
	)
}
```

### References

* https://opentelemetry.io/
* https://github.com/open-telemetry/opentelemetry-go/tree/main/example
* https://pkg.go.dev/go.opentelemetry.io/otel
