---
id: overview
title: Kratos v3 文档
description: 使用 Kratos v3 的 HTTP/gRPC transport 与显式、可组合的基础设施构建 Go 微服务。
---

Kratos v3 是一个轻量级 Go 云原生服务框架，提供应用生命周期、生成的 HTTP/gRPC transport、middleware、配置、结构化错误、metadata、encoding、日志和服务发现接口。应用通过独立 module 选择持久化、注册中心、遥测和远程配置实现。

文档介绍 v3 API 和当前的 [Kratos 项目 layout](https://github.com/go-kratos/kratos-layout)。Core 与 contrib package 分开说明，方便判断应用需要显式添加哪些依赖。

## 从这里开始

1. 按[快速开始](/zh-cn/docs/getting-started/start/)准备工具、复制项目模板、生成代码、运行测试并启动服务。
2. 阅读[基于 Layout 开发服务](/zh-cn/docs/guide/service-development/)，理解 Todo 示例从 protobuf API 到 Ent repository 的完整流程。
3. 配置应用、transport、middleware、注册中心或 codec 时查阅[组件文档](/zh-cn/docs/component/application/)。
4. 已有 v2 服务应先阅读[从 v2 迁移到 v3](/zh-cn/docs/migration/v2-to-v3/)，再按需采用[Kratos v3 新功能](/zh-cn/docs/migration/v3-new-features/)。

## Core 模型

应用接收一个或多个 server，并负责其启动和停止生命周期。生成的 binding 把 protobuf 方法适配到 HTTP 和 gRPC。统一的 middleware 类型可以在两种 transport 上包装生成的 handler。配置源、注册中心、selector 和 codec 使用小型接口，不强制具体 provider。

Core module 是 `github.com/go-kratos/kratos/v3`。CLI 和每个 contrib 集成都有独立 Go module，也可能拥有不同版本。复制示例前应先检查 module path。

## v3 提供的能力

| 范围 | Core 行为 |
| --- | --- |
| 应用 | 并发 server 生命周期、hook、信号、注册、优雅停止 |
| API 工具 | Protobuf HTTP/error generator 与项目 CLI |
| Transport | HTTP/gRPC server 和 client、生成 binding、unary 与 streaming 支持 |
| Middleware | Recovery、logging、metadata、validation、限流、熔断、选择性执行 |
| 数据 contract | 结构化错误、transport metadata、codec registry、config value |
| 路由 | Registry 接口、服务发现集成、selector 与 node filter |
| 日志 | 标准库 `log/slog` handler、过滤和 context attribute |

JWT 与 OpenTelemetry tracing/metrics 在 v3 中属于 contrib module。数据库、队列、缓存、migration、遥测 exporter 和部署策略仍由应用选择，框架不会隐式配置这些系统。

## 参考 Layout

维护中的 layout 展示 protobuf-first API、生成的 HTTP/gRPC binding、Wire 依赖注入、`service`/`biz`/`data` 分层、Ent 存储、MySQL 运行配置、SQLite repository 测试、AIP list 过滤/排序/分页、部分更新和 streaming RPC。

可以把该结构作为经过测试的起点。Kratos 本身并不强制使用 Wire、Ent、MySQL 或完全相同的 package layout。

## 示例可信性

站点构建会编译并检查示例。中英文页面共享相同代码，发布前也会检查站内链接。

## 社区与许可证

- [Kratos 源码](https://github.com/go-kratos/kratos)
- [项目 Layout](https://github.com/go-kratos/kratos-layout)
- [示例](https://github.com/go-kratos/examples)
- [贡献指南](/zh-cn/docs/community/contribution/)

Kratos 使用 [MIT License](https://github.com/go-kratos/kratos/blob/main/LICENSE)。
