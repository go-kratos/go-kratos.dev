---
id: grpc
title: gRPC
---

Kratos gRPC 传输在 `google.golang.org/grpc` 之上集成应用生命周期、Kratos
中间件、服务发现、负载均衡以及一致的错误和元数据转换。生成的 Protobuf 服务
接口仍是普通 gRPC 接口。

## 创建服务端

在 `internal/server` 中构造服务端并注册生成的服务。

```go
srv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Timeout(time.Second),
	grpc.Middleware(
		recovery.Recovery(),
		validate.Validator(),
	),
)
v1.RegisterTodoServiceServer(srv, todo)
```

服务端默认使用 TCP、地址 `:0` 和一秒的一元请求超时。`TLSConfig` 安装传输凭据；
`Listener` 接收已有监听器；`Endpoint` 覆盖注册时使用的端点；`Options` 传入原生
`grpc.ServerOption`。

`Middleware` 用于一元 RPC，流式 RPC 使用 `StreamMiddleware`。流 context 持续
整个流生命周期，不会自动继承一元请求超时。`UnaryInterceptor` 和
`StreamInterceptor` 会把原生 gRPC interceptor 追加在 Kratos interceptor 之后。

## 内置 gRPC 服务

Kratos 服务端默认注册标准 gRPC health 服务、reflection 和 channelz 等 gRPC
admin 服务。`DisableReflection` 关闭反射；`CustomHealth` 阻止自动注册 health，
以便应用注册自己的实现。服务停止时还会执行 admin 清理函数。

启动时，内置 health 服务切换为 `SERVING`；停止时切换为 `NOT_SERVING`。关闭过程
先尝试 `GracefulStop`，如果传入的停止 context 到期则调用 `Stop`。

## 实现并注册服务

在 Protobuf 中定义一元或流式 RPC，运行 `make api`，在 `internal/service` 中实现
生成的服务端接口，并只注册一次。请求进入中间件时带有完整操作名，例如
`/todo.v1.TodoService/GetTodo`。

处理函数返回的 Kratos 错误会转换为 gRPC status 错误。框架客户端再把收到的
status 错误转换回 Kratos 错误，并保留线上携带的 code、reason、message 和
metadata。

## 创建客户端

`grpc.NewClient` 返回 `*grpc.ClientConn`。默认一元超时为两秒，配置加权轮询选择，
并在返回前开始连接。

```go
conn, err := grpc.NewClient(ctx,
	grpc.WithEndpoint("dns:///127.0.0.1:9000"),
	grpc.WithTimeout(2*time.Second),
	grpc.WithMiddleware(logging.Client(logger)),
)
if err != nil {
	return err
}
defer conn.Close()

client := v1.NewTodoServiceClient(conn)
todo, err := client.GetTodo(ctx, &v1.GetTodoRequest{Id: id})
```

未传入 `WithTLSConfig` 时，Kratos 会安装 gRPC insecure 凭据；传入 TLS 配置后则
启用 TLS。`WithOptions` 添加原生 `grpc.DialOption`，一元和流 interceptor 选项
追加原生 interceptor。生成的流客户端使用 `WithStreamMiddleware`。

## 服务发现与负载均衡

直接连接可使用 gRPC 支持的 target，例如 `dns:///host:port`。使用 Kratos 服务
发现时，传入 `registry.Discovery` 并使用 `discovery:///service-name`：

```go
conn, err := grpc.NewClient(ctx,
	grpc.WithEndpoint("discovery:///todo"),
	grpc.WithDiscovery(discovery),
	grpc.WithNodeFilter(selector.Version("v3.0.0")),
)
```

客户端默认启用 gRPC 健康检查；目标服务没有实现时使用
`grpc.WithHealthCheck(false)`。`WithSubset` 限制发现子集，`WithNodeFilter` 在
selector 选择前过滤候选节点。

## 元数据与流式行为

安装 `metadata.Client()` 和 `metadata.Server()` 来传播 Kratos 元数据，传输适配器
会在它与原生 gRPC metadata 之间转换。公共中间件应使用
`transport.FromServerContext` 或 `transport.FromClientContext`，避免耦合 gRPC
内部类型。

流式方法需要明确处理取消、截止时间和清理。关闭客户端连接会结束该连接上的所有
流；服务端优雅停止会等待活动 RPC，直到应用的停止 context 到期。
