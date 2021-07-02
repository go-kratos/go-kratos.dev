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
