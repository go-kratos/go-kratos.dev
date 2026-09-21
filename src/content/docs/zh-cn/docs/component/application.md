---
id: application
title: 应用生命周期
description: 构造、启动、注册并优雅停止 Kratos v3 应用。
---

`kratos.App` 负责协调传输服务器、服务注册、生命周期 hook、信号和优雅停机。它不会创建业务服务或存储客户端；应用应接收 Wire 或手写启动代码已经构造好的依赖。

## 构造应用

通过 `kratos.Server` 传入所有传输服务器。身份字段会用于日志、服务发现注册，以及从 context 取得的 `AppInfo`。

```go
func newApp(logger *slog.Logger, gs *grpc.Server, hs *http.Server) *kratos.App {
	return kratos.New(
		kratos.ID(instanceID),
		kratos.Name("todo"),
		kratos.Version(version),
		kratos.Metadata(map[string]string{"region": "cn-east"}),
		kratos.Logger(logger),
		kratos.StopTimeout(10*time.Second),
		kratos.Server(gs, hs),
	)
}
```

省略 `ID` 时，`New` 会尝试生成 UUID。`Name`、`Version` 和 `Metadata` 没有对业务有意义的框架默认值；服务需要注册或观测信息时应显式设置。`Logger` 会把传入的 `*slog.Logger` 设为进程默认 logger。

可用 option 如下：

| 关注点 | Option |
| --- | --- |
| 身份 | `ID`、`Name`、`Version`、`Metadata` |
| 运行时 | `Context`、`Logger`、`Signal` |
| 服务器 | `Server`、`Endpoint`、`StopTimeout` |
| 注册中心 | `Registrar`、`RegistrarTimeout` |
| Hook | `BeforeStart`、`AfterStart`、`BeforeStop`、`AfterStop` |

`Endpoint` 会覆盖传输服务器报告的 endpoint。只有外部可达地址与监听地址不同，例如服务位于网关之后时才需要设置。参数必须是注册中心和客户端能够理解的有效 `*url.URL`。

## 启动顺序

`Run` 会先构造注册实例，然后依次执行：

1. 按声明顺序运行 `BeforeStart`；第一个错误会中止启动。
2. 并发启动所有传输服务器。
3. 等每个服务器的 `Start` goroutine 已经开始，再在配置 registrar 时注册服务实例。
4. 按声明顺序运行 `AfterStart`。
5. 等待指定的系统信号、显式 `Stop` 或服务器错误。

默认信号为 `SIGTERM`、`SIGQUIT` 和 `SIGINT`。任一服务器返回错误都会取消共享的运行 context，并开始停止其它服务器。

Hook 适合管理必须跟随应用生命周期的资源。普通依赖应使用构造函数和 Wire cleanup；不要从 hook 再启动一套 HTTP 或 gRPC 服务器。

## 注册与 endpoint

配置 registrar 后，Kratos 会注册一个 `registry.ServiceInstance`，其中包含应用 ID、名称、版本、metadata 和 endpoint。没有显式设置 `Endpoint` 时，endpoint 来自实现了 `transport.Endpointer` 的服务器。

```go
app := kratos.New(
	kratos.Name("todo"),
	kratos.Version(version),
	kratos.Registrar(registrar),
	kratos.RegistrarTimeout(5*time.Second),
	kratos.Server(httpServer, grpcServer),
)
```

注册发生在服务器开始启动之后。注册失败会使 `Run` 返回错误。`Stop` 会先注销实例，再取消运行 context。应发布消费者能够访问的地址；`0.0.0.0` 是监听地址，通常不是有效的服务发现地址。

## 优雅停机

`Stop` 运行 `BeforeStop`、注销实例，然后取消应用 context。每个 transport 得到的停止 context 不继承该取消状态；配置 `StopTimeout` 后会额外设置 deadline。所有服务器 goroutine 结束后，`Run` 才执行 `AfterStop`。

```go
app := kratos.New(
	kratos.StopTimeout(15*time.Second),
	kratos.BeforeStop(func(ctx context.Context) error {
		log.InfoContext(ctx, "application is stopping")
		return nil
	}),
	kratos.AfterStop(func(ctx context.Context) error {
		log.InfoContext(ctx, "application stopped")
		return nil
	}),
	kratos.Server(server),
)
```

`BeforeStop` 的错误会被保留，但注销仍会执行。注销失败会立即返回。服务器组全部结束后才会执行 `AfterStop`。layout 入口会在 `app.Run` 外 defer Wire provider 返回的 cleanup，因此数据库等客户端在 transport 停止后关闭。

## 从 context 获取应用信息

Kratos 会把 `AppInfo` 放入传给 hook 和 transport `Start` 的 context。只有代码需要应用身份且不适合直接依赖时，才使用 `kratos.FromContext`。

```go
info, ok := kratos.FromContext(ctx)
if ok {
	logger.InfoContext(ctx, "running", "service.name", info.Name(), "service.id", info.ID())
}
```

多数应用代码显式传入身份更容易测试。context helper 更适合生命周期基础设施和自定义 transport。

## 失败处理

- 将 `Run` 错误视为进程级错误，并返回非零退出状态。
- 为执行中的请求预留停止时间，同时设置有限的 `StopTimeout`，防止部署终止无限等待。
- Hook 要能处理部分启动状态；较早的错误可能发生在只有部分资源已经启动时。
- Hook 应尽快结束，并遵守 context deadline。

项目 layout 在 `cmd/server/main.go` 构造应用，并把依赖清理交给 Wire。
