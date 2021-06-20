---
id: examples
title: 代码示例
description: Kratos 代码示例
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
Kratos提供了丰富的示例代码/项目供参考

## 组件使用
### 配置
* [config](https://github.com/go-kratos/kratos/tree/main/examples/config) 使用config组件解析配置文件的示例

### 服务发现&服务注册
* [consul](https://github.com/go-kratos/kratos/tree/main/examples/registry/consul) 使用consul插件，在server端进行服务注册和在client端进行服务注册的示例
* [etcd](https://github.com/go-kratos/kratos/tree/main/examples/registry/etcd) 使用etcd插件，在server端进行服务注册和在client端进行服务注册的示例
* [kube](https://github.com/go-kratos/kratos/tree/main/examples/registry/nacos) 使用kube(kubernetes)插件，在server端进行服务注册和在client端进行服务注册的示例

### HTTP
* [gin](https://github.com/go-kratos/kratos/tree/main/examples/http/gin) 将gin作为router集成进Kratos项目的示例
* [handler](https://github.com/go-kratos/kratos/tree/main/examples/http/handler) 注册handler提供http接口的最小化应用示例
* [health](https://github.com/go-kratos/kratos/blob/main/examples/http/health/main.go) 添加健康检查接口的示例
* [mux](https://github.com/go-kratos/kratos/tree/main/examples/http/mux) 将mux作为router集成进Kratos项目的示例
* [static](https://github.com/go-kratos/kratos/tree/main/examples/http/static) 通过http提供静态文件服务的示例
* [upload](https://github.com/go-kratos/kratos/tree/main/examples/http/upload) 通过http上传文件的示例

### RPC
* [helloworld](https://github.com/go-kratos/kratos/tree/main/examples/helloworld) 分别使用http和gRPC进行远程调用的样例

### Trace
* [traces](https://github.com/go-kratos/kratos/tree/main/examples/traces) 使用jaeger对两个服务进行分布式追踪的样例

### WebSocket
* [ws](https://github.com/go-kratos/kratos/tree/main/examples/ws) 提供WebSocket接口的样例

## 综合项目
* [blog](https://github.com/go-kratos/kratos/tree/main/examples/blog) 简单的CRUD工程，包含MySQL和Redis的使用，展示使用kratos-layout创建的项目的完整结构

* [beer-shop](https://github.com/go-kratos/beer-shop) 一个模拟电商的完整微服务应用，展示如何使用kratos构建大型微服务项目
