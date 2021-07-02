---
id: examples
title: examples
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

### Components' Usage
#### Configuration
* [config](https://github.com/go-kratos/kratos/tree/main/examples/config) example of using config to parse configuration files

#### Service Discovery and Registration
* [consul](https://github.com/go-kratos/kratos/tree/main/examples/registry/consul) example of service registration on the server side and service registration on the client side using the consul plug-in.
* [etcd](https://github.com/go-kratos/kratos/tree/main/examples/registry/etcd) example of service registration on the server side and service registration on the client side using the etcd plug-in.
* [kube](https://github.com/go-kratos/kratos/tree/main/examples/registry/nacos) example of service registration on the server side and service registration on the client side using the kubernetes plug-in.

#### HTTP
* [gin](https://github.com/go-kratos/kratos/tree/main/examples/http/gin) example of use gin as the router.
* [handler](https://github.com/go-kratos/kratos/tree/main/examples/http/handler) example of use basic http handler.
* [health](https://github.com/go-kratos/kratos/blob/main/examples/http/health/main.go) example of health check API.
* [mux](https://github.com/go-kratos/kratos/tree/main/examples/http/mux) example of use mux as the router.
* [static](https://github.com/go-kratos/kratos/tree/main/examples/http/static) example of static files serving.
* [upload](https://github.com/go-kratos/kratos/tree/main/examples/http/upload) example of file upload.

#### RPC
* [helloworld](https://github.com/go-kratos/kratos/tree/main/examples/helloworld) example of file upload.

#### Trace
* [traces](https://github.com/go-kratos/kratos/tree/main/examples/traces) example of use jaeger for tracing.

#### WebSocket
* [ws](https://github.com/go-kratos/kratos/tree/main/examples/ws) example of file WebSocket.

### Complete Projects
* [blog](https://github.com/go-kratos/kratos/tree/main/examples/blog) a simple CRUD project which includes MySQL Redis integration. 

* [beer-shop](https://github.com/go-kratos/beer-shop) an online shop application, mono-repo microservices demo for kratos.
