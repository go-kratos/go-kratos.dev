---
id: faq
title: 常见问题
---

## protoc 找不到 protobuf 文件

通过 `make init` 安装工具，再使用项目的 Buf 配置执行生成。模板在 `buf.yaml` 中
声明 `api`、`internal` 两个模块和 `buf.build/googleapis/googleapis` 远程依赖；
更改远程依赖后运行 `buf dep update`。编辑器应使用同一 Buf workspace，不要另行
维护 include path。

## 找不到 `kratos` 命令

安装 v3 CLI，并将 Go 二进制目录加入 `PATH`：

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
go env GOBIN GOPATH
kratos --help
```

## 升级后生成的 binding 无法编译

更新 import、选择正确的 v3 JSON codec 后重新生成代码，不要直接修改生成文件：

```bash
make all
go test ./...
```

protobuf 和 Wire 文件均是输出。迁移顺序请参阅[从 v2 迁移到 v3](/zh-cn/docs/migration/v2-to-v3/)。

## 控制 protobuf JSON 输出

transport 需要 protobuf JSON 语义时使用 v3 protobuf JSON codec：

```go
import _ "github.com/go-kratos/kratos/v3/encoding/protojson"
```

在应用使用的 codec 或 response encoder 中配置 protobuf JSON 行为。不要依赖已移除的 v2 `encoding/json` protobuf 行为；参阅[序列化](/zh-cn/docs/component/encoding/)。

## Layout 无法连接数据库

当前模板运行时使用 MySQL。请先创建数据库，并把 `KRATOS_DATABASE_SOURCE` 设为进程能够
访问的 DSN。Ent 模型包含时间字段，因此应保留 `parseTime=True`。SQLite 只用于
仓储测试，不是默认运行时 driver。容器内应把 `127.0.0.1` 换成数据库 service
hostname。

## 环境变量没有覆盖嵌套配置

模板在 `configs/config.yaml` 中使用 `${DATABASE_SOURCE:default}` 这类占位符。
`env.NewSource("KRATOS")` 加载 `KRATOS_DATABASE_SOURCE`，去掉 `KRATOS_` 后创建
根 key `DATABASE_SOURCE`，resolver 再用这个已合并 key 展开占位符。Source 不会把
下划线转换成嵌套 key 路径。请遵循此前缀与占位符约定，或者在应用中明确设计 key
约定与 decoder。

## `kratos run` 没有重新生成或重启服务

v3 命令只会找到 `cmd` package 并执行 `go run`。它不是文件 watcher，也不会执行
Protobuf、Ent、配置或 Wire 生成。修改生成器输入后运行项目的 `make all`，源代码
变化后重新启动命令。

## HTTP 路由返回 404

确认 proto 包含预期的 `google.api.http` 注解，运行 `make api`，并在服务端注册
生成的 HTTP service。注册 gRPC service 不会注册 HTTP 路由。手写路由必须使用
传给 `kratos.App` 的同一个 `*http.Server`，并检查 router group 或 server path
prefix。

## 中间件没有作用于 gRPC stream

`grpc.Middleware` 和 `grpc.WithMiddleware` 用于一元调用。Stream 应在服务端使用
`grpc.StreamMiddleware`，在客户端使用 `grpc.WithStreamMiddleware`。HTTP 生成的
stream 仍会在 stream handler 外运行普通 HTTP middleware chain。
