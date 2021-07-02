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

We use OpenTelemetry for distributed tracing.

### Configuration

There are two methods for configuration `WithTracerProvider()` and `WithPropagator()`.

#### `WithTracerProvider`

```go
func WithTracerProvider(provider trace.TracerProvider) Option {
	return func(opts *options) {
		opts.TracerProvider = provider
	}
}    
```

`WithTracerProvider` is for setting the provider, it accepts `trace.TracerProvider`

#### `WithPropagator`

```go
func WithPropagator(propagator propagation.TextMapPropagator) Option {
	return func(opts *options) {
		opts.Propagator = propagator
	}
}
```

`WithPropagator` is for setting the text map propagator, it accepts `propagation.TextMapPropagator`

### Usage

#### Tracing for Server

```go
package server

func initTracer() func() {
	// create a jaeger pipeline
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

#### Tracing for Client

```go

func initTracer() func() {
	// create a jaeger pipeline
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
