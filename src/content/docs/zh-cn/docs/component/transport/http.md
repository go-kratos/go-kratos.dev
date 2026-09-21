---
id: http
title: HTTP
---

Kratos HTTP 传输基于 `gorilla/mux` 和生成的 Protobuf 绑定。生成的绑定会把路径、
查询和请求体字段转换为 Protobuf 请求，设置规范 RPC 操作名，运行中间件，并编码
服务返回值。

## 创建服务端

在 `internal/server` 中创建服务端，然后注册每个生成的服务。把服务端加入
`kratos.App`，使启动和优雅退出统一由应用管理。

```go
srv := http.NewServer(
	http.Address(":8000"),
	http.Timeout(time.Second),
	http.Middleware(
		recovery.Recovery(),
		validate.Validator(),
	),
)
v1.RegisterTodoServiceHTTPServer(srv, todo)
```

服务端默认使用 TCP、地址 `:0`、一秒请求 context 超时和严格斜杠路由。
`TLSConfig` 启用 HTTPS；`Listener` 接收已有监听器；`Endpoint` 覆盖服务注册时
公布的端点。其他选项可配置路径前缀、原生 HTTP filter、解码器、响应与错误
编码器以及 404/405 处理函数。

Kratos 中间件处理的是规范化 RPC 请求。`http.Filter` 是包在路由外层的原生
`net/http` 中间件，适合 CORS、静态响应头等只与 HTTP 有关的工作。

## 生成路由与绑定

在 Protobuf 服务中通过 `google.api.http` 声明路由：

```protobuf
rpc GetTodo(GetTodoRequest) returns (Todo) {
	option (google.api.http) = {get: "/v1/todos/{id}"};
}
```

运行 `make api` 后调用 `RegisterTodoServiceHTTPServer`。生成的处理函数会根据
注解调用 `BindVars`、`BindQuery` 和 `Bind`，再以
`/todo.v1.TodoService/GetTodo` 作为操作名执行中间件。服务实现中不应重复这些
绑定工作。

默认请求体解码器根据 `Content-Type` 选择 codec；响应与错误编码器根据 `Accept`
选择，无法匹配时回退到 `json`。返回的 Kratos 错误会转换为包含 code、reason、
message 和 metadata 的 HTTP 响应。`google.api.HttpBody` 会跳过结构化编码，直接
携带自己的内容类型和字节数据。

## 手写路由

不属于 Protobuf API 的端点可使用 `Router`。处理函数接收 `http.Context`；它
内嵌 `context.Context`，并提供请求、响应、绑定和结果辅助方法。

```go
router := srv.Route("/")
router.GET("/healthz", func(ctx http.Context) error {
	return ctx.JSON(200, map[string]string{"status": "ok"})
})
```

Router 支持分组以及 GET、HEAD、POST、PUT、PATCH、DELETE、CONNECT、OPTIONS、
TRACE 辅助方法。输入可用 `BindVars`、`BindQuery`、`BindForm` 或 `Bind`，输出可用
`Returns`、`Result`、`JSON`、`XML`、`String`、`Blob` 或 `Stream`。服务端自身的
`Handle` 和 `HandleFunc` 接收原生 `net/http` handler。

## 创建客户端

生成的 HTTP 客户端使用 Kratos `*http.Client`。默认客户端超时为两秒；没有 TLS
配置时使用 HTTP，传入 `WithTLSConfig` 后使用 HTTPS。

```go
conn, err := http.NewClient(ctx,
	http.WithEndpoint("http://127.0.0.1:8000"),
	http.WithTimeout(2*time.Second),
	http.WithMiddleware(logging.Client(logger)),
)
if err != nil {
	return err
}
defer conn.Close()

client := v1.NewTodoServiceHTTPClient(conn)
todo, err := client.GetTodo(ctx, &v1.GetTodoRequest{Id: id})
```

客户端选项可以替换 round tripper、请求编码器、响应解码器或错误解码器；
`WithUserAgent` 设置 User-Agent。服务发现需要把 `WithDiscovery(discovery)` 与
`discovery:///todo` 之类的端点组合使用；`WithNodeFilter`、`WithSubset` 和全局
selector 控制实例选择，`WithBlock` 等待第一批发现结果。

## HTTP 流式调用

v3 HTTP 生成器把服务端流映射为 Server-Sent Events，把客户端流或双向流映射为
WebSocket。生成的客户端暴露带类型的流接口，因此服务代码仍使用生成的 `Send`
和 `Recv` 方法。SSE 发送 `message` 事件，客户端只能接收；WebSocket 支持双向
Protobuf 消息。修改流式方法后必须重新生成绑定，因为生成的 HTTP 方法和处理
函数决定线上的实际行为。

服务中应设置明确的流截止时间，并在 `Send` 或 `Recv` 失败时结束处理。流创建后，
HTTP 服务端会让它脱离普通请求的 deadline 与 cancellation，因此长连接需要自己的
生命周期策略。

Protobuf 定义、类型安全的 server/client 示例、codec 选择、关闭行为和 proxy
配置见[使用 SSE 与 WebSocket 实现 HTTP 流式调用](/zh-cn/docs/component/transport/http-streaming/)。

## 路径与 codec 辅助方法

生成的客户端使用 `BuildPath` 展开注解路径。手写代码也可使用它，字段名应使用
JSON 名称：

```go
path := http.BuildPath("/v1/todos/{id}", &struct {
	ID string `json:"id"`
}{ID: "42"})
```

调用选项包括 `ContentType`、`Accept`、`Operation`、`PathTemplate` 和 `Header`。
已注册 codec 见[编码](/zh-cn/docs/component/encoding/)，错误响应契约见
[错误处理](/zh-cn/docs/component/errors/)。
