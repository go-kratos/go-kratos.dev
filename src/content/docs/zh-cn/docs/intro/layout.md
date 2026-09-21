---
id: layout
title: 项目结构
description: Kratos v3 项目模板的目录、分层边界、生成和测试流程
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
[Kratos 项目模板](https://github.com/go-kratos/kratos-layout)提供了一个 v3 服务的
参考工程结构：protobuf-first API、HTTP/gRPC 服务端和生成式依赖注入。该结构是模板
约定，并非 Kratos runtime 强制要求的 API。

## 目录

```text
api/<domain>/<version>/  Protobuf sources and generated stubs; public contract
cmd/<app>/               Entrypoint, `main.go`, and Wire injector
configs/                 Runtime configuration; do not commit secrets
internal/conf/           Configuration proto and generated Go bindings
internal/server/         HTTP and gRPC server construction and registration
internal/service/        Transport adapters, normally one file per resource
internal/biz/            Domain objects, usecases, repository interfaces, errors
internal/data/           Repository implementations and storage clients
buf.yaml                 Buf modules and remote protobuf dependencies
```

`*.pb.go`、`*_grpc.pb.go`、`*_http.pb.go` 和 `wire_gen.go` 均为生成产物。应修改
对应 proto 或 injector 输入后重新生成，而不是手动编辑生成文件。

## 分层边界

模板明确区分三种模型：

```text
client -> DTO -> service -> DO -> biz -> DO -> data -> PO -> storage
```

- `service` 在 transport 边界转换 DTO 并调用 usecase；可 import `api/...` 和
  `biz`，不能 import `data` 或存储客户端。
- `biz` 持有领域对象、usecase、业务错误和仓储接口；不依赖 `service` 或 `data`。
- `data` 实现仓储接口，持有持久化对象和存储客户端细节，并负责 DO/PO 转换；不能
  import API DTO 或 `service`。
- `cmd` 通过 Wire 组合各层。`server` 构造 transport 并注册服务，不处理 transport
  转换或业务规则。

这些模板约定让存储与 transport 的变化可以在局部测试，而不会将依赖扩散到应用各层。

## 生成和测试

模板提供以下工作流：

```bash
make init    # install Buf and Wire
make api     # generate API bindings and OpenAPI output
make config  # generate configuration bindings
make all     # run all generation, Wire, and go mod tidy
go test ./...
```

测试与被测包放在一起。模板建议在 `service` 和 `biz` 测试中使用假的 usecase 或
仓储实现，而在 `data` 中测试真实的存储边界实现。
