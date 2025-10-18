---
id: auth
title: 认证
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

## 使用方法

### server

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

### client

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
	grpc.WithEndpoint("xxx.xxx.domain"),
	grpc.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```

## 配置Options

### `WithSigningMethod()`

用于配置JWT签名的算法。适用于 `server` 和 `client`。

例如：

```go
import jwtv4 "github.com/golang-jwt/jwt/v4"

jwt.WithSigningMethod(jwtv4.SigningMethodHS256)
```

### `WithClaims()`

用于配置 `JWT` 的 `claims`。

例：

- 配置 `client` 的 `claims`：

```go
claims := &jwtv4.StandardClaims{}
jwt.WithClaims(func()jwtv4.Claims{return claims})
```

- 配置 `server` 的 `claims`：

> 注意：`server` 的 `claims` 和 `client` 的配置方式有一定的区别，`server` 必须返回一个新对象。目的为了避免出现并发写的问题。
```go
jwt.WithClaims(func()jwtv4.Claims{return &jwtv4.StandardClaims{}})
```

## Example

一个简易的 [example](https://github.com/go-kratos/examples/blob/main/auth/jwt/main.go)，包含了 `server` 和 `client` 的使用。

其中 `client` 配置的是另外一个监听了9001的服务，并且该服务的key和这里配置的 `serviceTestKey` 一样。

```golang
con, _ := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("dns:///127.0.0.1:9001"), // 本地的9001服务
	grpc.WithMiddleware(
		jwt.Client(func(token *jwtv4.Token) (interface{}, error) {
			return []byte(serviceTestKey), nil
		}),
	),
)
```

## 获取用户信息

使用者可通过提供的接口 `jwt.FromContext(ctx)` 获取用户信息。

带有 `JWT Token` 的请求，经过 `server` 侧的 `jwt` 中间件后，`token` 的 `claims` 会放进上下文 `context` 中。  
此时使用者通过提供的接口 `jwt.FromContext(ctx)` 即可获取上下文中的 `claims` 对象，而一般用户信息是存储在 `claims` 里面的。使用者需要对 `claims` 断言后才能进一步处理，`claims` 类型的定义偏业务性质，和token签发的业务耦合。签发时使用的类型，这里就需要断言对应的类型。

接口原型：

```golang
func FromContext(ctx context.Context) (token jwt.Claims, ok bool)
```

## 白名单参考方案

结合 `selector` 中间件使用实现白名单机制。可参考[此处](https://github.com/go-kratos/beer-shop/blob/b12402ebc618c4563e69757e65a6db4dd767a869/app/shop/interface/internal/server/http.go#L26)。

## 签发 `JWT Token`

> 注意：这里签发的 `JWT Token` 只是用于服务间简单认证，并不能作为业务令牌使用。因此也没有开放签发的接口，业务令牌需要使用者根据实际业务自行实现签发逻辑。

`Token` 的签发发生在 `client` 侧，使用者确保 `client` 和 `server` 使用相同的 `Key` 和签名算法即可。签发时附带的用户信息或者其他信息可以通过 `WithClaims()` 来配置。

参考源码：https://github.com/go-kratos/kratos/blob/9e66ac2f5bcb9ab18d9b8d378c5b3233c7bb0a73/middleware/auth/jwt/jwt.go#L148





