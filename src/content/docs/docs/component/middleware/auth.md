---
id: auth
title: Authentication
---

Kratos v3 has no core JWT middleware. Use the maintained contrib module:

```bash
go get github.com/go-kratos/kratos/contrib/middleware/jwt/v3
```

Import its `jwt` package and add its server or client middleware to the matching HTTP or gRPC transport `Middleware` option. Configure the signing key function and claims according to the contrib module's exported options. Claims extracted by successful authentication belong to the request context.

## Usage

Install the module's server middleware in the HTTP or gRPC server chain. Configure its key function, expected signing method, and fresh claims value according to the contrib package API. A claims factory must return a new value for each request if the decoder writes into it.

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

JWT verifies a credential; application authorization remains application code. Use `selector.Server(...)` to exclude explicitly public RPC operations from authentication. Do not copy v2 imports from `middleware/auth/jwt`: that core package is not part of v3.

## Server and client placement

Install the JWT server middleware on incoming HTTP or gRPC transports. Install the client middleware only when a service must issue credentials to a trusted downstream service. Keep token issuance, key rotation, issuer/audience policy, and authorization decisions in application-owned code and configuration.

Protect explicit RPC operations with `selector.Server(...)` rather than relying on an HTTP route match: the selector uses canonical RPC operation names for both transports. Public health and login methods should be intentionally allowlisted and covered by integration tests.

## Read claims and allow public operations

After successful authentication, read claims through the context helper exported by the JWT contrib module, then type-assert to the claims model configured by the application. Do not use claims before checking that extraction succeeded. Wrap the server middleware in `selector.Server(...)` to leave only an explicit operation allowlist public.

```go
claims, ok := kratosjwt.FromContext(ctx)
if !ok {
	return nil, errors.Unauthorized("UNAUTHENTICATED", "missing claims")
}
registered, ok := claims.(*jwtv5.RegisteredClaims)
```

## Issue tokens

Kratos does not issue tokens for an application. Token creation, key ownership, expiration, audience, and refresh policy are application responsibilities. The caller and accepting service must agree on the signing method, verification key, and claims model.

## Security considerations

Use short-lived tokens, validate the expected signing method and claims, and do not log a raw token or claims containing credentials. A valid JWT only establishes the claims chosen by the issuer; check permissions in the business boundary before performing a protected action.