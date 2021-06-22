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
conn, err := transgrpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("127.0.0.1:9000"),
	 grpc.WithMiddleware(
		middleware.Chain(
			logging.Client(logger),
		),
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

