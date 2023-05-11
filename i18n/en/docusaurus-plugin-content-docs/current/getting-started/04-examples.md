---
id: examples
title: Examples
description: Kratos examples
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

Kratos provides a wealth of sample code/projects for reference

## Components' Usage

[All Examples](https://github.com/go-kratos/examples)

### Configuration

- [config](https://github.com/go-kratos/examples/tree/main/config) example of using config to parse configuration files
- [apollo](https://github.com/go-kratos/examples/tree/main/config/apollo) exmaple of getting configuration from apollo

### Service Discovery and Registration

- [etcd](https://github.com/go-kratos/examples/tree/main/registry/etcd) example of service registration on the server side and service registration on the client side using the etcd plug-in.
- [nacos](https://github.com/go-kratos/examples/tree/main/registry/nacos) example of service registration on the server side and service registration on the client side using the nacos plug-in.
- [consul](https://github.com/go-kratos/examples/tree/main/registry/consul) example of service registration on the server side and service registration on the client side using the consul plug-in.
- [zookeeper](https://github.com/go-kratos/examples/tree/main/registry/zookeeper) example of service registration on the server side and service registration on the client side using the zookeeper plug-in.

### HTTP

- [cors](https://github.com/go-kratos/examples/tree/main/http/cors) example of cross-domain settings
- [gin](https://github.com/go-kratos/examples/tree/main/http/gin) example of use gin as the router.
- [mux](https://github.com/go-kratos/examples/tree/main/http/mux) example of use mux as the router.
- [echo](https://github.com/go-kratos/examples/tree/main/http/echo) example of use echo as the router.
- [static](https://github.com/go-kratos/examples/tree/main/http/static) example of static files serving.
- [upload](https://github.com/go-kratos/examples/tree/main/http/upload) example of file upload.
- [redirect](https://github.com/go-kratos/examples/blob/main/http/redirect) example of redirect.
- [middleware](https://github.com/go-kratos/examples/tree/main/http/middlewares) example of use middleware in the router.
- [errors](https://github.com/go-kratos/examples/tree/main/http/errors) example of error response using unified error handling.

### RPC

- [helloworld](https://github.com/go-kratos/examples/tree/main/helloworld) example of remote calls using http and gRPC.

### Trace

- [traces](https://github.com/go-kratos/examples/tree/main/traces) example of use jaeger for tracing.

### WebSocket

- [ws](https://github.com/go-kratos/examples/tree/main/ws) example of file WebSocket.

### Authentication

- [jwt](https://github.com/go-kratos/examples/tree/main/auth/jwt) emxaple of use JWT authentication in HTTP, gRPC.

### Log

- [zap](https://github.com/go-kratos/examples/tree/main/log) example of use Zap.
- [logrus](https://github.com/go-kratos/examples/tree/main/log) example of use logrus.

### Other

- [i18n](https://github.com/go-kratos/examples/tree/main/i18n) example of internationalization support.
- [header](https://github.com/go-kratos/examples/tree/main/header) example of header.
- [selector](https://github.com/go-kratos/examples/tree/main/selector) example of Selector. Selection by Load Balancing and Filter
- [swagger](https://github.com/go-kratos/examples/tree/main/swagger) example of use Swagger automaticlly genereate interface documentation and provide online services.

## Complete Projects

- [blog](https://github.com/go-kratos/examples/tree/main/blog) a simple CRUD project which includes MySQL Redis integration.

- [beer-shop](https://github.com/go-kratos/beer-shop) an online shop application, mono-repo microservices demo for kratos.
