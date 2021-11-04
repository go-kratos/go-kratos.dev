---
id: auth
title: Authentication
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
  - Auth
---

Auth middleware is used to authenticate requests. Only those authenticated could be processed.
At the same time, one can setup white list with `selector` middleware.

### Usage

#### server

> User should provider a `jwt.Keyfunc` as parameter.

- http

```go
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		jwt.Server(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(testKey), nil
		}),
	),
)
```

- grpc

```go
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		jwt.Server(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(testKey), nil
		}),
	),
)
```

#### client

> User should provider a `jwt.Keyfunc` as parameter.

- http

```go
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("127.0.0.1:8000"),
	http.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```

- grpc

```go
con, _ := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("xxx.xxx.domain"),
	grpc.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```

### Options

#### `WithSigningMethod()`

Used to set the sigining method. 

For examples：

```go
import jwtv4 "github.com/golang-jwt/jwt/v4"

jwt.WithSigningMethod(jwtv4.SigningMethodHS256)
```

#### `WithClaims()`

Used to set the claims. Only work for `client`.

For examples：

```go
claims := jwtv4.StandardClaims{}
jwt.WithClaims(claims)
```

### Demo

A simple [demo](https://github.com/go-kratos/kratos/blob/9743ad8d32890258177e0335d1a0741e9d45833e/examples/auth/jwt/main.go)

In particular, `client` is set to visit a service listening the port 9001. And that service should set a key as the same as the client one named `serviceTestKey`.

```golang
con, _ := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("dns:///127.0.0.1:9001"),
	grpc.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```
### Extract Users' Information

In summary, one could get users' information by calling interface `jwt.FromContext(ctx)`.

Under the hook, after processing by the middleware, the `claims` information would be stored into the context.

Source code：

```golang
func FromContext(ctx context.Context) (token jwt.Claims, ok bool)
```

### White List Demo

With `selector` middleware, one could setup white list. Ref: https://gist.github.com/Casper-Mars/b1a2ddb1cfd3db30522fac537c6bdc82 

### Generate `JWT Token`

> Caution：The generated `JWT Token` is only used to the authentication between the client and the service. There are no interface that generated token for other use case. 
So user should write thire own code to satify thire use case. 

There only one thing that the user should guarantee: client and service should use same sigining method and key. 
The external information, such as user information, could be set with `WithClaims()` option.

Ref: https://github.com/go-kratos/kratos/blob/9743ad8d32890258177e0335d1a0741e9d45833e/middleware/auth/jwt/jwt.go#L124

