---
id: auth
title: 认证鉴权
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

`Auth` 中间件用于认证请求。只有通过认证的请求才能被处理，结合 `selector` 中间件可实现白名单。目前提供基于JWT认证的中间件。

### 使用方法

#### server

> 需要配置 `JWT` 秘钥生成函数。

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

> 需要配置 `JWT` 秘钥生成函数。

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
	grpc.WithEndpoint("dns:///127.0.0.1:9001"),
	grpc.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```

### 配置Options

#### `WithSigningMethod()`

用于配置JWT签名的算法。适用于 `server` 和 `client`。

例如：

```go
import jwtv4 "github.com/golang-jwt/jwt/v4"

jwt.WithSigningMethod(jwtv4.SigningMethodHS256)
```

#### `WithClaims()`

用于配置JWT的claims。适用于 `client`。

例如：

```go
claims := jwtv4.StandardClaims{}
jwt.WithClaims(claims)
```

### 获取 `JWT Token` 的 `Claims`

带有 `JWT Token` 的请求，经过 `server` 侧的 `auth` 中间件后，`token` 的 `claims` 会放进上下文 `context` 中。  
使用者可通过提供的接口 `jwt.FromContext(ctx)` 获取上下文中的 `claims`。

### 白名单参考方案

结合 `selector` 中间件使用实现白名单机制。可参考：https://gist.github.com/Casper-Mars/b1a2ddb1cfd3db30522fac537c6bdc82

