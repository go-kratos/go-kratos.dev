---
title: Distributed Tracing with OpenTelemetry
keywords:
  - Go 
  - Kratos
  - OpenTracing
  - OpenCencus
  - OpenTelemetry
  - Google
  - Dapper
  - operation process
tags: [go, golang, Distributed Tracing, OpenTelemetry, Source Code Analysis]
date: 2021-06-03
---

## The Evolution of Distributed Tracing
>
> Distributed tracing (also known as distributed request tracing) is a method used to analyze and monitor applications, especially those built using microservices architecture. Distributed tracing helps pinpoint where failures occur and what causes poor performance.
>
### Origins

The term "Distributed Tracing" first appeared in the paper **《Dapper, a Large-Scale Distributed Systems Tracing Infrastructure》** published by Google. This paper has had a profound influence on the design concepts of later open-source distributed tracing projects such as Jaeger and Zipkin.

Microservices architecture is a distributed architecture with many different services. Different services call each other, and if an error occurs, a single request may pass through N services. As business grows, the number of service calls increases. Without a tool to record the call chain, solving problems becomes like untangling a ball of yarn played by a kitten in the image below—utterly confusing and difficult to start.
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2dd5606765649969819396ba574a741~tplv-k3u1fbpfcp-watermark.image)
Therefore, a tool is needed to clearly understand which services a request has passed through and in what order, making it easy to locate issues.
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7098634cefe74a3cbacf5e76c343bd81~tplv-k3u1fbpfcp-watermark.image)

### A Flourishing of Tools

After Google released **Dapper**, more and more distributed tracing tools emerged. Below are some commonly used distributed tracing systems:

- Skywalking
- Alibaba Eagle Eye
- Dianping CAT
- Twitter Zipkin
- Naver Pinpoint
- Uber Jaeger

### Rivalry?

As the number of tracing tools increased, the open-source community was mainly divided into two factions. One faction followed the **OpenTracing** specification led by the **CNCF Technical Committee**, such as Jaeger and Zipkin, which adhere to the **OpenTracing** specification. The other faction was **OpenCensus**, initiated by Google. Google, being the first company to propose the concept of distributed tracing, was later joined by Microsoft in **OpenCensus**.
![截屏2021-05-29 下午9.56.57.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3029f1315fe34ec884858d33d41cb1ce~tplv-k3u1fbpfcp-watermark.image)

### The Birth of OpenTelemetry
>
> OpenTelemetry is a set of APIs, SDKs, modules, and integrations designed for creating and managing‎‎telemetry data‎‎(such as traces, metrics, and logs).

After Microsoft joined **OpenCensus**, it directly disrupted the previous balance, indirectly leading to the birth of **OpenTelemetry**.
Google and Microsoft were determined to end the chaos in the community. The primary issue was how to integrate the existing projects from both communities. The main concept of OpenTelemetry is to be compatible with both **OpenCensus** and **OpenTracing**, allowing users to integrate **OpenTelemetry** with little or no modification.

## Kratos Distributed Tracing Practice
>
> Kratos is a lightweight Go microservices framework that includes a large number of microservices-related frameworks and tools.

### Tracing Middleware

Among the built-in middleware provided by the Kratos framework, there is a **tracing** middleware that implements distributed tracing functionality based on **OpenTelemetry**. The middleware code can be found at **[middleware/tracing](https://github.com/go-kratos/kratos/tree/main/middleware/tracing)**.

#### Implementation Principle

The Kratos tracing middleware consists of three files: **carrie.go**, **tracer.go**, and **tracing.go**. The implementation principles for client and server are similar. This article uses the server implementation for principle analysis.

1. First, when a request comes in, the **tracing** middleware is called, and the **NewTracer** method in **tracer.go** is invoked first.

```go
// Server returns a new server middleware for OpenTelemetry.
func Server(opts ...Option) middleware.Middleware {
 // Call NewTracer in tracer.go, passing a SpanKindServer and configuration options
 tracer := NewTracer(trace.SpanKindServer, opts...)
 // ... Code omitted
}
```

2. After the **NewTracer** method in **tracer.go** is called, it returns a **Tracer**. The implementation is as follows:

```go
func NewTracer(kind trace.SpanKind, opts ...Option) *Tracer {
 options := options{}
 for _, o := range opts {
  o(&options)
 }
 // Check if an otel tracing provider configuration exists; if so, set it
 if options.TracerProvider != nil {
  otel.SetTracerProvider(options.TracerProvider)
 }
 /*
 Check if Propagators are set; if so, set them, otherwise set a default TextMapPropagator.
 Note: If the default TextMapPropagator is not set, trace information cannot be correctly propagated.
 */
 if options.Propagators != nil {
  otel.SetTextMapPropagator(options.Propagators)
 } else { 
  otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.Baggage{}, propagation.TraceContex{}))
 }

 var name string
 // Determine the type of middleware: server or client
 if kind == trace.SpanKindServer {
  name = "server"
 } else if kind == trace.SpanKindClient {
  name = "client"
 } else {
  panic(fmt.Sprintf("unsupported span kind: %v", kind))
 }
 // Call the Tracer method of the otel package, passing the name to create a tracer instance
 tracer := otel.Tracer(name)
 return &Tracer{tracer: tracer, kind: kind}
}
```

3. Determine the current request type, process the data to be collected, and call the **Start** method in **tracer.go**.

```go
var (
 component string
 operation string
 carrier   propagation.TextMapCarrier
)

// Determine the request type
if info, ok := http.FromServerContext(ctx); ok {
 // HTTP
 component = "HTTP"
 // Extract the request URI
 operation = info.Request.RequestURI
 // Call HeaderCarrier from the otel/propagation package to handle http.Header to satisfy the TextMapCarrier interface
 // TextMapCarrier is a text mapping carrier used to carry information
 carrier = propagation.HeaderCarrier(info.Request.Header)
 // The otel.GetTextMapPropagator().Extract() method is used to read the text mapping carrier into the context
 ctx = otel.GetTextMapPropagator().Extract(ctx, propagation.HeaderCarrier(info.Request.Header))
} else if info, ok := grpc.FromServerContext(ctx); ok {
 // Grpc
 component = "gRPC"
 operation = info.FullMethod
 //
 // Call metadata.FromIncomingContext(ctx) from the grpc/metadata package, passing ctx to convert gRPC metadata
 if md, ok := metadata.FromIncomingContext(ctx); ok {
  // Call MetadataCarrier in carrier.go to convert MD into a text mapping carrier
  carrier = MetadataCarrier(md)
 }
}

// Call the tracer.Start method
ctx, span := tracer.Start(ctx, component, operation, carrier)
// ... Code omitted
```

4. Call the **Start** method in **tracing.go**.

```go
func (t *Tracer) Start(ctx context.Context, component string, operation string, carrier propagation.TextMapCarrier) (context.Context, trace.Span) {
 // If the current middleware is server, inject the carrier into the context
 if t.kind == trace.SpanKindServer {
  ctx = otel.GetTextMapPropagator().Extract(ctx, carrier)
 }
 // Call the start method in the otel/tracer package to create a span
 ctx, span := t.tracer.Start(ctx,
  // The request route declared in tracing.go is used as the spanName
  operation,
  // Set span attributes, setting a component with the value of the request type
  trace.WithAttributes(attribute.String("component", component)),
  // Set the span kind
  trace.WithSpanKind(t.kind),
 )
 // If the current middleware is client, inject the carrier into the request
 if t.kind == trace.SpanKindClient {
  otel.GetTextMapPropagator().Inject(ctx, carrier)
 }
 return ctx, span
}
```

5. **defer** declares a closure method.

```golang
// Note: Use a closure here because defer parameters are evaluated in real-time. If an exception occurs, err will remain nil.
// https://github.com/go-kratos/kratos/issues/927
defer func() { tracer.End(ctx, span, err) }()
```

6. The middleware continues execution.

```go
// tracing.go line 69
reply, err = handler(ctx, req)
```

7. After the middleware call ends, the closure in **defer** is called, executing the **End** method in **tracer.go**.

```go
func (t *Tracer) End(ctx context.Context, span trace.Span, err error) {
 // Check if an error occurred; if so, set some error information
 if err != nil {
  // Record the error
  span.RecordError(err)
  // Set span attributes
  span.SetAttributes(
   // Set event to error
   attribute.String("event", "error"),
   // Set message to err.Error().
   attribute.String("message", err.Error()),
  )
  // Set the span status
  span.SetStatus(codes.Error, err.Error())
 } else {
  // If no error occurred, set the span status to ok
  span.SetStatus(codes.Ok, "OK")
 }
 // End the span
 span.End()
}
```

#### How to Use

Examples of using the tracing middleware can be found at [kratos/examples/traces](https://github.com/go-kratos/examples/tree/main/traces). This example simply implements cross-service distributed tracing. The following code snippets include parts of the example code.

```go
// https://github.com/go-kratos/kratos/blob/7f835db398c9d0332e69b81bad4c652b4b45ae2e/examples/traces/app/message/main.go#L38
// First, call the otel library method to get a TracerProvider
func tracerProvider(url string) (*tracesdk.TracerProvider, error) {
 // examples/traces uses jaeger; for other methods, refer to the official OpenTelemetry examples
 exp, err := jaeger.NewRawExporter(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
 if err != nil {
  return nil, err
 }
 tp := tracesdk.NewTracerProvider(
  tracesdk.WithSampler(tracesdk.AlwaysSample()),
  // Set Batcher, register the jaeger exporter
  tracesdk.WithBatcher(exp),
  // Record some default information
  tracesdk.WithResource(resource.NewWithAttributes(
   semconv.ServiceNameKey.String(pb.User_ServiceDesc.ServiceName),
   attribute.String("environment", "development"),
   attribute.Int64("ID", 1),
  )),
 )
 return tp, nil
}
```

#### Using in grpc/server

```go
// https://github.com/go-kratos/kratos/blob/main/examples/traces/app/message/main.go
grpcSrv := grpc.NewServer(
 grpc.Address(":9000"),
 grpc.Middleware(
  // Configuring tracing Middleware
  tracing.Server(
   tracing.WithTracerProvider(tp),
  ),
 ),
)
```

#### Using in grpc/client

```go
// https://github.com/go-kratos/kratos/blob/149fc0195eb62ee1fbc2728adb92e1bcd1a12c4e/examples/traces/app/user/main.go#L63
conn, err := grpc.DialInsecure(ctx,
 grpc.WithEndpoint("127.0.0.1:9000"),
 grpc.WithMiddleware(
  tracing.Client(
   tracing.WithTracerProvider(s.tracer),
   tracing.WithPropagators(
    propagation.NewCompositeTextMapPropagator(propagation.Baggage{}, propagation.TraceContext{}),
   ),
  )
 ),
 grpc.WithTimeout(2*time.Second),
)
```

#### Using in http/server

```go
// https://github.com/go-kratos/kratos/blob/main/examples/traces/app/user/main.go
httpSrv := http.NewServer(http.Address(":8000"))
httpSrv.HandlePrefix("/", pb.NewUserHandler(s,
 http.Middleware(
  // Configuring tracing middleware
  tracing.Server(
   tracing.WithTracerProvider(tp),
   tracing.WithPropagators(
    propagation.NewCompositeTextMapPropagator(propagation.Baggage{}, propagation.TraceContext{}),
   ),
  ),
 ),
)
```

#### Using in http/client

```go
http.NewClient(ctx, http.WithMiddleware(
 tracing.Client(
  tracing.WithTracerProvider(s.tracer),
 ),
))
```

#### How to Implement Tracing for Other Scenarios

We can learn from the code of Kratos' **tracing** middleware to implement tracing for other scenarios, such as database tracing. The following code snippet shows how the author implemented tracing for the **qmgo** library operating on **MongoDB** by referencing the **tracing** middleware.

```go
func mongoTracer(ctx context.Context,tp trace.TracerProvider, command interface{}) {
 var (
  commandName string
  failure     string
  nanos       int64
  reply       bson.Raw
  queryId     int64
  eventName   string
 )
 otel.SetTracerProvider(tp)
 reply = bson.Raw{}
 switch value := command.(type) {
 case *event.CommandStartedEvent:
  commandName = value.CommandName
  reply = value.Command
  queryId = value.RequestID
  eventName = "CommandStartedEvent"
 case *event.CommandSucceededEvent:
  commandName = value.CommandName
  nanos = value.DurationNanos
  queryId = value.RequestID
  eventName = "CommandSucceededEvent"
 case *event.CommandFailedEvent:
  commandName = value.CommandName
  failure = value.Failure
  nanos = value.DurationNanos
  queryId = value.RequestID
  eventName = "CommandFailedEvent"
 }
 duration, _ := time.ParseDuration(strconv.FormatInt(nanos, 10) + "ns")
 tracer := otel.Tracer("mongodb")
 kind := trace.SpanKindServer
 ctx, span := tracer.Start(ctx,
  commandName,
  trace.WithAttributes(
   attribute.String("event", eventName),
   attribute.String("command", commandName),
   attribute.String("query", reply.String()),
   attribute.Int64("queryId", queryId),
   attribute.String("ms", duration.String()),
  ),
  trace.WithSpanKind(kind),
 )
 if failure != "" {
  span.RecordError(errors.New(failure))
 }
 span.End()
}
```

## References

- [Google Paper 《Dapper, a Large-Scale Distributed Systems Tracing Infrastructure》](https://www.researchgate.net/publication/239595848_Dapper_a_Large-Scale_Distributed_Systems_Tracing_Infrastructure)
- [OpenTelemetry Official Website](https://opentelemetry.io/)
- [KubeCon2019 OpenTelemetry Sharing](https://static.sched.com/hosted_files/kccncosschn19chi/03/OpenTelemetry_%20Overview%20%26%20Backwards%20Compatibility%20of%20OpenTracing%20%2B%20OpenCensus%20-%20Steve%20Flanders%2C%20Omnition.pdf)
- [Kratos Framework](https://go-kratos.dev/docs/getting-started/start)
- [traces Example](https://github.com/go-kratos/examples/tree/main/traces)
