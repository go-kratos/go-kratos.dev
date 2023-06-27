---
id: overview
title: 简介
description: Kratos 一套轻量级 Go 微服务框架，包含大量微服务相关框架及工具
keywords:
  - Go 
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
slug: /
---

Kratos 一套轻量级 Go 微服务框架，包含大量微服务相关框架及工具。  

> 名字来源于:《战神》游戏以希腊神话为背景，讲述奎托斯（Kratos）由凡人成为战神并展开弑神屠杀的冒险经历。

### 目标

我们致力于提供完整的微服务研发体验，整合相关框架及工具后，微服务治理相关部分可对整体业务开发周期无感，从而更加聚焦于业务交付。对每位开发者而言，整套 Kratos 框架也是不错的学习仓库，可以了解和参考到微服务方面的技术积累和经验。

#### 原则

* **简单**：不过度设计，代码平实简单；
* **通用**：通用业务开发所需要的基础库的功能；
* **高效**：提高业务迭代的效率；
* **稳定**：基础库可测试性高，覆盖率高，有线上实践安全可靠；
* **健壮**：通过良好的基础库设计，减少错用；
* **高性能**：性能高，但不特定为了性能做 hack 优化，引入 unsafe ；
* **扩展性**：良好的接口设计，来扩展实现，或者通过新增基础库目录来扩展功能；
* **容错性**：为失败设计，大量引入对 SRE 的理解，鲁棒性高；
* **工具链**：包含大量工具链，比如 cache 代码生成，lint 工具等等；

### 特性

* **APIs**：协议通信以 HTTP/gRPC 为基础，通过 Protobuf 进行定义；
* **Errors**：通过 Protobuf 的 Enum 作为错误码定义，以及工具生成判定接口；
* **Metadata**：在协议通信 HTTP/gRPC 中，通过 Middleware 规范化服务元信息传递；
* **Config**：支持多数据源方式，进行配置合并铺平，通过 Atomic 方式支持动态配置；
* **Logger**：标准日志接口，可方便集成三方 log 库，并可通过 fluentd 收集日志；
* **Metrics**：统一指标接口，可以实现各种指标系统，默认集成 Prometheus；
* **Tracing**：遵循 OpenTelemetry 规范定义，以实现微服务链路追踪；
* **Encoding**：支持 Accept 和 Content-Type 进行自动选择内容编码；
* **Transport**：通用的 HTTP/gRPC 传输层，实现统一的 Middleware 插件支持；
* **Registry**：实现统一注册中心接口，可插件化对接各种注册中心；

### 架构

<img src="/images/arch.png" alt="kratos architecture" width="650px" />

### 相关资料

* [Docs](https://go-kratos.dev/)
* [Examples](https://github.com/go-kratos/examples)
* [Service Layout](https://github.com/go-kratos/kratos-layout)

### 社区

* [Wechat Group](https://github.com/go-kratos/kratos/issues/682)
* [Discord Group](https://discord.gg/BWzJsUJ)
* QQ Group: 716486124

### 公众号

<img src="/images/wechat.png" alt="kratos architecture" width="650px" />

### 开源证书

Kratos is MIT licensed. See the [LICENSE](https://github.com/go-kratos/kratos/blob/main/LICENSE) file for details.

### 贡献者列表

感谢开发者们对本项目的贡献。
<a href="https://github.com/go-kratos/kratos/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=go-kratos/kratos" />
</a>
