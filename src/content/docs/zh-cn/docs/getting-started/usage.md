---
id: usage
title: CLI 参考
description: 使用 Kratos v3 CLI，并以生成项目自身的构建流程为准。
---

v3 CLI 是独立 Go module。安装后应检查该版本实际提供的命令：

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
kratos --help
kratos --version
```

Root command 为 `new`、`proto`、`upgrade`、`changelog` 和 `run`。不存在 `kratos change` 或通用的运行时 plugin 命令。

## 创建项目

```bash
kratos new helloworld
kratos new --repo https://github.com/your-org/layout.git --branch main helloworld
```

`new` 会复制 Git repository 模板。相关 flag 为 `--repo`、`--branch`、`--timeout` 和 `--nomod`。默认 repository 与 CLI 独立维护，开始开发前应检查新项目的 `go.mod`、Makefile 和 generator 配置。

## 生成 protobuf scaffold

```bash
kratos proto add api/helloworld/v1/greeter.proto
kratos proto client api/helloworld/v1/greeter.proto
kratos proto server api/helloworld/v1/greeter.proto --target-dir internal/service
```

`proto add` 使用从 `go.mod` 读取的 module path 创建 proto 模板，传入 path 必须有目录层级。`proto client` 为文件调用配置的 protoc 流程；`proto server` 生成 service 实现 scaffold。这些命令不能替代 layout 的完整 `make api`/`make all` 流程，后者会生成全部已配置输出。

## 开发时运行

```bash
kratos run
kratos run --work ./cmd/server
```

`run` 查找 `cmd` 下的目录，然后对所选 command 执行 `go run`。它不会监听文件，也不会重新生成代码。`--work` 会改变子进程的工作目录。部署时应运行项目编译产物。

## 升级工具

```bash
kratos upgrade
```

`upgrade` 会安装最新版 CLI、Kratos HTTP/error generator、Go protobuf generator 和 OpenAPI generator。它并不是完整的应用主版本迁移。Module path、公开 API 变化、生成代码和应用测试仍要分别审查。已有 v2 服务请阅读[v2 到 v3 指南](/zh-cn/docs/migration/v2-to-v3/)。

## 生成 changelog

```bash
kratos changelog dev
kratos changelog v3.0.0
```

`changelog` 从 GitHub repository 读取 release 或 commit 信息。可通过 `--repo-url` 选择其它 repository。命令需要网络和 repository 历史；发布前应人工审查生成的文字。

## 以项目命令为准

模板创建后，其 Makefile 和生成配置就是构建 contract：

```bash
make init
make api
make config
make all
go test ./...
make build
```

公开 protobuf 变化后执行 `make api`，配置 proto 变化后执行 `make config`，构造函数、provider set 或 Ent schema 变化后执行 `make all`。生成输出应与 source 一起提交。

使用 `kratos <command> --help` 查看已安装版本的准确行为。
