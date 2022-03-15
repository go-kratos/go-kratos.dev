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

微服务之间将会通过 HTTP 和 gRPC 进行接口交互，所以服务架构需要统一 Metadata 传递使用。
目前 gRPC 中也可以携带 Metadata 传递，原理是放到 HTTP Header 中，然后上游将会收到对应的 Metadata 信息。
所以设计上，也是通过 HTTP Header 进行传递，在框架中先通过 metadata 包封装成key/value结构，然后携带到 Transport Header 中。

### 默认格式规范

- x-md-global-xxx，全局传递，例如 mirror/color/criticality
- x-md-local-xxx，局部传递，例如 caller

也可以在 middleware/metadata 定制自己的 key prefix，配置固定的元信息传递

### 使用方式
首先配置 client/server 对应的 middleware/metadata 插件，然后可以自定义传递 key prefix，或者 metadata 常量，例如 caller。
最后可以通过 metadata 包中的 `NewClientContext` 或者 `FromServerContext` 进行配置或者获取。


#### 注册 metadata 中间件
```go
// https://github.com/go-kratos/examples/tree/main/metadata

// 注册 metadata 中间件到 gRPC 或 HTTP 的 server 或 client 中

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
#### 获取 metadata 字段的值
```go
if md, ok := metadata.FromServerContext(ctx); ok {
	extra = md.Get("x-md-global-extra")
}
```
#### 传递 metadata
```go
ctx = metadata.AppendToClientContext(ctx, "x-md-global-extra", "2233")
```