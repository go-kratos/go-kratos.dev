---
id: openapi
title: OpenAPI
---

项目模板从带注解的同一批 Protobuf 文件生成 OpenAPI 文档，HTTP 和 gRPC 绑定也
来自这些文件。路径、请求消息和响应 schema 因此始终关联到 API 契约。

## 描述 HTTP 行为

导入 `google/api/annotations.proto`，并给 RPC 添加 `google.api.http`。路径变量
必须指向请求字段；`body` 选择从请求体读取的消息字段；不属于路径和请求体的字段
可表示为查询参数。

```protobuf
rpc UpdateTodo(UpdateTodoRequest) returns (Todo) {
	option (google.api.http) = {
		put: "/v1/todos/update"
		body: "todo"
	};
}
```

请为服务、方法、消息和字段写注释，生成器可以把它们带入 API 描述。使用
`google.api.field_behavior` 标记必填字段，让契约表达输入要求；请求是否被接收
仍由运行时校验器决定。

## 生成规范

模板的 `buf.gen.yaml` 通过固定的 Go 模块版本运行四个本地插件：Go Protobuf、
Go gRPC、Kratos HTTP 和 Gnostic OpenAPI。运行：

```bash
make api
```

OpenAPI 插件合并全部 API 输入，在仓库根目录写入 `openapi.yaml`。模板启用完整
限定 schema 名称，并关闭生成的默认响应。Go 和 HTTP 绑定则写在 `api` 下对应
proto 源文件旁。

不要手工编辑 `openapi.yaml`。应修改 Protobuf 契约和生成器配置，重新生成，并
把规范变化与生成的 Go diff 一起审阅。

## 发布与检查

生成文件可导入 OpenAPI UI、客户端生成器、API 网关或契约检查工具。生产工作流
通常包括：

1. 在干净 checkout 中运行 `make api`；
2. 如果重新生成改变了已跟踪文件则使检查失败；
3. 用选定的 OpenAPI 工具校验 `openapi.yaml`；
4. 服务契约审阅后发布这一份产物。

生成过程能记录 Protobuf 和 HTTP 注解，但不能证明授权、业务校验、分页语义或
向后兼容性。请通过 service 测试和 API 评审覆盖这些行为。

## 流式端点

Kratos v3 为服务端流式 HTTP RPC 生成 SSE 绑定，为客户端流和双向流生成
WebSocket 绑定。OpenAPI 工具对这些长连接协议的表达能力有限。事件名、消息
编码、取消和错误行为应以生成的 HTTP 绑定和明确的流式契约说明为准。

契约约定见 [Protobuf API 设计](/zh-cn/docs/guide/api-protobuf/)，运行时绑定见
[HTTP 传输](/zh-cn/docs/component/transport/http/)。
