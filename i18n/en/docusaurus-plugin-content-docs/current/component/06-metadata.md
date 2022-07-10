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

Microservices interact with each other via HTTP and gRPC API, so the service architecture should use unified Metadata transmission.  
At present, It is possible for gRPC to carry Metadata, by putting Metadata in HTTP Header, so the upstream can receive the corresponding Metadata information.
Therefore, in Kratos, it is also carried by HTTP Header. In the framework, it is packaged in key/value structure, and carried in Transport Header.

### Default Metadata Convention

- x-md-global-xxx，will be transported globally, e.g. mirror/color/criticality
- x-md-local-xxx，will be transported locally, e.g. caller

It is also possible to customize the key prefix in middleware/metadata for constant metadata.

### Usage
First, you need to configure corresponding middleware/metadata plug-ins for the client/server. 
Then you can customize the key prefix or metadata constant, e.g. caller.
Finally you can use `NewClientContext` or `FromServerContext` from Metadata package to configure or get the metadata.


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