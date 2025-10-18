---
id: recovery
title: Recovery
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

Recovery middleware is used for abnormal recovery and prevents the program from exiting directly in the event of an exception to the service.

### configuration

Two configuration methods are available in recovery middleware `WithHandler()` and `WithLogger()`。

#### `WithHandler()`

```go
func WithHandler(h HandlerFunc) Option {
	return func(o *options) {
		o.handler = h
	}
}
```
When you set up a service exception, you can use a custom `handler` for handler processing, such as posting exception information to sentry.

#### `WithLogger()`

```go
func WithLogger(logger log.Logger) Option {
	return func(o *options) {
		o.logger = logger
	}
}
```
To set up the `logger` for logging.

### Usage

#### HTTP

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

#### gRPC

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