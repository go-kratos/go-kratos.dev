---
id: design
title: 设计理念
description: Kratos v3 的设计原则、项目结构与组件边界。
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

Kratos 是用于构建服务的 Go 框架。更准确地说，它是一套工具箱：应用按需选择
组件，并继续掌握自身架构和基础设施。Kratos 不要求特定数据库、ORM、缓存、消息
队列、注册中心、配置中心或部署平台。

这一设计始于 v2 的重构，并继续作为 v3 的基础。v3 更新了公开 API 和工具链，
但仍然坚持小型接口、显式组装、生成 transport adapter 和可替换基础设施。

## 设计原则

Kratos 最初确立的下列目标至今仍在指导项目：

- **简单：** 使用普通 Go，避免不必要的框架机制。
- **通用：** 提供可复用的服务能力，不把某一家公司的业务约定编码进框架。
- **高效：** 减少重复的集成和代码生成工作，让团队专注于服务行为。
- **稳定和健壮：** 保持 core contract 可测试，并显式处理常见失败。
- **关注性能：** 提供合适的性能，不要求应用使用不透明或 unsafe 的方式。
- **可扩展：** 定义职责集中的 interface，供应用与 contrib module 实现。
- **面向故障：** 把 timeout、优雅停机、限流、熔断、恢复和可观测错误视为服务的
  正常组成部分。
- **工具支持：** 通过项目自行维护的命令，使 API、配置和依赖组装生成可重复。

这些原则解释了为什么 Kratos 把业务架构和 provider 选择留给应用。框架默认值应
便于使用，但不应让某种数据库或厂商 SDK 进入业务模型。

## 项目生态

主要项目承担不同职责：

- [`go-kratos/kratos`](https://github.com/go-kratos/kratos) 包含 core runtime、CLI
  与 protobuf generator、transport、middleware、配置、错误、日志、注册接口和
  selector 实现。
- [`go-kratos/kratos-layout`](https://github.com/go-kratos/kratos-layout) 是参考服务
  模板，演示依赖方向、Buf/Wire 生成、HTTP/gRPC server、配置和 data layer。
- [`contrib`](https://github.com/go-kratos/kratos/tree/main/contrib) 包含可选集成。
  在 v3 中，OpenTelemetry 等集成是独立版本化的 module，应用必须显式添加。
- [`go-kratos/gateway`](https://github.com/go-kratos/gateway) 是独立的 API gateway
  项目，Kratos 服务不依赖它。

layout 是示例，不是使用框架的前提。团队可以修改目录、采用其他依赖注入方式，
或者沿用已有项目结构，同时继续使用 Kratos transport 和组件。

## 为什么 v2 要重新设计

Kratos v1 已经提供了较完整的微服务基础库。然而，随着服务和团队扩大，紧密耦合
的框架与项目结构让修改成本逐步上升，模块难以隔离测试，替换第三方基础设施时也
需要修改业务代码。

v2 参考领域驱动设计和 Clean Architecture，重新设计框架与 `kratos-layout`。关键
结果是依赖方向：业务规则定义自己需要的 interface，transport 和基础设施代码在
边缘实现 adapter。随着服务演进，这种结构能提高可读性、可测试性以及替换外部
系统的能力。

框架被有意设计成一个“插座”。Core package 提供标准连接点，应用插入符合自身
生产环境的实现。社区也能在不为每个 provider 扩大 core runtime 的前提下增加
集成。

## v3 如何扩展这一设计

v3 保留 v2 的架构，同时进一步明确边界：

- Core import 使用 `/v3` module path，并要求 v3 对应的 Go 工具链。
- 日志使用标准 `log/slog` API，取代 Kratos 特有的 `Logger`/`Helper` 抽象。
- OpenTelemetry tracing/metrics 和 JWT middleware 成为独立 contrib module，应用
  自行管理配置与关闭。
- Go JSON 与 protobuf JSON 成为 wire 行为明确的独立 codec。
- HTTP 代码生成支持以 SSE 承载服务端流，以 WebSocket 承载客户端流和双向流。
- 配置增加类型安全的 `config.Get[T]`，校验支持自定义 validator function，错误
  增加 `Join`、`TooManyRequests` 等 helper。
- 限流与熔断在 core 中拥有不依赖 Aegis 的默认实现，同时仍可通过公开 interface
  替换。

这些变化更新了组件的集成方式，并不要求重新设计业务层。功能和迁移细节分别见
[Kratos v3 新功能](/zh-cn/docs/migration/v3-new-features/)与
[从 v2 迁移到 v3](/zh-cn/docs/migration/v2-to-v3/)。

## 应用生命周期

`kratos.App` 是生命周期协调器。它接收服务身份、一个或多个 `transport.Server`、
可选 registrar、hook、logger 和停机 timeout，不会隐式构造数据库或 provider。

```go
app := kratos.New(
	kratos.ID(instanceID),
	kratos.Name("todo"),
	kratos.Version(version),
	kratos.Metadata(map[string]string{"region": region}),
	kratos.Logger(logger),
	kratos.Server(httpServer, grpcServer),
	kratos.Registrar(registrar),
	kratos.StopTimeout(10*time.Second),
)

if err := app.Run(); err != nil {
	return err
}
```

`Run` 依次执行 `BeforeStart` hook、启动 server、注册生成的 service instance，再执行
`AfterStart`。配置的信号、显式 `Stop` 或 server 失败都会开始停机。`Stop` 执行
`BeforeStop`、注销实例、取消应用 context，并让每个 server 在配置的预算内停止；
所有 server 退出后执行 `AfterStop`。

未显式提供 endpoint 时，应用通过 `transport.Endpointer` 收集 server endpoint。
生命周期 hook 收到的 context 包含 `AppInfo`，可读取当前 ID、名称、版本、metadata
与 endpoint。顺序和失败行为见[应用与生命周期](/zh-cn/docs/component/application/)。

## 参考项目结构

当前 layout 保留 v2 的依赖边界设计，并用完整 Todo 服务展示它：

```text
api/                    Protobuf contracts and generated clients/servers
cmd/server/             Process entry point and Wire provider assembly
configs/                Runtime configuration files
internal/biz/           Entities, use cases, and repository interfaces
internal/data/          Repository implementations and external clients
internal/service/       Transport-facing service implementation
internal/server/        HTTP and gRPC server construction
```

依赖指向 `internal/biz`。Use case 可以依赖 repository interface，具体 Ent repository
留在 `internal/data`。`internal/service` 将生成的 API message 转换为 use-case 调用，
`internal/server` 把 service 注册到 HTTP 和 gRPC。Wire 在 `cmd/server` 中组装
provider，不充当运行时 service locator。

Kratos 不强制这些目录。其目的是避免 transport、持久化和厂商 SDK type 扩散进
业务逻辑。每层职责见[项目结构](/zh-cn/docs/intro/layout/)和
[基于 Layout 开发服务](/zh-cn/docs/guide/service-development/)。

## 基础设施由应用选择

数据库、缓存和消息队列库不属于 core framework。应根据服务的数据模型与运维
要求选择它们；需要替换能力和聚焦测试时，把 provider-specific type 隔离在
repository 或 client interface 之后。

参考 layout 当前演示 Ent 与 MySQL driver。这是模板选择，不是 Kratos 要求。
应用可以使用 `database/sql`、其他 ORM、文档数据库、内存实现，或者完全不使用
数据库。Redis client、Kafka client 和其他基础设施同理：显式构造，注入 data
layer，并通过应用的依赖生命周期关闭。

## CLI 与代码生成

`kratos` CLI 用于创建项目、生成 API/service 脚手架，也能在开发期运行服务。
layout 自行维护可重复的生成命令：

```bash
make api       # generate API protobuf, gRPC, HTTP, and OpenAPI output
make config    # generate configuration protobuf output
make generate  # run go generate and go mod tidy
make all       # run API, configuration, and Go generation
```

实际输出由项目的 Buf template 和 Go tool command 决定。生成的 `*.pb.go`、
HTTP/gRPC binding、OpenAPI document 和 `wire_gen.go` 都是输出：修改其源定义，
重新生成并审查 diff，不要手工编辑。详见 [CLI](/zh-cn/docs/getting-started/usage/)
和 [API 生成](/zh-cn/docs/component/api/)。

## Protobuf 优先的 API

Kratos 使用 Protobuf 作为服务 contract。一条 RPC 定义可以生成 gRPC binding；
添加 `google.api.http` 注解后，还可生成 HTTP binding，从而让 request type、field
number、service method 和生成的 client interface 在两种 transport 之间保持一致。

```proto
syntax = "proto3";

package todo.v1;

import "google/api/annotations.proto";

option go_package = "example/api/todo/v1;v1";

service TodoService {
  rpc GetTodo (GetTodoRequest) returns (Todo) {
    option (google.api.http) = { get: "/v1/todos/{id}" };
  }

  rpc WatchTodos (WatchTodosRequest) returns (stream TodoEvent) {
    option (google.api.http) = { get: "/v1/todos/watch" };
  }
}
```

v3 将 HTTP 服务端流映射为 SSE，客户端流与双向流映射为 WebSocket；gRPC 仍使用
原生 stream。详见[使用 SSE 与 WebSocket 实现 HTTP 流式调用](/zh-cn/docs/component/transport/http-streaming/)。

并非所有 endpoint 都必须由 Protobuf 描述。文件上传、provider callback 或无法
映射到 protobuf contract 的格式，可以在 HTTP router 上使用原生
`net/http.Handler`、Kratos `http.HandlerFunc` 或手写 struct。这个“逃生门”是
transport 设计的一部分。

## 错误 contract

Kratos error 的四个公开字段各有用途：

1. `code` 是错误大类，使用 HTTP status 语义，并在 gRPC transport 中映射为 gRPC
   status。
2. `reason` 是稳定、可读的服务错误标识，例如 `USER_NOT_FOUND`。调用方应按它
   分支，不要判断 message。
3. `message` 是面向 client 的解释，必须可安全公开。
4. `metadata` 保存可选结构化细节，不得包含 secret。

```json
{
  "code": 404,
  "reason": "USER_NOT_FOUND",
  "message": "user does not exist",
  "metadata": {
    "resource": "users/42"
  }
}
```

`WithCause` 保留内部 Go cause，但不改变公开 response。`errors.Is`、`Code`、
`Reason` 和 `FromError` 可检查被包装的错误，v3 的 `errors.Join` 能保留多个失败。
应在 biz 或 service 边界构造稳定的公开错误，把 driver 与 SDK error 留在 data
layer。详见[错误处理](/zh-cn/docs/component/errors/)。

## 配置与动态状态

配置抽象由 `Source`、`Watcher`、`Config` 与 `Value` 组成。Source 加载 key-value
数据，并可监听更新；`Config` 负责解码、合并、解析 placeholder、缓存观察值并
通知指定 key 的 observer。

Core 提供 file 和 environment source。远程系统通过实现相同 contract 的 contrib
module 接入。后面的 source 覆盖前面的值，因此服务可以先加载版本化默认配置，再
加载部署环境覆盖。完整配置树使用 `Scan`，单个 key 可使用 v3 的
`config.Get[T]`。

动态更新有意保持为低层能力：observer 必须校验新值，并安全替换应用状态。
Listener address、driver 和其他只在启动期使用的依赖通常需要受控重启。详见
[配置](/zh-cn/docs/component/config/)。

## 注册、发现与负载均衡

`registry.Registrar` 发布 `ServiceInstance`，`registry.Discovery` 监听指定服务名
的实例。`App` 在 server 开始启动后注册，并在取消 server context 前注销。HTTP
和 gRPC client 可把 discovery 实现与 `discovery:///service-name` endpoint 组合。

Discovery 回答有哪些实例，`selector.Selector` 决定调用哪个符合条件的 node。
Kratos 提供 weighted round-robin、P2C、random 等 selector；HTTP 和 gRPC client
将 weighted round-robin 初始化为全局默认值。Node filter 与 subset 可在选择前
缩小候选集，返回的 `DoneFunc` 为自适应 selector 记录调用结果。详见
[服务注册与发现](/zh-cn/docs/component/registry/)和
[Selector](/zh-cn/docs/component/selector/)。

## Metadata

Metadata 用于在 protobuf payload 外携带 request-scoped value。Transport
middleware 将选中的 HTTP header 或 gRPC metadata 转入 Kratos metadata context，
并可把选中的值传给下游调用。

传播范围属于协议设计。Kratos 默认不会转发所有 header：local metadata 留在当前
服务，global metadata 可以跨服务边界。应为 request ID、locale、tenant context
等批准字段定义精简 allowlist，并让 credential 遵循 auth middleware 的策略。
详见[元数据](/zh-cn/docs/component/metadata/)。

## 日志与可观测性

v3 在应用与 middleware API 中统一使用 `*slog.Logger`。Core log package 可以构造
text/JSON handler、过滤 record 或 attribute，并通过 context 携带 `slog.Attr`。
其他库提供的标准 slog handler 可以直接传入，也可由 `log.NewLogger` 包装。

Tracing 与 metrics 由独立的 `github.com/go-kratos/kratos/contrib/otel/v3` module
提供。应用构造 OpenTelemetry provider 和 exporter，安装 server/client
middleware，并在 transport 停止后关闭 provider。这让 credential、resource、
sampling、export policy 与 flush error 都由应用显式管理。详见
[日志](/zh-cn/docs/component/log/)、
[链路追踪](/zh-cn/docs/component/middleware/tracing/)和
[监控指标](/zh-cn/docs/component/metrics/)。

## Middleware 与容错

HTTP 与 gRPC unary 调用使用相同的 `middleware.Middleware` 形态。Middleware 包装
生成的 handler，是 recovery、logging、validation、authentication、metadata、
rate limiting、circuit breaking 和 telemetry 的扩展点。顺序会影响行为：在
`middleware.Chain(a, b)` 中，`a` 位于外层，会在 `b` 前后观察调用。

未传入 `WithLimiter` 时，core ratelimit middleware 使用内置 limiter。Client
circuit breaker 为每个 operation 保存独立 breaker，并可用
`WithBreakerFactory` 替换其 factory。这些机制负责拒绝或限制工作，不会替应用
决定 retry safety、timeout 和 idempotency。Stream RPC 还需要对应 transport 的
middleware 与生命周期处理。详见[middleware 概览](/zh-cn/docs/component/middleware/overview/)。

## 编码

HTTP codec 按 subtype 注册，并根据 `Content-Type` 与 `Accept` 选择。v3 将 subtype
为 `json` 的标准 Go `encoding/json` 与 subtype 为 `protojson` 的 protobuf JSON
分离，明确 field name、enum、well-known type 和默认值等 wire 行为。

Codec registration 是全局的，同名 codec 会替换之前的值。只引入服务确实需要的
格式；修改已有 API 前，应测试公开 response byte。详见
[编码与序列化](/zh-cn/docs/component/encoding/)。

## 扩展与演进

在边界上优先使用 core interface，并由应用管理 provider 生命周期。Contrib module
可以提供 registry、configuration source、middleware、logger handler 或其他集成，
但其 SDK type 应保留在这些 interface 之后或 data layer 内部。Contrib module 独立
版本化，因此要显式声明和升级每一个依赖。

项目示例也遵循同样规则：复制代码前检查其 module path 与生成工具配置。从
[当前 layout](/zh-cn/docs/intro/layout/)开始，通过[示例索引](/zh-cn/docs/getting-started/examples/)
查找特定集成，并在[插件](/zh-cn/docs/getting-started/plugin/)了解更多生态组件。

Kratos 通过公开 contract 和社区持续演进。当不同版本的服务并存时，应保持
protobuf field number、HTTP path、error reason 与序列化行为。影响调用方的修改
需要在 transport 边界测试，并作为服务 API 的一部分记录。
