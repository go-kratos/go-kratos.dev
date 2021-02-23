---
id: middleware
title: Middleware
---
Kratos内置了一系列的middleware（中间件）用于处理logging, metrics等通用场景。您也可以通过实现Middleware接口，开发自定义middleware，进行通用的业务处理，比如用户登录鉴权等。

## 内置中间件
相关代码均可以在`middleware`目录下找到。

### logging
代码位于`middleware/logging`，用于请求日志的记录。

### metrics
代码位于`middleware/metrics`，用于启用metric。

### recovery
代码位于`middleware/recovery`，用于recovery panic。

### status
代码位于`middleware/status`，用于grpc的error信息转换处理。

### tracing
代码位于`middleware/tracing`，用于启用trace。

### validate
代码位于`middleware/validate`，用于处理参数校验。

### 

## 使用中间件
在`NewGRPCServer`和`NewHTTPServer`中通过`ServerOption`进行注册。
如
```go
// http
// 定义opts
var opts = http.NewServer([]http.ServerOption{
	http.Middleware(
		middleware.Chain(
			recovery.Recovery(), // 把middleware按照需要的顺序加入到Chain里面
			tracing.Server(),
			logging.Server(),
		),
	),
})
// 创建server
http.NewServer(opts...)



//grpc
var opts = []grpc.ServerOption{
		grpc.Middleware(
			middleware.Chain(
				recovery.Recovery(),  // 把middleware按照需要的顺序加入到Chain里面
				status.Server(),
				tracing.Server(),
				logging.Server(),
			),
		),
	}
// 创建server
grpc.NewServer(opts...)

```


## 自定义中间件
需要实现`Middleware`接口。
[TBD]
