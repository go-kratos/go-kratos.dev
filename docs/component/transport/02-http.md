---
id: http
title: HTTP
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

transporter/http 中基于 [gorilla/mux](https://github.com/gorilla/mux) HTTP路由框架实现了`Transporter`，用以注册 http 到 `kratos.Server()` 中。

## Server

### 配置

#### `Network(network string) ServerOption`

配置服务端的 network 协议，如 tcp

#### `Address(addr string) ServerOption`

配置服务端监听的地址

#### `Timeout(timeout time.Duration) ServerOption`

配置服务端的超时设置

#### `Logger(logger log.Logger) ServerOption`

配置服务端使用日志

#### `Middleware(m ...middleware.Middleware) ServerOption`

配置服务端的 kratos Service中间件

#### `Filter(filters ...FilterFunc) ServerOption`

配置服务端的 kratos 全局HTTP原生Fitler，此Filter执行顺序在Service中间件之前

#### `RequestDecoder(dec DecodeRequestFunc) ServerOption`

配置kratos服务端的 HTTP Request Decode方法，用来将Request Body解析至用户定义的pb结构体中
我们看下kratos中默认的RequestDecoder是怎么实现的：

```go
func DefaultRequestDecoder(r *http.Request, v interface{}) error {
  // 从Request Header的Content-Type中提取出对应的解码器
  codec, ok := CodecForRequest(r, "Content-Type")
  // 如果找不到对应的解码器此时会报错
	if !ok {
		return errors.BadRequest("CODEC", r.Header.Get("Content-Type"))
	}
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return errors.BadRequest("CODEC", err.Error())
	}
	if err = codec.Unmarshal(data, v); err != nil {
		return errors.BadRequest("CODEC", err.Error())
	}
	return nil
}
```
那么如果我们想要扩展或者替换Content-Type对应的解析实现，就可以通过http.RequestDecoder()来替换kratos默认的RequestDecoder，
或者也可以通过在encoding中注册或覆盖一个Content-Type对应的codec来进行扩展

#### `ResponseEncoder(en EncodeResponseFunc) ServerOption`
配置kratos服务端的 HTTP Response Encode方法，用来将用户pb定义里的reply结构体序列化后写入Response Body中
我们看下kratos中默认的ResponseEncoder是怎么实现的：
```go
func DefaultResponseEncoder(w http.ResponseWriter, r *http.Request, v interface{}) error {
  // 通过Request Header的Accept中提取出对应的编码器
  // 如果找不到则忽略报错，并使用默认json编码器
	codec, _ := CodecForRequest(r, "Accept")
	data, err := codec.Marshal(v)
	if err != nil {
		return err
  }
  // 在Response Header中写入编码器的scheme
	w.Header().Set("Content-Type", httputil.ContentType(codec.Name()))
	w.Write(data)
	return nil
}
```
那么如果我们想要扩展或者替换Accept对应的序列化实现，就可以通过http.ResponseEncoder()来替换kratos默认的ResponseEncoder，
或者也可以通过在encoding中注册或覆盖一个Accept对应的codec来进行扩展

#### `ErrorEncoder(en EncodeErrorFunc) ServerOption`
配置kratos服务端的 HTTP Error Encode方法，用来将业务抛出的error序列化后写入Response Body中，并设置HTTP Status Code
我们看下kratos中默认的ErrorEncoder是怎么实现的：
```go
func DefaultErrorEncoder(w http.ResponseWriter, r *http.Request, err error) {
  // 拿到error并转换成kratos Error实体
  se := errors.FromError(err)
  // 通过Request Header的Accept中提取出对应的编码器
	codec, _ := CodecForRequest(r, "Accept")
	body, err := codec.Marshal(se)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
  w.Header().Set("Content-Type", httputil.ContentType(codec.Name()))
  // 设置HTTP Status Code
	w.WriteHeader(int(se.Code))
	w.Write(body)
}
```

### 启动 Server

#### `NewServer(opts ...ServerOption) *Server `
传入opts配置并启动HTTP Server
```go
hs := http.NewServer()
app := kratos.New(
	kratos.Name("kratos"),
	kratos.Version("v1.0.0"),
	kratos.Server(hs),
)
```

#### HTTP server 中使用 kratos middleware
```go
hs := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		logging.Server(),
	),
)
```

#### middleware 中处理 http 请求
```go
if tr, ok := transport.FromServerContext(ctx); ok {
	kind = tr.Kind().String()
	operation = tr.Operation()
	// 断言成HTTP的Transport可以拿到特殊信息
	if ht,ok := tr.(*http.Tranport);ok{
		fmt.Println(ht.Request())
	} 
}
```

### Server Router

#### `func (s *Server) Route(prefix string, filters ...FilterFunc) *Router`
创建一个新的HTTP Server Router，同时可以传递kratos的HTTP Filter拦截器
我们看下用法：
```go
	r := s.Route("/v1")
	r.GET("/helloworld/{name}", _Greeter_SayHello0_HTTP_Handler(srv))
```

#### `func (s *Server) Handle(path string, h http.Handler)`
将path添加到路由中，并使用标准的HTTP Handler来处理

#### `func (s *Server) HandlePrefix(prefix string, h http.Handler)`
前缀匹配的方式将prefix添加到路由中，并使用标准的HTTP Handler来处理

#### `func (s *Server) ServeHTTP(res http.ResponseWriter, req *http.Request)`
实现了标准库的HTTP Handler接口


> 其他路由使用方法参考: https://github.com/go-kratos/examples/tree/main/http/middlewares

> 在Kratos HTTP中使用[gin](https://github.com/gin-gonic/gin)框架: https://github.com/go-kratos/kratos/blob/main/examples/http/gin/main.go

## Client

### 配置

#### `WithTransport(trans http.RoundTripper) ClientOption`
配置客户端的HTTP RoundTripper

#### `WithTimeout(d time.Duration) ClientOption`
配置客户端的请求默认超时时间，如果有链路超时优先使用链路超时时间

#### `WithUserAgent(ua string) ClientOption`
配置客户端的默认User-Agent

#### `WithMiddleware(m ...middleware.Middleware) ClientOption`
配置客户端使用的 kratos client中间件

#### `WithEndpoint(endpoint string) ClientOption` 
配置客户端使用的对端连接地址，如果不使用服务发现则为ip:port,如果使用服务发现则格式为discovery://\<authority\>/\<serviceName\>,这里\<authority\>可以默认填空

#### `WithDiscovery(d registry.Discovery) ClientOption`
配置客户端使用的服务发现

#### `WithRequestEncoder(encoder EncodeRequestFunc) ClientOption`
配置客户端的 HTTP Request Encode方法，用来将户定义的pb结构体中序列化至Request Body
我们看下默认的encoder:
```go
func DefaultRequestEncoder(ctx context.Context, contentType string, in interface{}) ([]byte, error) {
	// 通过外部配置的contentType获取encoder类型
	name := httputil.ContentSubtype(contentType)
	// 拿到实际的encoder
	body, err := encoding.GetCodec(name).Marshal(in)
	if err != nil {
		return nil, err
	}
	return body, err
}
```

#### `WithResponseDecoder(decoder DecodeResponseFunc) ClientOption `
配置客户端的 HTTP Response Decode方法，用来将Response Body解析至用户定义的pb结构体中
我们看下kratos中默认的decoder是怎么实现的：
```go
func DefaultResponseDecoder(ctx context.Context, res *http.Response, v interface{}) error {
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}
	// 这里根据Response Header中的Content-Type拿到对应的decoder
	// 然后进行Unmarshal
	return CodecForResponse(res).Unmarshal(data, v)
}
```

#### `WithErrorDecoder(errorDecoder DecodeErrorFunc) ClientOption`
配置客户端的Error解析方法
我们看下kratos中默认的error decoder是怎么实现的：
```go
func DefaultErrorDecoder(ctx context.Context, res *http.Response) error {
	// HTTP Status Code 为最高优先级
	if res.StatusCode >= 200 && res.StatusCode <= 299 {
		return nil
	}
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if err == nil {
		e := new(errors.Error)
		// 这里根据Response Header中的Content-Type拿到对应的response decoder
		// 然后解析出error主体内容
		if err = CodecForResponse(res).Unmarshal(data, e); err == nil {
			// HTTP Status Code 为最高优先级
			e.Code = int32(res.StatusCode)
			return e
		}
	}
	// 如果没有返回合法的Response Body则直接以HTTP Status Code为准
	return errors.Errorf(res.StatusCode, errors.UnknownReason, err.Error())
}
```

#### `WithBalancer(b balancer.Balancer) ClientOption`
配置客户端的负载均衡策略


#### `WithBlock() ClientOption`
配置客户端的Dial策略为阻塞（直到服务发现发现节点才返回），默认为异步非阻塞

### Client使用方式

#### 创建客户端连接

```go
	conn, err := http.NewClient(
		context.Background(),
		http.WithEndpoint("127.0.0.1:8000"),
	)
```

#### 使用中间件

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("127.0.0.1:9000"),
  	http.WithMiddleware(
		  recovery.Recovery(),
	),
)
```

#### 使用服务发现

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("discovery:///helloworld"),
	http.WithDiscovery(r),
)
```
