---
id: overview
title: 概览
description: Kratos 内置了一系列的 middleware（中间件）用于处理 logging, metrics 等通用场景。您也可以通过实现 Middleware 接口，开发自定义 middleware，进行通用的业务处理，比如用户登录鉴权等。
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

Kratos 内置了一系列的 middleware（中间件）用于处理 logging、 metrics 等通用场景。您也可以通过实现 Middleware 接口，开发自定义 middleware，进行通用的业务处理，比如用户登录鉴权等。

### 内置中间件

相关代码均可以在`middleware`目录下找到。

* logging: 用于请求日志的记录。
* metrics: 用于启用metric。
* recovery: 用于recovery panic。
* tracing: 用于启用trace。
* validate: 用于处理参数校验。
* metadata: 用于启用元信息传递
* auth: 用于提供基于JWT的认证请求
* ratelimit: 用于服务端流量限制
* circuitbreaker: 用于客户端熔断控制

### 生效顺序

一个请求进入时的处理顺序为Middleware注册的顺序，而响应返回的处理顺序为注册顺序的倒序。

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

### 使用中间件

在`NewGRPCServer`和`NewHTTPServer`中通过`ServerOption`进行注册。
如

```go
// http
// 定义opts
var opts = []http.ServerOption{
    http.Middleware(
        recovery.Recovery(), // 把middleware按照需要的顺序加入
        tracing.Server(),
        logging.Server(),
    ),
}
// 创建server
http.NewServer(opts...)



//grpc
var opts = []grpc.ServerOption{
    grpc.Middleware(
        recovery.Recovery(),  // 把middleware按照需要的顺序加入
        tracing.Server(),
        logging.Server(),
    ),
}
// 创建server
grpc.NewServer(opts...)
```

### 自定义中间件

需要实现`Middleware`接口。
中间件中您可以使用`tr, ok := transport.FromServerContext(ctx)`获得Transporter实例以便访问接口相关的元信息

基本的代码模板

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

### 定制中间件

对特定路由定制中间件

- server:`selector.Server(ms...)` 
- client:`selector.Client(ms...)`

匹配规则(多参数)

- `Path(path...)`        路由匹配
- `Regex(regex...)`     正则匹配
- `Prefix(prefix...)`     前缀匹配
- `Match(fn)`            函数匹配,函数格式为`func(ctx context.Context,operation string) bool`,
  
  `operation`为path,函数返回值为`true`,匹配成功, `ctx`可使用`transport.FromServerContext(ctx)` 或者`transport.FromClientContext(ctx`获取 `Transporter`

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

> **注意: 定制中间件是通过 operation 匹配，并不是http本身的路由！！！** 
> 
> operation 是 HTTP 及 gRPC 统一的 gRPC path

**operation查找**

gRPC path 的拼接规则为 `/包名.服务名/方法名`

比如在如下 proto 文件中，我们要调用 SayHello 这个方法，那么 operation 就为 `/helloworld.Greeter/SayHello`

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
