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

Kratos 提供了丰富的示例代码/项目供参考

## 组件使用

[全部示例](https://github.com/go-kratos/examples)

### 配置

- [config](https://github.com/go-kratos/examples/tree/main/config) 使用 config 组件解析配置文件的示例
- [apollo](https://github.com/go-kratos/examples/tree/main/config/apollo) 从 apollo 中获取配置的示例

### 服务发现&服务注册

- [etcd](https://github.com/go-kratos/examples/tree/main/registry/etcd) 使用 etcd 插件，在 server 端进行服务注册和在 client 端进行服务注册的示例
- [nacos](https://github.com/go-kratos/examples/tree/main/registry/nacos) 使用 nacos 插件，在 server 端进行服务注册和在 client 端进行服务注册的示例
- [consul](https://github.com/go-kratos/examples/tree/main/registry/consul) 使用 consul 插件，在 server 端进行服务注册和在 client 端进行服务注册的示例
- [zookeeper](https://github.com/go-kratos/examples/tree/main/registry/zookeeper) 使用 zookeeper 插件，在 server 端进行服务注册和在 client 端进行服务注册的示例

### HTTP

- [cors](https://github.com/go-kratos/examples/tree/main/http/cors) 跨域设置示例
- [gin](https://github.com/go-kratos/examples/tree/main/http/gin) 将 gin 作为 router 集成进 Kratos 项目的示例
- [mux](https://github.com/go-kratos/examples/tree/main/http/mux) 将 mux 作为 router 集成进 Kratos 项目的示例
- [echo](https://github.com/go-kratos/examples/tree/main/http/echo) 将 echo 作为 router 集成进 Kratos 项目的示例
- [static](https://github.com/go-kratos/examples/tree/main/http/static) 通过 HTTP 提供静态文件服务的示例
- [upload](https://github.com/go-kratos/examples/tree/main/http/upload) 通过 HTTP 上传文件的示例
- [redirect](https://github.com/go-kratos/examples/blob/main/http/redirect) 重定向的示例
- [middleware](https://github.com/go-kratos/examples/tree/main/http/middlewares) 在路由中使用中间件的示例
- [errors](https://github.com/go-kratos/examples/tree/main/http/errors) 使用统一的错误处理进行错误响应的示例

### RPC

- [helloworld](https://github.com/go-kratos/examples/tree/main/helloworld) 分别使用 HTTP 和 gRPC 进行远程调用的样例

### Trace

- [traces](https://github.com/go-kratos/examples/tree/main/traces) 使用 Jaeger 对两个服务进行分布式追踪的样例

### WebSocket

- [ws](https://github.com/go-kratos/examples/tree/main/ws) 提供 WebSocket 接口的样例

### 鉴权

- [jwt](https://github.com/go-kratos/examples/tree/main/auth/jwt) 在 HTTP、gRPC 中使用 JWT 进行鉴权的示例

### 日志

- [zap](https://github.com/go-kratos/examples/tree/main/log) 使用 zap 日志库的示例
- [logrus](https://github.com/go-kratos/examples/tree/main/log) 使用 logrus 日志库的示例

### 其他

- [i18n](https://github.com/go-kratos/examples/tree/main/i18n) 国际化支持的示例
- [header](https://github.com/go-kratos/examples/tree/main/header) 请求头处理示例
- [selector](https://github.com/go-kratos/examples/tree/main/selector) 选择器示例，可通过负载均衡和 Filter 进行选择
- [swagger](https://github.com/go-kratos/examples/tree/main/swagger) 使用 Swagger 插件自动生成接口文档并提供在线服务的示例

## 综合项目

- [blog](https://github.com/go-kratos/examples/tree/main/blog) 简单的 CRUD 工程，包含 MySQL 和 Redis 的使用，展示使用 kratos-layout 创建的项目的完整结构

- [beer-shop](https://github.com/go-kratos/beer-shop) 一个模拟电商的完整微服务应用，展示如何使用 kratos 构建大型微服务项目
