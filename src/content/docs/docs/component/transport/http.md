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

Transporter/http is based on the [gorilla/mux](https://github.com/gorilla/mux) HTTP routing framework to implement `Transporter` to register http to `kratos.Server()`.

## Server

### Configuration

#### `Network(network string) ServerOption`

Configure the network protocol of the server, such as tcp

#### `Address(addr string) ServerOption`

Configure the server listening address

#### `Timeout(timeout time.Duration) ServerOption`

Configure server timeout settings

#### `Logger(logger log.Logger) ServerOption`

Configure log which used in http server

#### `Middleware(m ...middleware.Middleware) ServerOption`

Configure the kratos service middleware on the server side

#### `Filter(filters ...FilterFunc) ServerOption`

Configure the server-side kratos global HTTP native Fitler, the execution order of this Filter is before the Service middleware

#### `RequestDecoder(dec DecodeRequestFunc) ServerOption`

Configure the HTTP Request Decode method of the Kratos server to parse the Request Body into a user-defined pb structure
Let's see how the default RequestDecoder in kratos is implemented:

```go
func DefaultRequestDecoder(r *http.Request, v interface{}) error {
	// Extract the corresponding decoder from the Content-Type of the Request Header
	codec, ok := CodecForRequest(r, "Content-Type")
	// If the corresponding decoder cannot be found, an error will be reported at this time
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

Then if we want to extend or replace the parsing implementation corresponding to Content-Type, we can use http.RequestDecoder() to replace Kratos’s default RequestDecoder,
Or it can be extended by registering or overwriting a codec corresponding to a Content-Type in encoding

#### `ResponseEncoder(en EncodeResponseFunc) ServerOption`

Configure the HTTP Response Encode method of the Kratos server to serialize the reply structure in the user pb definition and write it into the Response Body
Let's see how the default ResponseEncoder in kratos is implemented:

```go
func DefaultResponseEncoder(w http.ResponseWriter, r *http.Request, v interface{}) error {
	// Extract the corresponding encoder from the Accept of Request Header
	// If not found, ignore the error and use the default json encoder
	codec, _ := CodecForRequest(r, "Accept")
	data, err := codec.Marshal(v)
	if err != nil {
		return err
	}
	// Write the scheme of the encoder in the Response Header
	w.Header().Set("Content-Type", httputil.ContentType(codec.Name()))
	w.Write(data)
	return nil
}
```

Then if we want to extend or replace the serialization implementation corresponding to Accept, we can use http.ResponseEncoder() to replace the default ResponseEncoder of Kratos,
Or it can be extended by registering or overwriting a codec corresponding to Accept in encoding

#### `ErrorEncoder(en EncodeErrorFunc) ServerOption`

Configure the HTTP Error Encode method of the Kratos server to serialize the error thrown by the business and write it into the Response Body, and set the HTTP Status Code
Let's see how the default ErrorEncoder in kratos is implemented:

```go
func DefaultErrorEncoder(w http.ResponseWriter, r *http.Request, err error) {
	// Get error and convert it into docs Error entity
	se := errors.FromError(err)
	// Extract the corresponding encoder from the Accept of Request Header
	codec, _ := CodecForRequest(r, "Accept")
	body, err := codec.Marshal(se)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", httputil.ContentType(codec.Name()))
	// Set HTTP Status Code
	w.WriteHeader(int(se.Code))
	w.Write(body)
}

```

#### `TLSConfig(c *tls.Config) ServerOption`

Configure the TLSConfig of the kratos to encrypting http traffic.
Let's see how the default TLSConfig in kratos is implemented:

```go
// TLSConfig with TLS config.
func TLSConfig(c *tls.Config) ServerOption {
	return func(o *Server) {
		o.tlsConf = c
	}
}
```

#### `StrictSlash(strictSlash bool) ServerOption`

Configure the StrictSlash of the kratos order the router to redirect URL routes with trailing slashes to those without them.

```go
// StrictSlash is with mux's StrictSlash
// If true, when the path pattern is "/path/", accessing "/path" will
// redirect to the former and vice versa.
func StrictSlash(strictSlash bool) ServerOption {
	return func(o *Server) {
		o.strictSlash = strictSlash
	}
}
```

#### `Listener(lis net.Listener) ServerOption`

Configure the Listener of the kratos implement a generic network listener for stream-oriented protocols.

```go
// Listener with server lis
func Listener(lis net.Listener) ServerOption {
	return func(s *Server) {
		s.lis = lis
	}
}
```

### Start Server

#### `NewServer(opts ...ServerOption) *Server`

Pass in opts configuration and start HTTP Server

```go
hs := http.NewServer()
app := kratos.New(
	kratos.Name("docs"),
	kratos.Version("v1.0.0"),
	kratos.Server(hs),
)
```

#### Use kratos middleware in HTTP server

```go
hs := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		logging.Server(),
	),
)
```

#### Handling http requests in middleware

```go
if tr, ok := transport.FromServerContext(ctx); ok {
	kind = tr.Kind().String()
	operation = tr.Operation()
	// Assert that HTTP transport can get special information
	if ht, ok := tr.(*http.Transport); ok {
		fmt.Println(ht.Request())
	}
}
```

### Server Router

#### `func (s *Server) Route(prefix string, filters ...FilterFunc) *Router`

Create a new HTTP Server Router, which can pass Kraots' HTTP Filter interceptor at the same time
Let's look at the usage:

```go
r := s.Route("/v1")
r.GET("/helloworld/{name}", _Greeter_SayHello0_HTTP_Handler(srv))
```

#### `func (s *Server) Handle(path string, h http.Handler)`

Add the path to the route and use the standard HTTP Handler to handle it

#### `func (s *Server) HandlePrefix(prefix string, h http.Handler)`

The prefix matching method adds the prefix to the route and uses the standard HTTP Handler to handle it

#### `func (s *Server) ServeHTTP(res http.ResponseWriter, req *http.Request)`

Implemented the HTTP Handler interface of the standard library

> Reference for other routing usage methods: [https://github.com/go-kratos/examples/tree/main/http/middlewares](https://github.com/go-kratos/examples/tree/main/http/middlewares)

> Use [gin](https://github.com/gin-gonic/gin) framework in Kratos HTTP: [https://github.com/go-kratos/kratos/blob/main/examples/http/gin/main.go](https://github.com/go-kratos/kratos/blob/main/examples/http/gin/main.go)

## Client

### Configuration

#### `WithTransport(trans http.RoundTripper) ClientOption`

Configure the client's HTTP RoundTripper

#### `WithTimeout(d time.Duration) ClientOption`

Configure the default timeout time of the client request, if there is a link timeout, the link timeout time is preferred

#### `WithUserAgent(ua string) ClientOption`

Configure the default User-Agent of the client

#### `WithMiddleware(m ...middleware.Middleware) ClientOption`

Configure the kratos client middleware used by the client

#### `WithEndpoint(endpoint string) ClientOption`

Configure the peer connection address used by the client, if you do not use service discovery, it is ip:port, if you use service discovery, the format is discovery://\<authority\>/\<serviceName\>, here\<authority\> You can fill in the blanks by default

#### `WithDiscovery(d registry.Discovery) ClientOption`

Configure service discovery used by the client

#### `WithRequestEncoder(encoder EncodeRequestFunc) ClientOption`

Configure the HTTP Request Encode method of the client to serialize the user-defined pb structure to the Request Body
Let's look at the default encoder:

```go
func DefaultRequestEncoder(ctx context.Context, contentType string, in interface{}) ([]byte, error) {
	// Obtain the encoder type through the externally configured contentType
	name := httputil.ContentSubtype(contentType)
	// Get the actual encoder
	body, err := encoding.GetCodec(name).Marshal(in)
	if err != nil {
		return nil, err
	}
	return body, err
}
```

#### `WithResponseDecoder(decoder DecodeResponseFunc) ClientOption`

Configure the HTTP Response Decode method of the client to parse the Response Body into a user-defined pb structure
Let's see how the default decoder in kratos is implemented:

```go
func DefaultResponseDecoder(ctx context.Context, res *http.Response, v interface{}) error {
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}
	// Here you get the corresponding decoder according to the Content-Type in the Response Header
	// Then proceed to Unmarshal
	return CodecForResponse(res).Unmarshal(data, v)
}
```

#### `WithErrorDecoder(errorDecoder DecodeErrorFunc) ClientOption`

Configure the client's Error parsing method
Let's take a look at how the default error decoder in kratos is implemented:

```go
func DefaultErrorDecoder(ctx context.Context, res *http.Response) error {
	// HTTP Status Code is the highest priority
	if res.StatusCode >= 200 && res.StatusCode <= 299 {
		return nil
	}
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if err == nil {
		e := new(errors.Error)
		// Here you get the corresponding response decoder according to the Content-Type in the Response Header
		// Then parse out the main content of the error
		if err = CodecForResponse(res).Unmarshal(data, e); err == nil {
			// HTTP Status Code is the highest priority
			e.Code = int32(res.StatusCode)
			return e
		}
	}
	// If no valid Response Body is returned, the HTTP Status Code shall prevail
	return errors.Errorf(res.StatusCode, errors.UnknownReason, err.Error())
}
```

#### `WithBalancer(b balancer.Balancer) ClientOption`

Configure the client's load balancing strategy

#### `WithBlock() ClientOption`

Configure the dial policy of the client to be blocking (it will not return until the service discovers the node), and the default is asynchronous and non-blocking

#### `WithTLSConfig(c *tls.Config) ClientOption`

Configure the client's tls config

```go
// WithTLSConfig with tls config.
func WithTLSConfig(c *tls.Config) ClientOption {
	return func(o *clientOptions) {
		o.tlsConf = c
	}
}
```

### Client usage

#### Create a client connection

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("127.0.0.1:8000"),
)
```

#### Use middleware

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("127.0.0.1:9000"),
	http.WithMiddleware(
		recovery.Recovery(),
	),
)
```

#### Use service discovery

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("discovery:///helloworld"),
	http.WithDiscovery(r),
)
```