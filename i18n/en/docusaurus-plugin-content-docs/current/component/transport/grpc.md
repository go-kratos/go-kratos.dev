---
id: grpc
title: gRPC
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
Our transporter/grpc is developed upon [gRPC](https://www.grpc.io/), and implements `Transporter` interface. You could use it for the communication between services on gRPC protocol.

## Server

### Options

#### `Network()`

To set communication protocol such as tcp.

#### `Address()`

To set server's listening address.

#### `Timeout()`

To set the server-side timeout.

#### `Logger()`

To set logger.

#### `Middleware()`

To set middleware for gRPC server.

#### `UnaryInterceptor()`

To set interceptors for gRPC server.

#### `Options()`

To set some extra `grpc.ServerOption`

### Implementation Details

#### `NewServer()`
```go
func NewServer(opts ...ServerOption) *Server {
  // grpc server default configuration
	srv := &Server{
		network: "tcp",
		address: ":0",
		timeout: 1 * time.Second,
		health:  health.NewServer(),
		log:     log.NewHelper(log.DefaultLogger),
	}
  // apply opts
	for _, o := range opts {
		o(srv)
	}
  // convert middleware to grpc interceptor
	var ints = []grpc.UnaryServerInterceptor{
		srv.unaryServerInterceptor(),
	}

	if len(srv.ints) > 0 {
		ints = append(ints, srv.ints...)
	}

  // convert UnaryInterceptor to ServerOption
	var grpcOpts = []grpc.ServerOption{
		grpc.ChainUnaryInterceptor(ints...),
	}
	if len(srv.grpcOpts) > 0 {
		grpcOpts = append(grpcOpts, srv.grpcOpts...)
	}
  // create grpc server
	srv.Server = grpc.NewServer(grpcOpts...)
  // create metadata server
	srv.metadata = apimd.NewServer(srv.Server)
	// register these internal API
	grpc_health_v1.RegisterHealthServer(srv.Server, srv.health)
	apimd.RegisterMetadataServer(srv.Server, srv.metadata)
	reflection.Register(srv.Server)
	return srv
}
```

#### `unaryServerInterceptor()`

```go
func (s *Server) unaryServerInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    // merge two ctx
		ctx, cancel := ic.Merge(ctx, s.ctx)
		defer cancel()
    // get metadata from ctx
		md, _ := grpcmd.FromIncomingContext(ctx)
    // bind some information into ctx
		ctx = transport.NewServerContext(ctx, &Transport{
			endpoint:  s.endpoint.String(),
			operation: info.FullMethod,
			header:    headerCarrier(md),
		})
    // set timeout
		if s.timeout > 0 {
			ctx, cancel = context.WithTimeout(ctx, s.timeout)
			defer cancel()
		}
    // middleware
		h := func(ctx context.Context, req interface{}) (interface{}, error) {
			return handler(ctx, req)
		}
		if len(s.middleware) > 0 {
			h = middleware.Chain(s.middleware...)(h)
		}
		return h(ctx, req)
	}
}
```
### Usage

These are some basic usage of gRPC, you could refer to [gRPC Docs](https://pkg.go.dev/google.golang.org/grpc) for advanced examples.

#### Register gRPC Server
```go
gs := grpc.NewServer()
app := kratos.New(
	kratos.Name("kratos"),
	kratos.Version("v1.0.0"),
	kraotos.Server(gs),
)
```

#### Set middleware in gRPC Server
```go
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		logging.Server(),
	),
)
```

#### Process Request in gRPC Middleware
```go
if info, ok := transport.FromServerContext(ctx); ok {
  kind = info.Kind().String()
  operation = info.Operation()
}
```

## client

### Options

#### `WithEndpoint()` 

To set the endpoint which the client will connect to.

#### `WithTimeout()`

To set the client-side timeout.

#### `WithMiddleware()`

To set middleware.

#### `WithDiscovery()`

To set the discovery for gRPC client.

#### `WithUnaryInterceptor()`

To set interceptors for gRPC client.

#### `WithOptions()`

To set some extra `grpc.ClientOption`

### Implementation Details

#### `dial()`
```go
func dial(ctx context.Context, insecure bool, opts ...ClientOption) (*grpc.ClientConn, error) {
	// default options
  options := clientOptions{
		timeout: 500 * time.Millisecond,
	}
  // apply opts
	for _, o := range opts {
		o(&options)
	}
  // convert middleware to grpc interceptor
	var ints = []grpc.UnaryClientInterceptor{
		unaryClientInterceptor(options.middleware, options.timeout),
	}
	if len(options.ints) > 0 {
		ints = append(ints, options.ints...)
	}
	var grpcOpts = []grpc.DialOption{
    // client side balancer
		grpc.WithBalancerName(roundrobin.Name),
		grpc.WithChainUnaryInterceptor(ints...),
	}
	if options.discovery != nil {
    // To use service discovery
		grpcOpts = append(grpcOpts, grpc.WithResolvers(discovery.NewBuilder(options.discovery)))
	}
	if insecure {
    // to disable transport security for connection
		grpcOpts = append(grpcOpts, grpc.WithInsecure())
	}
	if len(options.grpcOpts) > 0 {
		grpcOpts = append(grpcOpts, options.grpcOpts...)
	}
	return grpc.DialContext(ctx, options.endpoint, grpcOpts...)
}
```

#### `unaryClientInterceptor()`

```go
func unaryClientInterceptor(ms []middleware.Middleware, timeout time.Duration) grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
    // bind some information into ctx
		ctx = transport.NewClientContext(ctx, &Transport{
			endpoint:  cc.Target(),
			operation: method,
			header:    headerCarrier{},
		})
		if timeout > 0 {
      // set the timeout
			var cancel context.CancelFunc
			ctx, cancel = context.WithTimeout(ctx, timeout)
			defer cancel()
		}
    // middleware 
		h := func(ctx context.Context, req interface{}) (interface{}, error) {
			if tr, ok := transport.FromClientContext(ctx); ok {
				keys := tr.Header().Keys()
				keyvals := make([]string, 0, len(keys))
				for _, k := range keys {
					keyvals = append(keyvals, k, tr.Header().Get(k))
				}
				ctx = grpcmd.AppendToOutgoingContext(ctx, keyvals...)
			}
			return reply, invoker(ctx, method, req, reply, cc, opts...)
		}
		if len(ms) > 0 {
			h = middleware.Chain(ms...)(h)
		}
		_, err := h(ctx, req)
		return err
	}
}
```

### Usage

#### Client Connection

```go
	conn, err := gprc.DialInsecure(
		context.Background(),
		grpc.WithEndpoint("127.0.0.1:9000"),
	)
```

#### Middleware

```go
conn, err := grpc.DialInsecure(
	context.Background(),
	transport.WithEndpoint("127.0.0.1:9000"),
  	transport.WithMiddleware(
		  recovery.Recovery(),
	),
)
```

#### Service Discovery

```go
conn, err := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("discovery:///helloworld"),
	grpc.WithDiscovery(r),
)
```

## References

* https://www.grpc.io/
* https://www.grpc.io/docs/languages/go/quickstart/
* https://github.com/grpc/grpc-go