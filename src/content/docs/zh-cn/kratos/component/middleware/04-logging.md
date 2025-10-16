---
id: logging
title: 日志
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

Logging 中间件用于打印服务收到或发起的请求详情。

### 使用方法

#### grpc server
在 `grpc.ServerOption` 中引入 `logging.Server()`, 则会在每次收到 gRPC 请求的时候打印详细请求信息。

```go
logger := log.DefaultLogger
var opts = []grpc.ServerOption{
	grpc.Middleware(
		logging.Server(logger),
	),
}
srv := grpc.NewServer(opts...)
```

#### grpc client

在 `grpc.WithMiddleware` 中引入 `logging.Client()`, 则会在每次发起 grpc 请求的时候打印详细请求信息。

```go
logger := log.DefaultLogger
conn, err := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("127.0.0.1:9000"),
	grpc.WithMiddleware(
		logging.Client(logger),
	),
)
```
#### http server

在 `http.ServerOption` 中引入 `logging.Server()`, 则会在每次收到 Http 请求的时候打印详细请求信息。

```go
logger := log.DefaultLogger
var opts = []http.ServerOption{
	http.Middleware(
		logging.Server(logger),
	),
}
srv := http.NewServer(opts...)
```

#### http client

在 `http.WithMiddleware` 中引入 `logging.Client()`, 则会在每次发起 Http 请求的时候打印详细请求信息。

```go
logger := log.DefaultLogger
conn, err := http.NewClient(
	context.Background(),
	http.WithMiddleware(
		logging.Client(logger),
	),
	http.WithEndpoint("127.0.0.1:8000"),
)
```

Logging 中间件在server 中只打印 trace_id 不采集数据
### 在项目中使用

####  grpc-server internal/server/grpc.go
```go
exporter, err := stdouttrace.New(stdouttrace.WithWriter(ioutil.Discard))
if err != nil {
	fmt.Printf("creating stdout exporter: %v", err)
	panic(err)
}
tp := tracesdk.NewTracerProvider(
	tracesdk.WithBatcher(exporter),
	tracesdk.WithResource(resource.NewSchemaless(
		semconv.ServiceNameKey.String(Name)),
	))
var opts = []grpc.ServerOption{
		grpc.Middleware(
			tracing.Server(tracing.WithTracerProvider(tp)),
		),
	}
srv := grpc.NewServer(opts...)
```
#### 日志增加trace_id字段  cmd/项目名/main.go
```go
logger := log.With(log.NewStdLogger(os.Stdout),
		"ts", log.DefaultTimestamp,
		"caller", log.DefaultCaller,
		"service.id", id,
		"service.name", Name,
		"service.version", Version,
		"trace_id", tracing.TraceID(),
        "span_id", tracing.SpanID(),
	)
```
#### 日志打印trace_id
```go
log.WithContext(ctx).Errorf("创建xxx失败: %s", err)
```



