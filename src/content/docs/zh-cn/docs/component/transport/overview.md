---
id: overview
title: 概览
---

Kratos 围绕同一份 Protobuf 服务契约提供 HTTP 和 gRPC 传输。两者都实现
`transport.Server` 生命周期，并把 `transport.Transporter` 放入请求 context。
因此，中间件无需知道请求来自哪个服务端，也能读取传输类型、端点、规范操作名
和请求头。

## 服务端生命周期

在 `internal/server` 中构造传输并注册生成的服务，再把完成的服务端交给应用。
`App.Run` 会取得端点、启动所有服务端、在启动后注册服务，并在优雅退出时停止
服务端。

```go
app := kratos.New(
	kratos.Name("todo"),
	kratos.Server(httpServer, grpcServer),
)
if err := app.Run(); err != nil {
	return err
}
```

`Endpoint()` 返回监听器的实际端点。服务监听 `:0` 时尤其有用：Kratos 会先解析
系统分配的端口，再构造注册信息。

## 生成的绑定

一个服务通常只有一份 Protobuf 定义，并生成两种适配器：

| 绑定 | 服务端注册 | 客户端构造 |
| --- | --- | --- |
| gRPC | `RegisterTodoServiceServer` | `NewTodoServiceClient` |
| HTTP | `RegisterTodoServiceHTTPServer` | `NewTodoServiceHTTPClient` |

生成的适配器负责解码传输输入、设置规范操作名、执行中间件链、调用服务实现并
编码结果。业务行为应放在 service 和 biz 层，不要修改生成文件。

## Context 信息

服务端中间件使用 `transport.FromServerContext`，客户端中间件使用
`transport.FromClientContext`。`Transporter` 提供 `Kind`、`Endpoint`、
`Operation`、`RequestHeader` 和 `ReplyHeader`。

## 选择传输

HTTP 适合浏览器、公开 JSON API、SSE 和 WebSocket 客户端。gRPC 原生支持
Protobuf RPC、一元与流式调用、健康检查和反射。同一个服务实现可以像项目模板
一样同时暴露两种传输。两套监听器的流量和停止过程独立，应分别配置地址与超时。

服务端和客户端选项详见 [HTTP](/zh-cn/docs/component/transport/http/) 和
[gRPC](/zh-cn/docs/component/transport/grpc/)。
