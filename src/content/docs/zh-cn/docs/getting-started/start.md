---
id: start
title: 快速开始
description: 使用当前 Kratos v3 项目 layout 创建、生成、测试并运行服务。
---

维护中的项目模板是最完整的 v3 服务起点，其中包含 protobuf API、HTTP/gRPC server、Wire、Ent、测试和 OpenAPI 文档。以下命令和目录结构与[当前项目 layout](https://github.com/go-kratos/kratos-layout)一致。

## 前置条件

- Go 1.25.7 或兼容且受支持的版本。Core module 要求 Go 1.25；当前 layout 在 `go.mod` 中记录了 patch 版本。
- Git 和 Make。
- MySQL，用于模板的默认运行配置。
- Buf 和 Wire，用于重新生成；layout 通过 `make init` 安装它们。

克隆模板并安装开发命令：

```bash
git clone https://github.com/go-kratos/kratos-layout.git todo-service
cd todo-service
make init
```

`make init` 当前安装 `buf@latest` 和 `wire@latest`。Buf 实际调用的 protoc plugin 版本固定在 `buf.gen.yaml` 中。可重复的 CI 应固定命令版本，不能依赖持续变化的 `latest`。

## 重命名模板

编辑生成代码或应用代码前，先设置自己的 module path：

```bash
go mod edit -module github.com/your-org/todo-service
```

替换以 `github.com/go-kratos/kratos-layout` 开头的 import，再按需重命名 command、API package、应用名称和示例 resource。只修改 `go.mod` 会使旧 Go import 无法解析。Todo 代码是参考实现，不是框架内置类型。

## 生成并测试

```bash
make all
go test ./...
go vet ./...
```

`make all` 会执行 `make api`、`make config` 和 `make generate`。这些 target 根据已提交的项目文件生成 protobuf HTTP/gRPC/OpenAPI 文件、配置 binding、Ent 输出、Wire 输出和 module metadata。不要手工修改生成的 `.pb.go`、`_http.pb.go`、`_grpc.pb.go`、Ent 或 `wire_gen.go` 文件。

## 准备数据库

默认 `configs/config.yaml` 使用 `mysql` driver。它通过配置的 `KRATOS` 环境
source，从 `KRATOS_DATABASE_SOURCE` 解析 `DATABASE_SOURCE` 占位符，并启用 Ent
debug 日志和自动建表。启动 MySQL、创建所选数据库，然后设置适合当前环境的 DSN：

```bash
export KRATOS_DATABASE_SOURCE='root:root@tcp(127.0.0.1:3306)/test?timeout=5s&parseTime=True&loc=Local&charset=utf8mb4'
```

不要提交生产凭据。生产环境应关闭 `debug` 和 `auto_migrate`，单独执行经过审查的 migration。虽然 module 包含 SQLite，但运行二进制导入的是 MySQL；SQLite 用于 repository 测试。

## 运行服务

```bash
go run ./cmd/server -conf ./configs
```

默认监听 HTTP `0.0.0.0:8000` 和 gRPC `0.0.0.0:9000`。如果尚未执行查询，进程启动成功不能证明数据库可访问；应调用 endpoint 完成检查。

创建 Todo、复制返回的 ID，再读取它：

```bash
curl -sS -X POST http://127.0.0.1:8000/v1/todos/create \
  -H 'Content-Type: application/json' \
  -d '{"title":"learn Kratos","content":"run the v3 layout"}'

curl -sS http://127.0.0.1:8000/v1/todos/REPLACE_WITH_ID
```

Route 来自 API proto 中的 `google.api.http` annotation。替换示例 API 后，这些 Todo path 也会变化。

## 项目结构

```text
api/              Protobuf API definitions and generated bindings
cmd/              Application entrypoints and Wire injectors
configs/          Runtime configuration without secrets
internal/conf/    Configuration proto and generated bindings
internal/server/  HTTP and gRPC server construction
internal/service/ Transport-facing service methods and DTO conversion
internal/biz/     Usecases, domain objects, errors, repository interfaces
internal/data/    Ent repository implementations and storage clients
openapi.yaml      Generated OpenAPI document
```

继续阅读[基于 Layout 开发服务](/zh-cn/docs/guide/service-development/)了解请求流程和归属规则，并阅读[应用生命周期](/zh-cn/docs/component/application/)了解启动、注册和优雅停止。

## 安装 CLI

项目可在不安装 CLI 的情况下直接使用。需要模板、proto scaffold、run、upgrade 或 changelog 命令时再安装：

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
kratos --help
```

CLI 和 layout 是独立 module。应始终检查命令帮助和生成项目的 `go.mod`，不要假设每个 CLI 版本都会生成相同模板。
