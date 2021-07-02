---
id: recovery
title: 异常恢复 Recovery
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

Recovery 中间件用于异常恢复，服务出现异常的情况下，防止程序直接退出。

### 配置

Recovery 中间件中提供了两个配置方法 `WithHandler()` 和 `WithLogger()`。

#### `WithHandler()`

```go
func WithHandler(h HandlerFunc) Option {
	return func(o *options) {
		o.handler = h
	}
}
```
用于设置服务异常时可以使用自定义的 `handler` 进行处理，例如投递异常信息到 sentry。

#### `WithLogger()`

```go
func WithLogger(logger log.Logger) Option {
	return func(o *options) {
		o.logger = logger
	}
}
```
用于设置中间件打印日志时使用的 `logger`。

### 使用方法

#### http

```go
var opts = []http.ServerOption{
	http.Middleware(
		recovery.Recovery(
      recovery.WithLogger(log.DefaultLogger),
			recovery.WithHandler(func(ctx context.Context, req, err interface{}) error {
					// do someting
					return nil
			}),
    ),
	),
}
srv := http.NewServer(opts...)
```

#### grpc

```go
var opts = []grpc.ServerOption{
	grpc.Middleware(
		recovery.Recovery(
			recovery.WithLogger(log.DefaultLogger),
			recovery.WithHandler(func(ctx context.Context, req, err interface{}) error {
				// do someting
				return nil
			}),
		),
	),
}
srv := grpc.NewServer(opts...)
````