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

#### `Network(network string) ServerOption `

To set communication protocol such as tcp.

#### `Address(addr string) ServerOption`

To set server's listening address.

#### `Timeout(timeout time.Duration) ServerOption`

To set the server-side timeout.

#### `Logger(logger log.Logger) ServerOption`

To set logger.

#### `Middleware(m ...middleware.Middleware) ServerOption`

To set middleware for gRPC server.

#### `TLSConfig(c *tls.Config) ServerOption`

To set TLS config.

#### `UnaryInterceptor(in ...grpc.UnaryServerInterceptor) ServerOption`

To set interceptors for gRPC server.

#### `StreamInterceptor(in ...grpc.StreamServerInterceptor) ServerOption`

To set stream interceptors for gRPC server.

#### `Options(opts ...grpc.ServerOption) ServerOption`

To set some extra `grpc.ServerOption`.

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
		log:     log.NewHelper(log.GetLogger()),
	}
  	// apply opts
	for _, o := range opts {
		o(srv)
	}
  	// convert middleware to grpc interceptor
	unaryInts := []grpc.UnaryServerInterceptor{
		srv.unaryServerInterceptor(),
	}
	streamInts := []grpc.StreamServerInterceptor{
		srv.streamServerInterceptor(),
	}

	if len(srv.unaryInts) > 0 {
		unaryInts = append(unaryInts, srv.unaryInts...)
	}
	if len(srv.streamInts) > 0 {
		streamInts = append(streamInts, srv.streamInts...)
	}

  	// convert UnaryInterceptor and StreamInterceptor to ServerOption
	var grpcOpts = []grpc.ServerOption{
		grpc.ChainUnaryInterceptor(unaryInts...),
		grpc.ChainStreamInterceptor(streamInts...),
	}
	// convert LTS config to ServerOption
	if srv.tlsConf != nil {
		grpcOpts = append(grpcOpts, grpc.Creds(credentials.NewTLS(srv.tlsConf)))
	}
	// convert srv.grpcOpts to ServerOption
	if len(srv.grpcOpts) > 0 {
		grpcOpts = append(grpcOpts, srv.grpcOpts...)
	}
  	// create grpc server
	srv.Server = grpc.NewServer(grpcOpts...)
  	// create metadata server
	srv.metadata = apimd.NewServer(srv.Server)
	// set lis and endpoint
	srv.err = srv.listenAndEndpoint()
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
		replyHeader := grpcmd.MD{}
		ctx = transport.NewServerContext(ctx, &Transport{
			endpoint:    s.endpoint.String(),
			operation:   info.FullMethod,
			reqHeader:   headerCarrier(md),
			replyHeader: headerCarrier(replyHeader),
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
		// execute handler
		reply, err := h(ctx, req)
		if len(replyHeader) > 0 {
			_ = grpc.SetHeader(ctx, replyHeader)
		}
		return reply, err
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
	kratos.Server(gs),
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

## Client

### Options

#### `WithEndpoint(endpoint string) ClientOption` 

To set the endpoint which the client will connect to.

#### `WithTimeout(timeout time.Duration) ClientOption`

To set the client-side timeout.

#### `WithMiddleware(m ...middleware.Middleware) ClientOption`

To set middleware.

#### `WithDiscovery(d registry.Discovery) ClientOption`

To set the discovery for gRPC client.

#### `WithTLSConfig(c *tls.Config) ClientOption`

To set TLS config.

#### `WithUnaryInterceptor(in ...grpc.UnaryClientInterceptor) ClientOption`

To set interceptors for gRPC client.

#### `WithOptions(opts ...grpc.DialOption) ClientOption`

To set some extra `grpc.ClientOption`.

#### `WithHealthCheck(healthCheck bool) ClientOption`

To enable or disable the health check.

#### `WithNodeFilter(filters ...selector.NodeFilter) ClientOption`

Set filtering to exclude nodes that should not be requested.

### Implementation Details

#### `dial()`
```go
func dial(ctx context.Context, insecure bool, opts ...ClientOption) (*grpc.ClientConn, error) {
	// default options
  options := clientOptions{
		timeout:      2000 * time.Millisecond,
		balancerName: wrr.Name,
		logger:       log.GetLogger(),
	}
  	// apply opts
	for _, o := range opts {
		o(&options)
	}
  	// convert middleware to grpc interceptor
	ints := []grpc.UnaryClientInterceptor{
		unaryClientInterceptor(options.middleware, options.timeout, options.filters),
	}
	if len(options.ints) > 0 {
		ints = append(ints, options.ints...)
	}
	// client side balancer
	grpcOpts := []grpc.DialOption{
		grpc.WithDefaultServiceConfig(fmt.Sprintf(`{"LoadBalancingPolicy": "%s"}`, options.balancerName)),
		grpc.WithChainUnaryInterceptor(ints...),
	}
	if options.discovery != nil {
    	// To use service discovery
		grpcOpts = append(grpcOpts,
			grpc.WithResolvers(
				discovery.NewBuilder(
					options.discovery,
					discovery.WithInsecure(insecure),
					discovery.WithLogger(options.logger),
				)))
	}
	if insecure {
    	// to disable transport security for connection
		grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(grpcinsecure.NewCredentials()))
	}
	// TLS config
	if options.tlsConf != nil {
		grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(credentials.NewTLS(options.tlsConf)))
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
			reqHeader: headerCarrier{},
			filters:   filters,
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
				header := tr.RequestHeader()
				keys := header.Keys()
				keyvals := make([]string, 0, len(keys))
				for _, k := range keys {
					keyvals = append(keyvals, k, header.Get(k))
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
	conn, err := grpc.DialInsecure(
		context.Background(),
		grpc.WithEndpoint("127.0.0.1:9000"),
	)
```

#### Middleware

```go
conn, err := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("127.0.0.1:9000"),
	grpc.WithTimeout(3600 * time.Second),
  	grpc.WithMiddleware(
		  recovery.Recovery(),
		  validate.Validator(),
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
