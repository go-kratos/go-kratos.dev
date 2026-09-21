---
id: examples
title: 示例与源码
description: 查找完整 Kratos v3 服务和组件示例。
---

完整服务应参考 [kratos-layout](https://github.com/go-kratos/kratos-layout)，单个组件应参考 [Kratos 源码](https://github.com/go-kratos/kratos)中的 package 测试。Contrib 集成的示例和测试位于各自 module 中。

## 完整服务

Layout 包含：

- 带 unary 和 streaming RPC 的 Todo protobuf contract；
- 生成的 HTTP/gRPC binding 和 OpenAPI 输出；
- 通过编译期 Wire 连接的 `service`、`biz` 和 `data` 层；
- 运行时使用 MySQL 的 Ent 存储，以及 SQLite repository 测试；
- AIP filtering、ordering、pagination、field mask 和 required-field 检查；
- 使用 `slog`、配置、recovery、validation 和 OpenTelemetry trace attribute 提取的应用启动代码。

真实请求流程见[基于 Layout 开发服务](/zh-cn/docs/guide/service-development/)。应读取 repository 的 `go.mod` 和源码，不能依赖旧版 README 的描述。

## 组件示例

Core package 测试是 option 默认值和边界条件最接近可执行规格的参考。重点位置包括 `config/*_test.go`、`transport/http/*_test.go`、`transport/grpc/*_test.go`、`middleware/*/*_test.go` 和 `selector/*_test.go`。应同时阅读实现，区分公开保证与测试环境细节。

独立的 [go-kratos/examples](https://github.com/go-kratos/examples) repository 包含集成型项目。复制前应：

1. 检查 `go.mod` 是否使用 `/v3` core 和 contrib module path。
2. 检查版本与 generator 配置。
3. 只通过该项目已提交的命令执行生成。
4. 适配前运行 `go test ./...` 和 `go vet ./...`。
5. 每次只加入一个集成，使失败责任清晰。

## 把示例应用到自己的服务

示例可编译表示其 import 和 type 在所选版本下匹配，但不能确定 TLS trust、注册中心凭据、telemetry sampling、数据库 migration 或停机预算等生产策略。使用方仍要自行配置并测试这些选择。

不要把 v2 说明与 v3 import 混用，也不要混合无关的 contrib version。Core 和 contrib 即使位于同一 repository 源码中，也仍是独立 module。
