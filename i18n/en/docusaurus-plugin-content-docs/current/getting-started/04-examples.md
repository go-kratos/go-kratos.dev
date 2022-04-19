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

### Components' Usage
#### Configuration
* [config](https://github.com/go-kratos/examples/tree/main/config) example of using config to parse configuration files

#### Service Discovery and Registration
* [consul](https://github.com/go-kratos/examples/tree/main/registry/consul) example of service registration on the server side and service registration on the client side using the consul plug-in.
* [etcd](https://github.com/go-kratos/examples/tree/main/registry/etcd) example of service registration on the server side and service registration on the client side using the etcd plug-in.
* [kube](https://github.com/go-kratos/examples/tree/main/registry/nacos) example of service registration on the server side and service registration on the client side using the kubernetes plug-in.

#### HTTP
* [gin](https://github.com/go-kratos/examples/tree/main/http/gin) example of use gin as the router.
* [handler](https://github.com/go-kratos/examples/tree/main/http/handler) example of use basic http handler.
* [health](https://github.com/go-kratos/kratos/blob/main/examples/http/health/main.go) example of health check API.
* [mux](https://github.com/go-kratos/examples/tree/main/http/mux) example of use mux as the router.
* [static](https://github.com/go-kratos/examples/tree/main/http/static) example of static files serving.
* [upload](https://github.com/go-kratos/examples/tree/main/http/upload) example of file upload.

#### RPC
* [helloworld](https://github.com/go-kratos/examples/tree/main/helloworld) example of remote calls using http and gRPC.

#### Trace
* [traces](https://github.com/go-kratos/examples/tree/main/traces) example of use jaeger for tracing.

#### WebSocket
* [ws](https://github.com/go-kratos/examples/tree/main/ws) example of file WebSocket.

### Complete Projects
* [blog](https://github.com/go-kratos/examples/tree/main/blog) a simple CRUD project which includes MySQL Redis integration. 

* [beer-shop](https://github.com/go-kratos/beer-shop) an online shop application, mono-repo microservices demo for kratos.
