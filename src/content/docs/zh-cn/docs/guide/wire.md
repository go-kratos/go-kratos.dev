---
id: wire
title: 依赖注入
---

项目模板使用 Google Wire 进行编译期依赖注入。Wire 读取构造函数和 provider set，
再生成按依赖顺序调用它们的普通 Go 代码。Kratos 本身在运行时不依赖 Wire。

## 按层组织 provider set

每个应用层导出一个小型 provider set：

```go
var ProviderSet = wire.NewSet(NewData, NewTodoRepo)
```

模板为 `data`、`biz`、`service` 和 `server` 分别定义 set。构造函数通过参数和
返回值声明依赖；初始化可能失败时可返回 `(value, error)`，拥有数据库客户端等
长生命周期资源时可返回 `(value, cleanup, error)`。

Provider set 应靠近它暴露的构造函数。数据层构造函数返回业务仓储接口，并避免
通过 provider set 暗中创建可变全局状态。

## 定义 injector

`cmd/server/wire.go` 是只在 `wireinject` 构建标签下编译的 injector 声明：

```go
//go:build wireinject

func wireApp(*conf.Server, *conf.Data, *slog.Logger) (*kratos.App, func(), error) {
	panic(wire.Build(
		server.ProviderSet,
		data.ProviderSet,
		biz.ProviderSet,
		service.ProviderSet,
		newApp,
	))
}
```

这里的 panic 是 Wire 声明，不是运行时代码。Wire 用 `wire_gen.go` 替换它：依次
调用 `NewData`，构造仓储、usecase、service 和传输，最后调用 `newApp`。初始化
失败时，生成代码返回错误，并清理已经创建的资源。

## 生成 injector

不要编辑 `wire_gen.go`。新增构造函数参数或修改 provider set 后运行：

```bash
make all
go test ./...
```

模板中的 `make all` 依次执行 API 生成、配置生成和 `make generate`；最后一个
目标运行 `go generate ./...` 和 `go mod tidy`，`wire_gen.go` 中的 Wire 指令会
重新生成 injector。`make init` 为本地开发安装 Wire 和 Buf。

应同时提交 `wire.go` 与 `wire_gen.go`。CI 中的干净重新生成检查可以发现构造函数
变更后漏更新的 injector。

## 在 main 中管理清理

Injector 返回由各 provider cleanup 组成的清理函数。只有构造成功后才能调用它，
并应在运行应用前 defer：

```go
app, cleanup, err := wireApp(bc.Server, bc.Data, logger)
if err != nil {
	panic(err)
}
defer cleanup()

if err := app.Run(); err != nil {
	panic(err)
}
```

`App.Run` 负责停止传输和注销服务，随后 Wire cleanup 关闭数据客户端和其他已构造
资源。构造函数应让 cleanup 能安全处理部分初始化，并返回有用错误，而不是自行
调用 `panic`。

## 排查生成错误

- **No provider found：** 添加构造函数所属的 provider set，或把该值作为
  injector 输入。
- **Multiple providers：** 移除有歧义的 provider，或为不同实现拆分 injector。
- **Interface is not provided：** 让构造函数返回接口；若它返回具体类型，则使用
  `wire.Bind`。
- **Initialization cycle：** 把共同职责移到接口后，或调整所有权；Wire 无法构造
  运行时依赖环。

Wire 只能验证构造关系，不能验证行为。Usecase、service 和仓储仍需独立测试。
