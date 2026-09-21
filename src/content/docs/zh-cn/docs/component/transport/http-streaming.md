---
id: http-streaming
title: 使用 SSE 与 WebSocket 实现 HTTP 流式调用
description: 在 Kratos v3 中定义、实现并调用 HTTP 流式 RPC。
---

Kratos v3 可以为流式 RPC 生成 HTTP binding。服务端流使用 Server-Sent Events
（SSE），客户端流和双向流使用 WebSocket。同一个 service 实现仍可同时注册到
生成的 HTTP 与 gRPC server。

| Protobuf RPC | HTTP transport | 生成的 client 操作 |
| --- | --- | --- |
| Unary | 普通 HTTP request/response | 一次请求、一次响应 |
| Server streaming | SSE | `Recv` |
| Client streaming | WebSocket | `Send`、`CloseAndRecv` |
| Bidirectional streaming | WebSocket | `Send`、`Recv`、`CloseSend` |

## 定义流式 RPC

当前项目模板同时包含服务端流 `WatchTodos` 和双向流 `SyncTodos`：

```proto
rpc WatchTodos (WatchTodosRequest) returns (stream TodoEvent) {
  option (google.api.http) = {
    get: "/v1/todos/watch"
  };
}

rpc SyncTodos (stream SyncTodoRequest) returns (stream TodoEvent) {
  option (google.api.http) = {
    post: "/v1/todos/sync"
    body: "*"
  };
}
```

修改 service contract 后运行项目的 API 生成命令：

```bash
make api
```

对于服务端流，生成的 handler 保留注解中的 HTTP method，并写入 SSE response。
对于客户端流和双向流，WebSocket 需要先用 HTTP GET 完成 upgrade handshake，因此
生成的 HTTP route 是 `GET`。上例中的 `post` 仍描述 RPC 的 HTTP rule，但实际
生成的 WebSocket route 是 `GET /v1/todos/sync`。

## 实现 service

生成的 stream interface 提供类型安全的 `Send` 与 `Recv`。服务端流方法在 stream
之前接收 request；客户端流方法从 stream 接收 request。

```go
func (s *TodoService) WatchTodos(
	req *v1.WatchTodosRequest,
	stream v1.TodoService_WatchTodosServer,
) error {
	for _, todo := range todos {
		if err := stream.Send(&v1.TodoEvent{
			Action: "snapshot",
			Todo:   todo,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (s *TodoService) SyncTodos(stream v1.TodoService_SyncTodosServer) error {
	for {
		req, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			return err
		}
		if err := stream.Send(applyChange(req)); err != nil {
			return err
		}
	}
}
```

生成的 HTTP server 调用的就是这些方法：它创建 SSE 或 WebSocket stream，让
server middleware 包裹整个 service method，并根据方法返回的 error 关闭
transport。

## 调用服务端流

生成的 HTTP client 打开 SSE response 并返回类型安全的 stream。读取到 `io.EOF`
为止；调用方不再需要事件时，应取消 context。

```go
stream, err := client.WatchTodos(ctx, &v1.WatchTodosRequest{
	PageSize: 20,
})
if err != nil {
	return err
}
defer stream.CloseSend()

for {
	event, err := stream.Recv()
	if errors.Is(err, io.EOF) {
		break
	}
	if err != nil {
		return err
	}
	handle(event)
}
```

SSE response 的 Content-Type 是 `text/event-stream`。正常消息的事件名为
`message`。如果 service 在开始发送后返回 error，Kratos 会发送包含已编码
Kratos error 的 `error` 事件，然后结束 response。

当所有请求参数都可以放入 URL 时，浏览器可直接使用 `EventSource`：

```js
const stream = new EventSource("/v1/todos/watch?page_size=20");

stream.addEventListener("message", (event) => {
  const todoEvent = JSON.parse(event.data);
  console.log(todoEvent);
});

stream.addEventListener("error", () => {
  stream.close();
});
```

直接检查协议时，应关闭 client buffering：

```bash
curl -N -H 'Accept: text/event-stream' \
  'http://127.0.0.1:8000/v1/todos/watch?page_size=20'
```

## 调用双向流

生成的双向流 client 会在首次 `Send`、`Recv` 或 `CloseSend` 时打开 WebSocket。
如果 path 或 query 值来自第一条 request message，必须先调用 `Send`。

```go
stream, err := client.SyncTodos(ctx)
if err != nil {
	return err
}
defer stream.CloseSend()

if err := stream.Send(&v1.SyncTodoRequest{
	Action: "create",
	Todo:   &v1.Todo{Title: "read the docs"},
}); err != nil {
	return err
}

event, err := stream.Recv()
if err != nil {
	return err
}
handle(event)
```

生成的 client 为 WebSocket 消息选择 `application/protojson`。直接使用原始
WebSocket client 时，必须使用相同的 protobuf JSON 表示，并处理 Kratos 的结束
与错误 control frame。两端都是 Go 服务时，优先使用生成的 client。

## Request binding 与 codec

打开 SSE stream 前，生成的 handler 与 unary handler 一样绑定 request body、
query 和 path variable。对于 WebSocket stream，每个接收到的 frame 会成为一条
request message，随后再把 path 与 query 值绑定到这条消息。如果 HTTP rule 把
某个具名 message field 映射为 body，则 frame 只承载该 field，generator 会配置
`WithStreamBodyField`。

Stream codec 根据 `Accept` 与 `Content-Type` 选择。生成的 client 会设置 binding
所需的 header；低层 client 应显式设置。当 header 没有匹配已注册 subtype 时，
streaming 先回退到 `protojson`；若未注册 `protojson`，再回退到 `json`。

## 生命周期、截止时间与错误

HTTP stream 会脱离 server 的普通单次请求 timeout，避免长连接被 unary request
预算中断。Stream context 会保留 middleware 添加的 value，但不继承普通 request
的 deadline 与 cancellation。`Send` 或 `Recv` 失败时应结束循环；需要限制空闲
时间或写入时间时，使用 stream 的 `SetReadDeadline` 与 `SetWriteDeadline`。传入
零时间会关闭对应 deadline。

正常关闭在生成的 client 中表现为 `io.EOF`。Service error 会在关闭前传输：SSE
使用 `error` 事件，WebSocket 使用 error control frame。重连、resume token、事件
顺序和投递保证都属于应用协议；transport 不会自动提供持久化事件日志或重放。

Proxy 与 gateway 必须允许 WebSocket upgrade，并应关闭 SSE response buffering。
其 idle timeout 应长于 stream 预期的静默期，否则应用需要发送有实际协议含义的
heartbeat message。
