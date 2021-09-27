---
id: logging
title: Logging
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

Logging middleware is used to print the details of requests received or initiated by the service.

### Usage

#### gRPC server
By passing `logging.Server()` in `grpc.ServerOption`, Kratos will print detailed request information every time a gRPC request is received.

```go
logger := log.DefaultLogger
var opts = []grpc.ServerOption{
	grpc.Middleware(
		logging.Server(logger),
	),
}
srv := grpc.NewServer(opts...)
```

#### gRPC client

By passing `logging.Client()` in `grpc.WithMiddleware`, Kratos will print detailed request information every time a grpc request is initiated.

```go
logger := log.DefaultLogger
var opts = []http.ServerOption{
	http.Middleware(
		logging.Server(logger),
	),
}
srv := http.NewServer(opts...)
```

#### HTTP client

By passing `logging.Client()` in `http.WithMiddleware`, Kratos will print detailed request information every time an Http request is initiated.

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

The Logging middleware only prints `trace_id` in the server and does not collect data.

#### grpc-server

```go
// internal/server/grpc.go

exporter, err := stdouttrace.New(stdouttrace.WithWriter(ioutil.Discard))
if err != nil {
	fmt.Printf("creating stdout exporter: %v", err)
	panic(err)
}

tp := tracesdk.NewTracerProvider(
	tracesdk.WithBatcher(exporter),
	tracesdk.WithResource(resource.NewSchemaless(
		semconv.ServiceNameKey.String(Name)),
	)
)

var opts = []grpc.ServerOption{
  grpc.Middleware(
    tracing.Server(tracing.WithTracerProvider(tp)),
  ),
}

srv := grpc.NewServer(opts...)
```

Add the `trace_id` field to the output log

```go
// cmd/project_name/main.go

logger := log.With(
  log.NewStdLogger(os.Stdout),
  "ts", log.DefaultTimestamp,
  "caller", log.DefaultCaller,
  "service.id", id,
  "service.name", Name,
  "service.version", Version,
  "trace_id", log.TraceID(),
  "span_id", log.SpanID(),
)
```

Log `trace_id`

```go
log.WithContext(ctx).Errorf("Field created: %s", err)
```