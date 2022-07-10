---
id: metadata
title: 元信息传递
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

微服务之间通过 HTTP 和 gRPC API 进行接口交互，服务架构需要使用统一的元信息（Metadata）传输进行微服务间的传递。
目前 gRPC 中可以携带元信息传递，原理是将元信息放入 HTTP Header 中，这样上游即可收到对应的元信息 信息。
因此在Kratos的设计上，也是通过 HTTP Header 进行传递。在框架中先将元信息包封装成key/value结构，然后携带到 Transport Header 中。

### 默认格式规范

- x-md-global-xxx，全局传递，例如 mirror/color/criticality
- x-md-local-xxx，局部传递，例如 caller

也可以在 middleware/metadata 定制自己的 key prefix，配置固定的元信息传递

### 使用方式
首先配置 client/server 对应的 middleware/metadata 插件，然后可以自定义传递 key prefix，或者元信息常量，例如 caller。
然后可以通过元信息包中的 `NewClientContext` 或者 `FromServerContext` 进行配置或者获取。


#### 注册元信息中间件
```go
// https://github.com/go-kratos/kratos/tree/main/examples/metadata

// 注册元信息中间件到 gRPC 或 HTTP 的 server 或 client 中

// server
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		metadata.Server(),
	),
)
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		metadata.Server(),
	),
)

// client
conn, err := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("127.0.0.1:9000"),
	grpc.WithMiddleware(
		metadata.Client(),
	),
)
```
#### 获取元信息字段的值
```go
if md, ok := metadata.FromServerContext(ctx); ok {
	extra = md.Get("x-md-global-extra")
}
```
#### 设置元信息字段的值
```go
ctx = metadata.AppendToClientContext(ctx, "x-md-global-extra", "2233")
```