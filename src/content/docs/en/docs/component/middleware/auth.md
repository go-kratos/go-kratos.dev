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

`Auth` middleware is used to authenticate requests. Only those authenticated could be processed.
At the same time, one can setup white list with `selector` middleware.

## Usage

### server

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

### client

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

Used to set the sigining method.Works for `server` and `client`. 

For examples：

```go
import jwtv4 "github.com/golang-jwt/jwt/v4"

jwt.WithSigningMethod(jwtv4.SigningMethodHS256)
```

#### `WithClaims()`

Used to set the `claims`. 

For examples：

- For `client`:

```go
claims := &jwtv4.StandardClaims{}
jwt.WithClaims(func()jwtv4.Claims{return claims})
```

- For `server`:

> Caution：`server` setting is different to `client`. `server` must return a new object in order to avoid concurrent write problems.

```go
jwt.WithClaims(func()jwtv4.Claims{return &jwtv4.StandardClaims{}})
```


## Example

A simple [example](https://github.com/go-kratos/kratos/blob/9743ad8d32890258177e0335d1a0741e9d45833e/examples/auth/jwt/main.go), includes the use of `server` and `client`.

In particular, `client` is set to visit a service listening the port 9001. And that service should set a key as the same as the client one named `serviceTestKey`.

```golang
con, _ := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("dns:///127.0.0.1:9001"), // Services for local port 9001
	grpc.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```
## Extract Users' Information

In summary, one could get users' information by calling interface `jwt.FromContext(ctx)`.

Under the hook, after processing by the middleware, the `claims` information would be stored into the context. One should assert the `claims` as the type that is used to create the token before using it.

Source code：

```golang
func FromContext(ctx context.Context) (token jwt.Claims, ok bool)
```

## White List Demo

With `selector` middleware, one could setup white list. Ref: https://github.com/go-kratos/beer-shop/blob/a29eae57a9baeae9969e9a7d418ff677cf494a21/app/shop/interface/internal/server/http.go#L41.

## Generate `JWT Token`

> Caution：The generated `JWT Token` is only used to the authentication between the client and the service. There are no interface that generated token for other use case. So user should write thire own code to satify thire use case. 

There only one thing that the user should guarantee: client and service should use same sigining method and key. 
The external information, such as user information, could be set with `WithClaims()` option.

Ref: https://github.com/go-kratos/kratos/blob/9e66ac2f5bcb9ab18d9b8d378c5b3233c7bb0a73/middleware/auth/jwt/jwt.go#L148
