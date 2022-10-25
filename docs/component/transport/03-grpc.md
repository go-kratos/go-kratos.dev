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

transporter/grpc 中基于谷歌的 [grpc](https://www.grpc.io/) 框架实现了`Transporter`，用以注册 grpc 到 `kratos.Server()` 中。

## Server

### 配置

#### `Network(network string) ServerOption `

配置服务端的 network 协议，如 tcp

#### `Address(addr string) ServerOption`

配置服务端监听的地址

#### `Timeout(timeout time.Duration) ServerOption`

配置服务端的超时设置

#### `Logger(logger log.Logger) ServerOption`

配置服务端使用的日志组件

#### `Middleware(m ...middleware.Middleware) ServerOption`

配置服务端的 kratos 中间件

#### `TLSConfig(c *tls.Config) ServerOption`

配置服务端的 TLS 配置

#### `UnaryInterceptor(in ...grpc.UnaryServerInterceptor) ServerOption`

配置服务端使用的 grpc 单元拦截器

#### `StreamInterceptor(in ...grpc.StreamServerInterceptor) ServerOption`

配置服务端使用的 grpc 流媒体拦截器

#### `Options(opts ...grpc.ServerOption) ServerOption`

配置一些额外的 grpc.ServerOption

### 主要的实现细节

#### `NewServer()`
```go
func NewServer(opts ...ServerOption) *Server {
  	// grpc server 默认配置
	srv := &Server{
		network: "tcp",
		address: ":0",
		timeout: 1 * time.Second,
		health:  health.NewServer(),
		log:     log.NewHelper(log.GetLogger()),
	}
  	// 递归 opts
	for _, o := range opts {
		o(srv)
	}
  	// kratos middleware 转换成 grpc 拦截器，并处理一些细节
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

  	// 将 UnaryInterceptor 和 StreamInterceptor 转换成 ServerOption
	var grpcOpts = []grpc.ServerOption{
		grpc.ChainUnaryInterceptor(unaryInts...),
		grpc.ChainStreamInterceptor(streamInts...),
	}
	// 将 TLS 配置转化成 ServerOption
	if srv.tlsConf != nil {
		grpcOpts = append(grpcOpts, grpc.Creds(credentials.NewTLS(srv.tlsConf)))
	}
	// 追加通过 Options(opts ...grpc.ServerOption) 添加的options
	if len(srv.grpcOpts) > 0 {
		grpcOpts = append(grpcOpts, srv.grpcOpts...)
	}
  	// 创建 grpc server
	srv.Server = grpc.NewServer(grpcOpts...)
  	// 创建 metadata server
	srv.metadata = apimd.NewServer(srv.Server)
	// 配置 lis 和 endpoint
	srv.err = srv.listenAndEndpoint()
  	// 内部注册
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
    	// 把两个 ctx 合并成一个
		ctx, cancel := ic.Merge(ctx, s.ctx)
		defer cancel()
    	// 从 ctx 中取出 metadata
		md, _ := grpcmd.FromIncomingContext(ctx)
    	// 把一些信息绑定到 ctx 上
		replyHeader := grpcmd.MD{}
		ctx = transport.NewServerContext(ctx, &Transport{
			endpoint:    s.endpoint.String(),
			operation:   info.FullMethod,
			reqHeader:   headerCarrier(md),
			replyHeader: headerCarrier(replyHeader),
		})
    	// ctx 超时设置
		if s.timeout > 0 {
			ctx, cancel = context.WithTimeout(ctx, s.timeout)
			defer cancel()
		}
    	// 中间件处理
		h := func(ctx context.Context, req interface{}) (interface{}, error) {
			return handler(ctx, req)
		}
		if len(s.middleware) > 0 {
			h = middleware.Chain(s.middleware...)(h)
		}
		// 执行中间件 handler
		reply, err := h(ctx, req)
		if len(replyHeader) > 0 {
			_ = grpc.SetHeader(ctx, replyHeader)
		}
		return reply, err
	}
}
```
### 使用方式

简单列举了一些 kratos 中 grpc 的用法，其他 grpc 用法可以到 grpc 仓库中查看。

#### 注册 grpc server
```go
gs := grpc.NewServer()
app := kratos.New(
	kratos.Name("kratos"),
	kratos.Version("v1.0.0"),
	kratos.Server(gs),
)
```

#### grpc server 中使用 kratos middleware
```go
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		logging.Server(),
	),
)
```

#### middleware 中处理 grpc 请求
```go
if info, ok := transport.FromServerContext(ctx); ok {
  kind = info.Kind().String()
  operation = info.Operation()
}
```

## Client

### 配置

#### `WithEndpoint(endpoint string) ClientOption` 

配置客户端使用的对端连接地址，如果不使用服务发现则为ip:port,如果使用服务发现则格式为discovery://\<authority\>/\<serviceName\>

#### `WithTimeout(timeout time.Duration) ClientOption`

配置客户端的请求默认超时时间，如果有链路超时优先使用链路超时时间

#### `WithMiddleware(m ...middleware.Middleware) ClientOption`

配置客户端使用的 kratos 中间件

#### `WithDiscovery(d registry.Discovery) ClientOption`

配置客户端使用的服务发现

#### `WithTLSConfig(c *tls.Config) ClientOption`

配置客户端使用的 TLS 配置

#### `WithUnaryInterceptor(in ...grpc.UnaryClientInterceptor) ClientOption`

配置客户端使用的 grpc 原生拦截器

#### `WithOptions(opts ...grpc.DialOption) ClientOption`

配置一些额外的 grpc.ClientOption

### 主要的实现细节

#### `dial()`
```go
func dial(ctx context.Context, insecure bool, opts ...ClientOption) (*grpc.ClientConn, error) {
	// 默认配置
	options := clientOptions{
		timeout:      2000 * time.Millisecond,
		balancerName: wrr.Name,
		logger:       log.GetLogger(),
	}
	// 遍历 opts
	for _, o := range opts {
		o(&options)
	}
	// 将 kratos 中间件转化成 grpc 拦截器
	ints := []grpc.UnaryClientInterceptor{
		unaryClientInterceptor(options.middleware, options.timeout, options.filters),
	}
	if len(options.ints) > 0 {
		ints = append(ints, options.ints...)
	}
	// 负载均衡
	grpcOpts := []grpc.DialOption{
		grpc.WithDefaultServiceConfig(fmt.Sprintf(`{"LoadBalancingPolicy": "%s"}`, options.balancerName)),
		grpc.WithChainUnaryInterceptor(ints...),
	}
	if options.discovery != nil {
    	// 如果存在服务发现配置，就配置 grpc 的 Resolvers
		grpcOpts = append(grpcOpts,
			grpc.WithResolvers(
				discovery.NewBuilder(
					options.discovery,
					discovery.WithInsecure(insecure),
					discovery.WithLogger(options.logger),
				)))
	}
	if insecure {
    	// 跳过证书验证
		grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(grpcinsecure.NewCredentials()))
	}
	// TLS 配置
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
    	// 把一些信息绑定到 ctx 上
		ctx = transport.NewClientContext(ctx, &Transport{
			endpoint:  cc.Target(),
			operation: method,
			reqHeader: headerCarrier{},
			filters:   filters,
		})
		if timeout > 0 {
      		// timeout 如果大于 0，就重新设置一下 ctx 的超时时间
			var cancel context.CancelFunc
			ctx, cancel = context.WithTimeout(ctx, timeout)
			defer cancel()
		}
    	// 中间件处理
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

### 使用方式

#### 创建客户端连接

```go
conn, err := grpc.DialInsecure(
		context.Background(),
		grpc.WithEndpoint("127.0.0.1:9000"),
	)
```

#### 使用中间件

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

#### 使用服务发现

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
