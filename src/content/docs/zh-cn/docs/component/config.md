---
id: config
title: 配置
---

Kratos v3 通过 `config.Source` 加载配置。source 返回 key-value 数据，并可提供 watcher。core module 提供 file 和 environment source；远程配置系统由独立 contrib module 提供。

## 创建并加载配置

```go
import (
	"github.com/go-kratos/kratos/v3/config"
	"github.com/go-kratos/kratos/v3/config/env"
	"github.com/go-kratos/kratos/v3/config/file"
)

c := config.New(config.WithSource(
	file.NewSource("configs"),
	env.NewSource("KRATOS"),
))
defer c.Close()

if err := c.Load(); err != nil {
	return err
}
var bootstrap Bootstrap
if err := c.Scan(&bootstrap); err != nil {
	return err
}
```

应用停止时调用 `Close` 释放 source watcher。除非服务明确支持回退配置，否则应将 `Load` 或 `Scan` 错误视为启动失败。

## Source 与优先级

`file.NewSource("configs")` 读取目录下支持的配置文件；`env.NewSource("KRATOS")` 读取该前缀的环境变量。后传入 `config.WithSource` 的 source 会覆盖先前 source 的同名值，适合用环境变量覆盖部署配置。

Environment source 会去掉匹配前缀和一个可选下划线，再把剩余部分直接作为 key，
不会把下划线转换为点。例如 `KRATOS_DATABASE_SOURCE` 会成为根 key
`DATABASE_SOURCE`；文件中的 `${DATABASE_SOURCE:default}` 再从这个已合并 key
解析。项目模板正是通过这一方式注入数据库 DSN。

将非敏感默认值放在版本控制的文件中，通过部署配置注入凭据。不要记录完整的已解码配置。

## 解码配置

`Scan` 解码完整配置树。使用泛型 `config.Get` 解码某个 key 下的子树：

```go
type databaseConfig struct {
	Source string `json:"source"`
}
database, err := config.Get[databaseConfig](c, "data.database")
if err != nil {
	return err
}
```

使用明确的类型表达 duration、地址和功能开关，并在构造 server 与 client 前校验
必填值。

## 监听更新

仅当应用能在请求执行期间安全应用更新时才使用 `Watch(key, observer)`。observer 接收 key-value 更新，必须自行校验并同步替换状态。监听地址、数据库 driver 等启动期设置通常应采用受控重启。

```go
if err := c.Watch("data.database", func(key string, value config.Value) {
	// Decode, validate, and atomically replace only dynamic settings.
}); err != nil {
	return err
}
```

## 项目模板

项目模板将运行时文件放在 `configs/`，加载 file 和 `KRATOS` environment source，并通过 `make config` 从 `internal/conf` 生成配置 Go 类型。修改配置 protobuf 定义后运行 `make config`；还需生成 API 或 Wire 输出时运行 `make all`。

Consul、Etcd、Nacos、Apollo、Kubernetes 和 Polaris 等 contrib adapter 有独立的 v3 module 路径；client 配置和 watch 语义请查阅各 adapter 的包文档。
