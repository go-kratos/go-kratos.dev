---
slug: go-kratos-opentelemetry-practice
title: Kratos 学习笔记 - 基于 OpenTelemetry 的链路追踪
description: 分布式跟踪（也称为分布式请求跟踪）是一种用于分析和监控应用程序的方法，尤其是使用微服务架构构建的应用程序。分布式跟踪有助于精确定位故障发生的位置以及导致性能差的原因。
keywords:
  - Go 
  - Kratos
  - OpenTracing
  - OpenCencus
  - OpenTelemetry
  - Google
  - Dapper
  - operation process
author: shenqidebaozi
author_title: Maintainer of go-kratos
author_url: https://github.com/shenqidebaozi
author_image_url: https://avatars.githubusercontent.com/u/35397691?s=60&v=4
tags: [go, golang, 链路追踪, OpenTelemetry, 源码分析]
---

# 基于 OpenTelemetry 的链路追踪

## 链路追踪的前世今生
>
> 分布式跟踪（也称为分布式请求跟踪）是一种用于分析和监控应用程序的方法，尤其是使用微服务架构构建的应用程序。分布式跟踪有助于精确定位故障发生的位置以及导致性能差的原因。
>
### 起源

链路追踪(Distributed Tracing)　一词最早出现于谷歌发布的论文 **《Dapper, a Large-Scale Distributed Systems Tracing Infrastructure》** 中,这篇论文对于实现链路追踪,对于后来出现的 Jaeger、Zipkin 等开源分布式追踪项目设计理念仍有很深的影响。

微服务架构是一个分布式的架构,会有很多个不同的服务。不同的服务之前相互调用,如果出现了错误由于一个请求经过了 N 个服务。随着业务的增加越来越多的服务之间的调用，如果没有一个工具去记录调用链，解决问题的时候就会像下面图片里小猫咪玩的毛线球一样，毫无头绪，无从下手
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2dd5606765649969819396ba574a741~tplv-k3u1fbpfcp-watermark.image)
所以需要有一个工具能够清楚的了解一个请求经过了哪些服务,顺序是如何,从而能够轻易的定位问题。
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7098634cefe74a3cbacf5e76c343bd81~tplv-k3u1fbpfcp-watermark.image)

### 百家争艳

从谷歌发布 **Dapper** 后，分布式链路追踪工具越来越多，以下简单列举了一些常用的链路追踪系统

- Skywalking
- 阿里 鹰眼
- 大众点评 CAT
- Twitter Zipkin
- Naver pinpoint
- Uber Jaeger

### 争锋相对？

随着链路追踪工具越来越多，开源领域主要分为两派，一派是以 **CNCF技术委员** 会为主的  **OpenTracing** 的规范，例如 jaeger zipkin 都是遵循了**OpenTracing** 的规范。而另一派则是谷歌作为发起者的 **OpenCensus**，而且谷歌本身还是最早提出链路追踪概念的公司，后期连微软也加入了 **OpenCensus**
![截屏2021-05-29 下午9.56.57.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3029f1315fe34ec884858d33d41cb1ce~tplv-k3u1fbpfcp-watermark.image)

### OpenTelemetry 诞生
>
>OpenTelemetric 是一组 API、SDK、模组和集成，专为创建和管理‎‎遥测数据‎‎（如追踪、指标和日志）而设

微软加入 **OpenCensus** 后，直接打破了之前平衡的局面，间接的导致了 **OpenTelemetry** 的诞生
谷歌和微软下定决心结束江湖之乱，首要的问题是如何整合两个两个社区已有的项目，OpenTelemetry 主要的理念就是，兼容 **OpenCensus** 和 **OpenTracing** ，可以让使用者无需改动或者很小的改动就可以接入 **OpenTelemetry**

## Kratos 的链路追踪实践
>
> Kratos 一套轻量级 Go 微服务框架，包含大量微服务相关框架及工具。

### tracing 中间件

kratos 框架提供的自带中间件中有一个名为 **tracing** 中间件，它基于 **Opentelemetry** 实现了kratos 框架的链路追踪功能，中间件的代码可以从 **[middleware/tracing](https://github.com/go-kratos/kratos/tree/main/middleware/tracing)** 中看到。

#### 实现原理

kratos 的链路追踪中间件由三个文件组成 **carrie.go**,**tracer.go**,**tracing.go**。client和 server 的实现原理基本相同，本文以 server 实现进行原理解析。

1. 首先当请求进入时，**tracing** 中间件会被调用,首先调用了 **tracer.go** 中的 **NewTracer** 方法

```go
// Server returns a new server middleware for OpenTelemetry.
func Server(opts ...Option) middleware.Middleware {
 // 调用 tracer.go 中的 NewTracer 传入了一个 SpanKindServer 和配置项
 tracer := NewTracer(trace.SpanKindServer, opts...)
 // ... 省略代码
}
```

2. **tracer.go** 中的 **NewTracer** 方法被调用后会返回一个 **Tracer**,实现如下

```go
func NewTracer(kind trace.SpanKind, opts ...Option) *Tracer {
 options := options{}
 for _, o := range opts {
  o(&options)
 }
 // 判断是否存在 otel 追踪提供者配置，如果存在则设置
 if options.TracerProvider != nil {
  otel.SetTracerProvider(options.TracerProvider)
 }
 /*
 判断是否存在 Propagators 设置，如果存在设置则覆盖，不存在则设置一个默认的TextMapPropagator
 注意如果没有设置默认的TextMapPropagator,链路信息则无法正确的传递
 */
 if options.Propagators != nil {
  otel.SetTextMapPropagator(options.Propagators)
 } else { 
  otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.Baggage{}, propagation.TraceContex{}))
 }

 var name string
 // 判断当前中间件的类型，是 server 还是 client
 if kind == trace.SpanKindServer {
  name = "server"
 } else if kind == trace.SpanKindClient {
  name = "client"
 } else {
  panic(fmt.Sprintf("unsupported span kind: %v", kind))
 }
 // 调用 otel包的 Tracer 方法 传入 name 用来创建一个 tracer 实例
 tracer := otel.Tracer(name)
 return &Tracer{tracer: tracer, kind: kind}
}
```

3. 判断当前请求类型，处理需要采集的数据，并调用 **tracer.go** 中的 **Start** 方法

```go
var (
 component string
 operation string
 carrier   propagation.TextMapCarrier
)

// 判断请求类型
if info, ok := http.FromServerContext(ctx); ok {
 // HTTP
 component = "HTTP"
 // 取出请求的地址
 operation = info.Request.RequestURI
 // 调用 otel/propagation包中的 HeaderCarrier，会处理 http.Header 以用来满足TextMapCarrier interface
 // TextMapCarrier 是一个文本映射载体，用于承载信息
 carrier = propagation.HeaderCarrier(info.Request.Header)
 // otel.GetTextMapPropagator().Extract() 方法用于将文本映射载体，读取到上下文中
 ctx = otel.GetTextMapPropagator().Extract(ctx, propagation.HeaderCarrier(info.Request.Header))
} else if info, ok := grpc.FromServerContext(ctx); ok {
 // Grpc
 component = "gRPC"
 operation = info.FullMethod
 //
 // 调用 grpc/metadata包中metadata.FromIncomingContext(ctx)传入 ctx，转换 grpc 的元数据
 if md, ok := metadata.FromIncomingContext(ctx); ok {
  // 调用carrier.go 中的 MetadataCarrier 将 MD 转换 成文本映射载体
  carrier = MetadataCarrier(md)
 }
}

// 调用 tracer.Start 方法
ctx, span := tracer.Start(ctx, component, operation, carrier)
// ... 省略代码
```

4. 调用 **tracing.go** 中的 **Start** 方法

```go
func (t *Tracer) Start(ctx context.Context, component string, operation string, carrier propagation.TextMapCarrier) (context.Context, trace.Span) {
 // 判断当前中间件如果是 server则将 carrier 注入到上下文中
 if t.kind == trace.SpanKindServer {
  ctx = otel.GetTextMapPropagator().Extract(ctx, carrier)
 }
 // 调用otel/tracer 包中的 start 方法，用来创建一个 span
 ctx, span := t.tracer.Start(ctx,
  // tracing.go 中声明的请求路由作为 spanName
  operation,
  // 设置 span 的属性，设置了一个 component，component的值为请求类型
  trace.WithAttributes(attribute.String("component", component)),
  // 设置 span种类
  trace.WithSpanKind(t.kind),
 )
 // 判断如果当前中间件是 client 则将 carrier 注入到请求里面
 if t.kind == trace.SpanKindClient {
  otel.GetTextMapPropagator().Inject(ctx, carrier)
 }
 return ctx, span
}
```

5. **defer** 声明了一个闭包方法

```golang
// 这个地方要注意，需要使用闭包，因为 defer 的参数是实时计算的如果异常发生，err 会一直为 nil
// https://github.com/go-kratos/kratos/issues/927
defer func() { tracer.End(ctx, span, err) }()
```

6. 中间件继续执行

```go
// tracing.go 69行
reply, err = handler(ctx, req)
```

7. 中间件调用结束 **defer** 中的闭包被调用后执行了 **tracer.go** 中的 **End** 方法

```go
func (t *Tracer) End(ctx context.Context, span trace.Span, err error) {
 // 判断是否有异常发生，如果有则设置一些异常信息
 if err != nil {
  // 记录异常
  span.RecordError(err)
  // 设置span 属性
  span.SetAttributes(
   // 设置事件为异常
   attribute.String("event", "error"),
   // 设置 message 为 err.Error().
   attribute.String("message", err.Error()),
  )
  //设置了 span 的状态
  span.SetStatus(codes.Error, err.Error())
 } else {
  // 如果没有发生异常，span 状态则为 ok
  span.SetStatus(codes.Ok, "OK")
 }
 // 中止 span
 span.End()
}
```

#### 如何使用

tracing 中间件的使用示例可以从  [kratos/examples/traces](https://github.com/go-kratos/examples/tree/main/traces) ,该示例简单的实现了跨服务间的链路追踪,以下代码片段包含部分示例代码。

```go
// https://github.com/go-kratos/kratos/blob/7f835db398c9d0332e69b81bad4c652b4b45ae2e/examples/traces/app/message/main.go#L38
// 首先调用otel 库方法，得到一个 TracerProvider
func tracerProvider(url string) (*tracesdk.TracerProvider, error) {
 // examples/traces 中使用的是 jaeger，其他方式可以查看 opentelemetry 官方示例
 exp, err := jaeger.NewRawExporter(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
 if err != nil {
  return nil, err
 }
 tp := tracesdk.NewTracerProvider(
  tracesdk.WithSampler(tracesdk.AlwaysSample()),
  // 设置 Batcher，注册jaeger导出程序
  tracesdk.WithBatcher(exp),
  // 记录一些默认信息
  tracesdk.WithResource(resource.NewWithAttributes(
   semconv.ServiceNameKey.String(pb.User_ServiceDesc.ServiceName),
   attribute.String("environment", "development"),
   attribute.Int64("ID", 1),
  )),
 )
 return tp, nil
}
```

#### 在 grpc/server 中使用

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

#### 在 grpc/client 中使用

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

#### 在 http/server 中使用

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

#### 在 http/client 中使用

```go
http.NewClient(ctx, http.WithMiddleware(
 tracing.Client(
  tracing.WithTracerProvider(s.tracer),
 ),
))
```

#### 如何实现一个其他场景的 tracing

我们可以借鉴 **kratos** 的 **tracing** 中间件的代码来实现例如数据库的 **tracing**，如下面的代码片段，作者借鉴了**tracing** 中间件，实现了 **qmgo** 库操作 **MongoDB** 数据库的 **tracing**。

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

## 参考文献

- [谷歌论文《Dapper, a Large-Scale Distributed Systems Tracing Infrastructure》](https://www.researchgate.net/publication/239595848_Dapper_a_Large-Scale_Distributed_Systems_Tracing_Infrastructure)
- [OpenTelemetry 官网](https://opentelemetry.io/)
- [KubeCon2019 OpenTelemetry分享](https://static.sched.com/hosted_files/kccncosschn19chi/03/OpenTelemetry_%20Overview%20%26%20Backwards%20Compatibility%20of%20OpenTracing%20%2B%20OpenCensus%20-%20Steve%20Flanders%2C%20Omnition.pdf)
- [Kratos 框架](https://go-kratos.dev/docs/getting-started/start)
- [traces 示例](https://github.com/go-kratos/examples/tree/main/traces)
