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

The Kratos framework abstracts the transport layer, the developers can access the implementation through the implementation interface, and the framework implements the communication protocol transport layer of gRPC and HTTP by default. Developers can refer to the official implementation code when implementing the communication protocol transport layer.

- [grpc](https://github.com/go-kratos/kratos/tree/main/transport/grpc)
- [http](https://github.com/go-kratos/kratos/tree/main/transport/http)

### Interface

#### `server`
```go
// The start and stop for server lifecycle management.
type Server interface {
	Start(context.Context) error
	Stop(context.Context) error
}
```

#### `Transporter`
```go
type Transporter interface {
	// The type of transporter, such the included "http" and "grpc", you could also implement new kind such as mqtt, websocket etc.
	Kind() Kind
	// The address of the server
	Endpoint() string
	// The full route of method
	// E.g.: /helloworld.Greeter/SayHello
	Operation() string
 	// The metadata of gRPC or the Header of HTTP
	Header() Header
}
```
#### `Endpointer`
```go
type Endpointer interface {
	// This method is required for service register
	Endpoint() (*url.URL, error)
}
```

### Usage
Register http or grpc into server.

```go
app := kratos.New(
	kratos.Name(Name),
	kratos.Server(
		httpSrv,
	),
)
```
