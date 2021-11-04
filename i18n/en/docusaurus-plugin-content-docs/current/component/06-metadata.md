---
id: metadata
title: Metadata
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

Microservices interact through HTTP and gRPC API, so the service architecture needs to be used for uniform Metadata transport.
Currently, you could also carry a Metadata pass in gRPC, The metadata will be put into HTTP Header, and then upstream will receive the corresponding Metadata Information.
So it's also designed to be delivered via HTTP Header, first wrapped in a key/value structure in a framework through a metadata package, and then carried to Transport Header.

### Default Metadata Convention

- x-md-global-xxx，will be transported globally, e.g. mirror/color/criticality
- x-md-local-xxx，will be transported locally, e.g. caller

You could also set your custom key prefix in  middleware/metadata for constant metadata.

### Usage
First, the middleware/metadata plug-in should be configured to client/server, and then you can customize the transport key prefix, or the metadata constant, such as caller.
Finally, it can be configured or obtained through `NewClientContext` or `FromServerContext` in the metadata package.

#### Configuration
```go
// https://github.com/go-kratos/kratos/tree/main/examples/metadata

// Register the metadata middleware to gRPC or HTTP's server or client

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
#### Get metadata value
```go
if md, ok := metadata.FromServerContext(ctx); ok {
	extra = md.Get("x-md-global-extra")
}
```
#### Set metadata
```go
ctx = metadata.AppendToClientContext(ctx, "x-md-global-extra", "2233")
```