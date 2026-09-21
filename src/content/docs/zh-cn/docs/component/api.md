---
id: api
title: API 定义与生成
---

Kratos 服务通常使用 Protobuf 定义公开契约。一份契约可以生成 Protobuf 消息、
原生 gRPC 绑定、HTTP 转码绑定和 OpenAPI 文档。应用实现类型留在 `internal`，
客户端只导入版本化 API 包。

## 项目模板中的文件

Todo API 展示了生成产物：

```text
api/todo/v1/
├── todo.proto
├── todo.pb.go
├── todo_grpc.pb.go
├── todo_http.pb.go
├── error_reason.proto
└── error_reason.pb.go
```

`buf.yaml` 定义 `api`、`internal` 模块和远程依赖；`buf.gen.yaml` 配置 Go
Protobuf、gRPC、Kratos HTTP 和 OpenAPI 生成；配置消息使用独立的
`buf.gen.config.yaml` 模板。

## 定义服务

Protobuf package 和 `go_package` 应保持版本化与稳定。HTTP 注解是可选的；添加
后会为同一个服务方法生成适配器。

```protobuf
syntax = "proto3";

package todo.v1;

import "google/api/annotations.proto";
import "google/api/field_behavior.proto";

option go_package = "example.com/todo/api/todo/v1;v1";

service TodoService {
	rpc GetTodo(GetTodoRequest) returns (Todo) {
		option (google.api.http) = {get: "/v1/todos/{id}"};
	}
}

message GetTodoRequest {
	string id = 1 [(google.api.field_behavior) = REQUIRED];
}
```

注释属于契约，会出现在生成的 Go 和 OpenAPI 输出中。字段行为注解描述必填输入，
但只有服务安装 `validate.Validator()`，并且请求存在 `Validate()` 方法或中间件
收到自定义 validator 时，运行时才会执行校验。

## 生成产物

修改 API 文件后运行模板目标：

```bash
make api
go test ./...
```

`make api` 调用 `buf generate --template buf.gen.yaml`。该文件通过
`go run module@version` 声明生成器版本，使所有贡献者使用相同工具，不依赖
`PATH` 中的任意二进制。`make all` 还会重新生成配置和 Wire 输出，并执行
`go mod tidy`。

生成文件应与 proto 源文件一同提交。不要手工编辑，否则下次生成会覆盖修改。

## 实现并注册服务

Service 层实现生成的接口，并把同一个实现注册到两种传输：

```go
v1.RegisterTodoServiceServer(grpcServer, todoService)
v1.RegisterTodoServiceHTTPServer(httpServer, todoService)
```

gRPC 绑定暴露原生 Protobuf RPC；HTTP 绑定解码注解指定的路径、查询和请求体，运行
Kratos 中间件，再调用同一个方法。两者都以
`/todo.v1.TodoService/GetTodo` 作为规范操作名，因此日志、指标、追踪和 selector
能使用一致名称。

生成的客户端通过 `v1.NewTodoServiceClient(grpcConn)` 或
`v1.NewTodoServiceHTTPClient(httpClient)` 创建。传输构造、TLS、服务发现、中间件
和超时应放在生成包外。

## 错误原因与兼容性

稳定的错误原因应定义在公开 API 附近。模板使用 enum，并以其字符串值构造 Kratos
错误：

```go
var ErrTodoNotFound = errors.NotFound(
	v1.ErrorReason_TODO_NOT_FOUND.String(),
	"todo not found",
)
```

客户端开始使用 API 后，不要复用 Protobuf 字段编号或 enum 值。删除字段时保留
编号与名称，保持已发布 HTTP 路径；不兼容变更应创建新的 API package 版本。

完整流程见 [Protobuf API 设计](/zh-cn/docs/guide/api-protobuf/)、
[OpenAPI](/zh-cn/docs/guide/openapi/) 和
[完整服务开发](/zh-cn/docs/guide/service-development/)。
