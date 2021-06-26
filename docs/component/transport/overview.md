---
id: overview
title: Overview
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

 kratos 框架对传输层进行了抽象，用户可以通过实现接口来接入实现，框架默认实现了gRPC和HTTP两种通信协议传输层。用户在实现通讯协议传输层时可以参考一下官方实现的代码。

- [grpc](https://github.com/go-kratos/kratos/tree/main/transport/grpc)
- [http](https://github.com/go-kratos/kratos/tree/main/transport/http)

### 接口抽象

#### `Transporter`
```go
type Transporter interface {
	// 代表实现的通讯协议的种类，如内置的 http grpc，也可以实现其他的类型如 mqtt，websocket
	Kind() Kind
	// 提供的服务终端地址
	Endpoint() string
	// 用于标识服务的完整方法路径
	// 示例: /helloworld.Greeter/SayHello
	Operation() string
 	// http 的请求头或者 grpc 的元数据
	Header() Header
}
```
#### `Endpointer`
```go
type Endpointer interface {
	// 用于实现注册到注册中心的终端地址，如果不实现这个方法则不会注册到注册中心
	Endpoint() (*url.URL, error)
}
```

### 使用方式

使用方式将 http 或 grpc 注册到 server 中

```go
app := kratos.New(
	kratos.Name(Name),
	kratos.Server(
		httpSrv,
	),
)
```
