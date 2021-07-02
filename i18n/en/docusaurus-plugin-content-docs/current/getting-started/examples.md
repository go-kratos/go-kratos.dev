---
id: examples
title: Examples
description: Kratos Examples
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
* [config](https://github.com/go-kratos/kratos/tree/main/examples/config) Example of using config to parse configuration files

#### Service Discovery and Registration
* [consul](https://github.com/go-kratos/kratos/tree/main/examples/registry/consul)Example of service registration on the server side and service registration on the client side using the consul plug-in.
* [etcd](https://github.com/go-kratos/kratos/tree/main/examples/registry/etcd) Example of service registration on the server side and service registration on the client side using the etcd plug-in.
* [kube](https://github.com/go-kratos/kratos/tree/main/examples/registry/nacos) Example of service registration on the server side and service registration on the client side using the kubernetes plug-in.

#### HTTP
* [gin](https://github.com/go-kratos/kratos/tree/main/examples/http/gin) Example of use gin as the router.
* [handler](https://github.com/go-kratos/kratos/tree/main/examples/http/handler) Example of use basic http handler.
* [health](https://github.com/go-kratos/kratos/blob/main/examples/http/health/main.go) Example of health check API.
* [mux](https://github.com/go-kratos/kratos/tree/main/examples/http/mux) Example of use mux as the router.
* [static](https://github.com/go-kratos/kratos/tree/main/examples/http/static) Example of static files serving.
* [upload](https://github.com/go-kratos/kratos/tree/main/examples/http/upload) Example of file upload.

#### RPC
* [helloworld](https://github.com/go-kratos/kratos/tree/main/examples/helloworld) Example of file upload.

#### Trace
* [traces](https://github.com/go-kratos/kratos/tree/main/examples/traces) Example of use jaeger for tracing.

#### WebSocket
* [ws](https://github.com/go-kratos/kratos/tree/main/examples/ws) Example of file WebSocket.

### Complete Projects
* [blog](https://github.com/go-kratos/kratos/tree/main/examples/blog) A simple CRUD project which includes MySQL Redis integration. 

* [beer-shop](https://github.com/go-kratos/beer-shop) An online shop application, mono-repo microservices demo for kratos.