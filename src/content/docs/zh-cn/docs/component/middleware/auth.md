---
id: auth
title: 认证
---

Kratos v3 核心不再提供 JWT middleware。请使用维护中的 contrib 模块：

```bash
go get github.com/go-kratos/kratos/contrib/middleware/jwt/v3
```

导入其中的 `jwt` 包，并将其 server 或 client middleware 加入对应 HTTP 或 gRPC transport 的 `Middleware` option。签名密钥函数和 claims 使用该 contrib 模块导出的 options 配置；认证成功后可从请求 context 取得 claims。

## 使用方法

在 HTTP 或 gRPC server chain 中安装该模块的 server middleware。根据 contrib package API 配置 key function、预期 signing method 和新的 claims 值。若 decoder 会写入 claims，claims factory 必须为每个 request 返回新值。

```go
import (
	jwtv5 "github.com/golang-jwt/jwt/v5"
	kratosjwt "github.com/go-kratos/kratos/contrib/middleware/jwt/v3"
)

srv := http.NewServer(http.Middleware(
	kratosjwt.Server(
		func(*jwtv5.Token) (any, error) { return []byte(signingKey), nil },
		kratosjwt.WithSigningMethod(jwtv5.SigningMethodHS256),
		kratosjwt.WithClaims(func() jwtv5.Claims { return &jwtv5.RegisteredClaims{} }),
	),
))
```

JWT 用于验证凭据，业务授权仍应在应用代码中完成。使用 `selector.Server(...)` 可明确排除无需认证的公开 RPC operation。不要沿用 v2 的 `middleware/auth/jwt` import，它不属于 v3 核心。

## Server 与 client 放置

在入站 HTTP 或 gRPC transport 安装 JWT server middleware。仅当服务必须向可信下游服务签发凭据时才安装 client middleware。token 签发、密钥轮换、issuer/audience 策略和授权判断应由应用代码和配置持有。

使用 `selector.Server(...)` 按明确 RPC operation 保护接口，而不是按 HTTP route 匹配：selector 在两个 transport 中都使用规范 RPC operation。公开 health 和 login method 应明确加入白名单并覆盖集成测试。

## 获取用户信息与白名单

认证成功后通过 JWT contrib 模块导出的 context helper 读取 claims，再断言为应用配置的 claims model。使用前必须检查读取是否成功。用 `selector.Server(...)` 包装 server middleware，仅保留明确 operation allowlist 为公开接口。

```go
claims, ok := kratosjwt.FromContext(ctx)
if !ok {
	return nil, errors.Unauthorized("UNAUTHENTICATED", "missing claims")
}
registered, ok := claims.(*jwtv5.RegisteredClaims)
```

## 签发 JWT Token

Kratos 不负责为应用签发 token。token 创建、密钥所有权、过期时间、audience 与刷新策略属于应用职责。调用方与接收服务必须就 signing method、验证 key 和 claims model 达成一致。

## 安全注意事项

使用短期 token，校验预期 signing method 和 claims，不要记录原始 token 或含凭据的 claims。有效 JWT 只代表 issuer 选择的 claims；执行受保护动作前仍应在业务边界检查权限。