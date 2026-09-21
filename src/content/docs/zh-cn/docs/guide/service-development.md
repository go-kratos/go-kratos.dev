---
id: service-development
title: 基于 Layout 开发服务
description: 沿当前 kratos-layout Todo 示例，从 protobuf API 实现到经过测试的 Ent repository。
---

当前 [kratos-layout](https://github.com/go-kratos/kratos-layout) 是一个可运行的 Kratos v3 分层服务参考。Todo 示例使用生成的 HTTP 和 gRPC binding、AIP list helper、Wire、Ent；默认运行配置使用 MySQL，repository 测试使用 SQLite。

本文解释已提交代码的实际行为。Todo resource 是教学示例，并非框架要求。

## 准备项目

当前 layout 声明 Go 1.25.7，因此应使用该版本或兼容且受支持的新版本。复制模板、修改 module path，再更新仍引用 `github.com/go-kratos/kratos-layout` 的 import。

```bash
git clone https://github.com/go-kratos/kratos-layout.git todo-service
cd todo-service
go mod edit -module github.com/your-org/todo-service
make init
make all
go test ./...
```

`make init` 安装最新版 Buf 和 Wire。`buf generate` 使用的 generator 版本固定在 `buf.gen.yaml`；修改版本前应审查工具变化。`make all` 依次执行 API 生成、配置生成、`go generate ./...` 和 `go mod tidy`。

默认运行配置选择 MySQL driver，并为开发启用 debug 输出和自动建表。请先启动对应数据库，或把 `configs/config.yaml` 改为二进制实际导入的 driver。仅在 `go.mod` 中存在依赖还不够：`database/sql` driver 通过运行时 blank import 注册。

## 理解数据流

```text
client -> generated HTTP/gRPC binding -> service DTO conversion
       -> biz usecase and domain object -> biz repository interface
       -> data repository -> Ent persistent object -> database
```

依赖指向内层：`service` 导入 `biz`；`data` 实现 `biz` 拥有的接口；`biz` 不导入 `data`。`cmd/server` 是 Wire 连接全部分层的 composition root。

| 分层 | 拥有 | 职责 |
| --- | --- | --- |
| `api/todo/v1` | DTO 与公开 contract | RPC、HTTP path、message、error reason |
| `internal/service` | Transport adapter | 校验请求形状并转换 DTO ↔ DO |
| `internal/biz` | DO、usecase、repo 接口 | 业务校验与编排 |
| `internal/data` | Repository 实现 | 转换 DO ↔ Ent model，并映射存储错误 |
| `internal/server` | Transport 构造 | Middleware 与生成的服务注册 |
| `cmd/server` | 进程启动 | Config、logger、Wire、应用生命周期 |

## 定义公开 API

Todo protobuf 定义 unary CRUD、server streaming 和 bidirectional streaming 方法。HTTP annotation 是 `protoc-gen-go-http` 的输入，本身不会实现 handler。

```proto
rpc GetTodo (GetTodoRequest) returns (Todo) {
  option (google.api.http) = {
    get: "/v1/todos/{id}"
  };
}

rpc UpdateTodo (UpdateTodoRequest) returns (Todo) {
  option (google.api.http) = {
    put: "/v1/todos/update"
    body: "todo"
  };
}
```

`CreateTodoRequest.todo`、ID 和 `update_mask` 带有 `google.api.field_behavior = REQUIRED`。HTTP server 加入了 v3 自定义 validator，对 protobuf message 调用 `fieldbehavior.ValidateRequiredFields`。core validator 只会调用 message 的 `Validate` 方法；要执行 field behavior annotation，必须像 layout 一样传入自定义函数。

`make api` 会生成 Go message、gRPC binding、HTTP binding、error reason helper 和 `openapi.yaml`。不要编辑生成的 `.pb.go`、`_grpc.pb.go` 或 `_http.pb.go`。

## 实现业务边界

业务包拥有与存储无关的 `Todo`、`TodoUsecase` 和 `TodoRepo`。它校验 UUID 和 title，并通过 list option 隐藏 Ent builder。

```go
type TodoRepo interface {
	FindByID(context.Context, uuid.UUID) (*Todo, error)
	ListTodos(context.Context, ...ListOption) ([]*Todo, error)
	CreateTodo(context.Context, *Todo) (*Todo, error)
	UpdateTodo(context.Context, *Todo) (*Todo, error)
	DeleteTodo(context.Context, uuid.UUID) error
}

type TodoUsecase struct {
	repo TodoRepo
}
```

包级 Kratos error 使用生成的 reason enum。存储实现把 `ent.IsNotFound` 转换成 `biz.ErrTodoNotFound`，上层因此不依赖 Ent error type。

## 在 service 层转换请求

Service 嵌入 `UnimplementedTodoServiceServer`，把 string ID 解析成 UUID，将 protobuf DTO 转为 domain object，并把结果转换回 DTO。部分更新会先加载当前 resource，再应用请求中的 field mask，然后调用 usecase。

```go
func (s *TodoService) UpdateTodo(ctx context.Context, req *v1.UpdateTodoRequest) (*v1.Todo, error) {
	if req.GetTodo().GetId() == "" || req.GetUpdateMask() == nil || len(req.GetUpdateMask().GetPaths()) == 0 {
		return nil, biz.ErrTodoInvalidArgument
	}
	current, err := s.GetTodo(ctx, &v1.GetTodoRequest{Id: req.GetTodo().GetId()})
	if err != nil {
		return nil, err
	}
	fieldmask.Update(req.GetUpdateMask(), current, req.GetTodo())
	todo, err := s.uc.UpdateTodo(ctx, convertTodo(current))
	if err != nil {
		return nil, err
	}
	return convertTodoReply(todo), nil
}
```

Field mask 决定请求值中哪些字段覆盖当前 DTO，usecase 仍会执行 domain rule。

List 请求通过 `filtering.ParseFilter`、`ordering.ParseOrderBy` 和 `pagination.ParsePageToken` 解析。Service 声明允许过滤的字段并校验排序 path，再把 typed option 传给 usecase。Data repository 将其转换成 Ent predicate 和 order expression。

## 使用 Ent 持久化

`NewData` 打开一个长期使用的 Ent client。它返回给 Wire 的 cleanup 会在应用停止后关闭 client。`debug` 会打印生成的语句，`auto_migrate` 调用 `db.Schema.Create`；二者都只是开发便利，生产环境应关闭并使用经过审查的 migration。

Todo schema 使用 UUIDv7 ID、创建/更新时间 mixin、带索引的 status 和软删除。所有读取和更新都会过滤 active row。List query 最后追加 ID 排序，因此请求字段值相同时，offset pagination 仍有确定顺序。

通过已有 directive 生成 Ent 代码：

```bash
go generate ./internal/data/ent
```

修改 schema source 后不重新生成，会使编译的 repository 与 schema 不一致。生成文件应与 schema 修改一起提交。

## 组装进程

每个 package 导出 provider set。Injector 接收 server/data 配置和 `*slog.Logger`，将 server、data、biz、service provider 与应用构造函数组合起来。

```go
func wireApp(*conf.Server, *conf.Data, *slog.Logger) (*kratos.App, func(), error) {
	panic(wire.Build(server.ProviderSet, data.ProviderSet, biz.ProviderSet, service.ProviderSet, newApp))
}
```

修改构造函数或 provider set 后执行 `make all`。生成的 `wire_gen.go` 是普通编译期 Go 代码；运行时不需要 Wire。

## 运行并调用服务

确认 `KRATOS_DATABASE_SOURCE` 指向可访问的 MySQL 后启动应用：

```bash
export KRATOS_DATABASE_SOURCE='root:root@tcp(127.0.0.1:3306)/test?timeout=5s&parseTime=True&loc=Local&charset=utf8mb4'
go run ./cmd/server -conf ./configs
```

通过 HTTP 创建并读取 Todo：

```bash
curl -sS -X POST http://127.0.0.1:8000/v1/todos/create \
  -H 'Content-Type: application/json' \
  -d '{"title":"verify docs","content":"run the example"}'

curl -sS http://127.0.0.1:8000/v1/todos/REPLACE_WITH_ID
```

生成的 binding 决定 JSON 形状和 HTTP status 映射。不要预设示例 ID 或 response，应使用 create 返回的实际值。

## Streaming 的实际行为

Proto 暴露 `WatchTodos` 和 `SyncTodos`。当前实现中的 `WatchTodos` 发送选中的 snapshot 后就返回；虽然 proto 注释称 stream 会保持打开，但已提交 service 中并不存在事件订阅循环。`SyncTodos` 会读取 client message 直到 EOF，并为每个被接受的 action 发送 created、updated 或 deleted event。对外承诺实时通知前，应先按真实实现编写文档和测试。

## 在分层边界测试

- Service 测试使用实现 `biz.TodoRepo` 的内存 fake，验证 DTO 转换、field mask、pagination token、校验和 stream。
- Data 测试使用内存 SQLite 与真实 Ent client，验证 CRUD、过滤、排序、稳定分页和软删除。
- 加入自定义 codec、middleware 或 transport option 后，应增加小型 server wiring 集成测试。

每次修改后运行 `go test ./...`。参考仓库的测试属于示例 contract；应保持完整
package 可以构建，不能只检查脱离上下文的代码片段。
