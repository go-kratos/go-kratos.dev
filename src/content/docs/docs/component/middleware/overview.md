---
id: overview
title: Overview
---

Kratos has a series of built-in middleware to deal with common purpose such as logging or metrics. You could also implement **Middleware** interface to develop your custom middleware to process common business such as the user authentication etc.

## Built-in Middleware

Their codes are located in `middleware` directory.

- `logging`: This middleware is for logging the request.
- `metrics`: This middleware is for enabling metric.
- `recovery`: This middleware is for panic recovery.
- `tracing`: This middleware is for enabling trace.
- `validate`: This middleware is for parameter validation.
- `metadata`: This middleware is for enabling metadata transmission.
- `auth`: This middleware is for authority check using JWT.
- `ratelimit`: This middleware is for traffic control in server side.
- `circuitbreaker`: This middleware is for breaker control in client side.

## Effective Sequence

The execution sequence of the request is the sequence of Middleware registration, and the execution sequence of the response returned is the reverse of the registration sequence.That is a First In, Last Out (FILO).

```
         ┌───────────────────┐
         │MIDDLEWARE 1       │
         │ ┌────────────────┐│
         │ │MIDDLEWARE 2    ││
         │ │ ┌─────────────┐││
         │ │ │MIDDLEWARE 3 │││
         │ │ │ ┌─────────┐ │││
REQUEST  │ │ │ │  YOUR   │ │││  RESPONSE
   ──────┼─┼─┼─▷ HANDLER ○─┼┼┼───▷
         │ │ │ └─────────┘ │││
         │ │ └─────────────┘││
         │ └────────────────┘│
         └───────────────────┘
```

## Usage

Register it with `ServerOption` in `NewGRPCServer` or `NewHTTPServer`.

For example:

```go
// http
// define opts
var opts = []http.ServerOption{
	http.Middleware(
		recovery.Recovery(),
		tracing.Server(),
		logging.Server(),
	),
}
// create server
http.NewServer(opts...)

//grpc
var opts = []grpc.ServerOption{
		grpc.Middleware(
			recovery.Recovery(),
			status.Server(),
			tracing.Server(),
			logging.Server(),
		),
	}

// create server
grpc.NewServer(opts...)
```

## Modify Middleware

Need to implement the `Middleware` interface.

In the middleware, you can use `tr, ok := transport.FromServerContext(ctx)` to get the **Transporter** instance to access metadata about the interface.

Example:

```go
import (
    "context"

    "github.com/go-kratos/kratos/v2/middleware"
    "github.com/go-kratos/kratos/v2/transport"
)

func Middleware1() middleware.Middleware {
    return func(handler middleware.Handler) middleware.Handler {
        return func(ctx context.Context, req interface{}) (reply interface{}, err error) {
            if tr, ok := transport.FromServerContext(ctx); ok {
                // Do something on entering
                defer func() {
                // Do something on exiting
                 }()
            }
            return handler(ctx, req)
        }
    }
}
```

## Custom Middleware

Customized middleware for specific routes:

- server: `selector.Server(ms...)`
- client: `selector.Client(ms...)`

Matching rule (multi parameter):

- `Path(path...)`: path match
- `Regex(regex...)`: regex match
- `Prefix(prefix...)`: prefix path match
- `Match(fn)`: function match, The function format is `func(ctx context.Context,operation string) bool`. `operation` is path,If the return value is `true`,match successful, `ctx` for `transport.FromServerContext(ctx)` or `transport.FromClientContext(ctx` get `Transporter)`.

**http server**

```go
import "github.com/go-kratos/kratos/v2/middleware/selector"

http.Middleware(
            selector.Server(recovery.Recovery(), tracing.Server(),testMiddleware).
                Path("/hello.Update/UpdateUser", "/hello.kratos/SayHello").
                Regex(`/test.hello/Get[0-9]+`).
                Prefix("/kratos.", "/go-kratos.", "/helloworld.Greeter/").
                Build(),
        )
```

**http client**

```go
import "github.com/go-kratos/kratos/v2/middleware/selector"

http.WithMiddleware(
            selector.Client(recovery.Recovery(), tracing.Server(),testMiddleware).
                Path("/hello.Update/UpdateUser", "/hello.kratos/SayHello").
                Regex(`/test.hello/Get[0-9]+`).
                Prefix("/kratos.", "/go-kratos.", "/helloworld.Greeter/").
                Match(func(ctx context.Context,operation string) bool {
                    if strings.HasPrefix(operation, "/go-kratos.dev") || strings.HasSuffix(operation, "world") {
                        return true
                    }
                    tr, ok := transport.FromClientContext(ctx)
                    if !ok {
                        return false
				    }
                    if tr.RequestHeader().Get("go-kratos") == "kratos" {
					    return true
				    }
                    return false
                }).Build(),
        )
```

**grpc server**

```go
import "github.com/go-kratos/kratos/v2/middleware/selector"

grpc.Middleware(
            selector.Server(recovery.Recovery(), tracing.Server(),testMiddleware).
                Path("/hello.Update/UpdateUser", "/hello.kratos/SayHello").
                Regex(`/test.hello/Get[0-9]+`).
                Prefix("/kratos.", "/go-kratos.", "/helloworld.Greeter/").
                Build(),
        )
```

**grpc client**

```go
import "github.com/go-kratos/kratos/v2/middleware/selector"

grpc.Middleware(
            selector.Client(recovery.Recovery(), tracing.Server(),testMiddleware).
                Path("/hello.Update/UpdateUser", "/hello.kratos/SayHello").
                Regex(`/test.hello/Get[0-9]+`).
                Prefix("/kratos.", "/go-kratos.", "/helloworld.Greeter/").
                Build(),
        )
```

> **Note: the customized middleware matches through `operation`, not is the HTTP routing ! ! ! **
>
> operation is the unified GRC path of HTTP and GRC.

**operation find**

gRPC path's splicing rule is `/package.Service/Method`.

For example, in the following proto file，if we want to call the sayhello method, then the operation is `/helloworld.Greeter/SayHello`.

```protobuf
syntax = "proto3";

package helloworld;

import "google/api/annotations.proto";

option go_package = "github.com/go-kratos/examples/helloworld/helloworld";

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply)  {
        option (google.api.http) = {
            get: "/helloworld/{name}",
        };
  }
}
// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```
