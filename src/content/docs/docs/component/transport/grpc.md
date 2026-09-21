---
id: grpc
title: gRPC
---

Kratos gRPC transport wraps `google.golang.org/grpc` with the application
lifecycle, Kratos middleware, discovery, balancing, and consistent error and
metadata conversion. Generated protobuf service interfaces remain ordinary
gRPC interfaces.

## Create a server

Construct the server and register generated services in `internal/server`.

```go
srv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Timeout(time.Second),
	grpc.Middleware(
		recovery.Recovery(),
		validate.Validator(),
	),
)
v1.RegisterTodoServiceServer(srv, todo)
```

The server defaults to TCP, address `:0`, and a one-second unary request
timeout. `TLSConfig` installs transport credentials. `Listener` accepts an
existing listener and `Endpoint` overrides the endpoint used for registration.
`Options` passes native `grpc.ServerOption` values.

`Middleware` applies to unary RPCs. Use `StreamMiddleware` for streaming RPCs;
the stream context lasts for the stream lifetime and is not given the unary
timeout automatically. `UnaryInterceptor` and `StreamInterceptor` append native
gRPC interceptors after the Kratos interceptor.

## Built-in gRPC services

By default, the Kratos server registers the standard gRPC health service,
reflection, and gRPC admin services such as channelz. `DisableReflection`
removes reflection. `CustomHealth` prevents automatic health registration so
the application can register its own health implementation. The admin cleanup
runs when the server stops.

During `Start`, the built-in health service changes to `SERVING`; during `Stop`
it changes to `NOT_SERVING`. Shutdown first attempts `GracefulStop` and calls
`Stop` if the supplied shutdown context expires.

## Implement and register services

Define unary or streaming RPCs in protobuf, run `make api`, implement the
generated server interface in `internal/service`, and register it once. A
request reaches middleware with the full operation name, for example
`/todo.v1.TodoService/GetTodo`.

Kratos errors returned by a handler are converted to gRPC status errors.
Framework clients convert received status errors back to Kratos errors, keeping
the code, reason, message, and metadata carried across the wire.

## Create a client

`grpc.NewClient` returns a `*grpc.ClientConn`. It uses a two-second unary timeout
by default, configures weighted round-robin selection, and starts connecting
before it returns.

```go
conn, err := grpc.NewClient(ctx,
	grpc.WithEndpoint("dns:///127.0.0.1:9000"),
	grpc.WithTimeout(2*time.Second),
	grpc.WithMiddleware(logging.Client(logger)),
)
if err != nil {
	return err
}
defer conn.Close()

client := v1.NewTodoServiceClient(conn)
todo, err := client.GetTodo(ctx, &v1.GetTodoRequest{Id: id})
```

Without `WithTLSConfig`, Kratos installs gRPC insecure credentials. Supplying a
TLS configuration enables TLS. `WithOptions` adds native `grpc.DialOption`
values, while unary and stream interceptor options append native interceptors.
Use `WithStreamMiddleware` for generated stream clients.

## Discovery and balancing

For a direct connection, use a target supported by gRPC, such as
`dns:///host:port`. For Kratos service discovery, pass a `registry.Discovery`
and use `discovery:///service-name`:

```go
conn, err := grpc.NewClient(ctx,
	grpc.WithEndpoint("discovery:///todo"),
	grpc.WithDiscovery(discovery),
	grpc.WithNodeFilter(selector.Version("v3.0.0")),
)
```

The client enables gRPC health checking by default. Use
`grpc.WithHealthCheck(false)` when the selected service does not implement it.
`WithSubset` limits the discovery subset and `WithNodeFilter` filters candidate
nodes before the selector chooses one.

## Metadata and stream behavior

Install `metadata.Client()` and `metadata.Server()` to propagate Kratos
metadata. The transport adapters translate it to and from native gRPC metadata.
Use `transport.FromServerContext` or `transport.FromClientContext` in common
middleware instead of coupling it to gRPC internals.

For streaming methods, arrange cancellation, deadlines, and cleanup explicitly.
Closing the client connection ends all streams on that connection; graceful
server shutdown waits for active RPCs until the application shutdown context
expires.
