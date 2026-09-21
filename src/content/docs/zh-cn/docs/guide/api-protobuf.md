---
id: api-protobuf
title: Protobuf 规范
---

在版本化 protobuf package 中定义公开 API，例如 `api/todo/v1/todo.proto`。保持 protobuf `package` 与 Go `go_package` 稳定；公开 API 不兼容时引入新版本。HTTP 转码是可选能力，使用 `google/api/annotations.proto`。

模板在 `buf.yaml` 中声明 `api`、`internal` 两个 Buf 模块和 Google APIs 依赖，
生成设置位于 `buf.gen.yaml`、`buf.gen.config.yaml` 和 Makefile。修改 API 后运行
`make api`，提交生成 binding，不要编辑 `*.pb.go`、`*_grpc.pb.go` 或
`*_http.pb.go`。

## Package 与目录

将一个 API 版本放在稳定目录和 package 下。Go package 应指向生成的 API 包，而不是内部 server 实现。

```protobuf
syntax = "proto3";

package todo.v1;

import "google/api/annotations.proto";

option go_package = "example.com/todo/api/todo/v1;v1";

service TodoService {
	rpc GetTodo(GetTodoRequest) returns (Todo) {
		option (google.api.http) = {get: "/v1/todos/{id}"};
	}
}

message GetTodoRequest { string id = 1; }
message Todo { string id = 1; string title = 2; }
```

生成的 gRPC operation 是 `/todo.v1.TodoService/GetTodo`。已有 client 依赖后，应保持 package、service、method、field number 和 field type 稳定。

## Import、命名与注释

通过 `buf.yaml` 中的模块和依赖解析 import；依赖变化时使用 `buf dep update` 更新
`buf.lock`。Message 使用清晰名词，RPC method 使用动词加名词，集合 field 使用
复数。为导出的 service、method、message 和 field 写注释，因为 generator 会将
Protobuf 注释用于生成文档。

## 演进 API

优先增加 optional field，不要修改 field type 或复用 field number。删除 field 时 reserve number 和 name。可能时兼容地增加 method；公开 contract 不兼容时新建 `v2` package。HTTP path 也是公开 API，应保留已有 path 并审慎增加 binding。

将 error reason 定义放在对外暴露它的 API 附近。用项目配置的工具生成 error helper，service 实现返回 Kratos `errors`，使 HTTP 和 gRPC client 获得相同 reason 与 metadata。

## 生成检查表

1. 修改 `.proto`，必要时同步修改 `buf.yaml` 中的依赖。
2. 运行 `make api`。
3. 在 `internal/service` 实现新生成的方法。
4. 在 `internal/server` 注册生成的 HTTP/gRPC service。
5. 运行 `go test ./...` 并审查生成 diff。

## 参考

- [Google API Improvement Proposals](https://google.aip.dev/)
- [Protocol Buffers 文档](https://protobuf.dev/)
- [API 定义](/zh-cn/docs/component/api/)
