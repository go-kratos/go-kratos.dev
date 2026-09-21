---
id: metadata
title: 元数据
---

Kratos metadata 通过 `context.Context` 携带字符串 header 值，应用代码无需耦合
HTTP header 或原生 gRPC metadata。其类型是 `map[string][]string`；`Add`、`Set`、
`Get` 和 `Values` 会把 key 规范化为小写。

## 操作 metadata 值

使用 `metadata.New`、`Set`、`Add`、`Get`、`Values`、`Range` 和 `Clone` 管理值。
`Set` 替换一个 key 的值，`Add` 则追加一个值。

```go
md := metadata.New()
md.Set("x-md-global-request-id", requestID)
md.Add("x-md-global-tag", "checkout")
ctx := metadata.NewClientContext(context.Background(), md)
```

`AppendToClientContext` 适合向已有出站 context 添加键值对。它要求字符串数量为
偶数，key 没有配对时会 panic。

```go
ctx = metadata.AppendToClientContext(ctx,
	"x-md-global-request-id", requestID,
	"x-md-local-caller", serviceName,
)
reply, err := client.GetTodo(ctx, request)
```

`FromClientContext` 读取准备发送给下一次调用的 metadata，`FromServerContext` 读取
当前服务端收到的 metadata。`MergeToClientContext` 返回合并给定 map 后的新
context。

## 安装传输中间件

只有两端传输安装对应中间件后，metadata 才会跨网络传递：

```go
server := grpc.NewServer(grpc.Middleware(metadata.Server()))
client, err := grpc.NewClient(ctx,
	grpc.WithEndpoint(endpoint),
	grpc.WithMiddleware(metadata.Client()),
)
```

中间件使用公共 `transport.Header`，因此相同 metadata 代码适用于 HTTP 和 gRPC。

## 默认传播规则

服务端中间件读取以 `x-md-` 开头的入站 header，并存入 server metadata。客户端
中间件把三个来源写入出站请求：

1. 在该客户端中间件上配置的常量；
2. 显式 client metadata context 中的全部值；
3. 当前 server context 中 key 以 `x-md-global-` 开头的值。

这些默认值赋予前缀清晰的逐跳语义。入站 `x-md-global-*` 会继续传给下游服务；
入站 `x-md-local-*` 只对当前服务可见，不会自动转发。显式 client metadata 总会
发送到下一个服务，所以其中只应放本次调用需要的 header。

`metadata.WithPropagatedPrefix` 会替换默认前缀列表：在服务端选择接收的 header，
在客户端选择从当前 server metadata 继续转发的值。`metadata.WithConstants` 在
中间件实例上加入固定值，例如调用方标识。

## 安全与中间件顺序

在第一个信任边界，metadata 是调用方可控输入。信任身份或租户字段前必须认证，
应限制 header 大小，并避免通过宽泛前缀转发授权或隐私 header。Key 应稳定且有
文档说明，凭据不能写入日志。

`metadata.Server()` 应放在读取入站值的中间件外层。客户端上，
`metadata.Client()` 应放在需要读取已填充出站传输 header 的中间件外层。追踪传播
由 OpenTelemetry tracing 中间件处理，不需要另设 `x-md-` key。
