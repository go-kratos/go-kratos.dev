---
id: wire
title: Wire 依赖注入
description: Kratos 项目模块依赖注入，快速初始化 Go 项目模板，Go 依赖注入工具
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---

**Wire** 是一个灵活的依赖注入工具，通过自动生成代码的方式在编译期完成依赖注入。

在各个组件之间的依赖关系中，通常鼓励显式初始化，而不是全局变量传递。

所以通过 *Wire* 进行初始化代码，可以很好地解决组件之间的耦合，以及提高代码维护性。

### 安装工具

```bash
# 导入到项目中
go get -u github.com/google/wire

# 安装命令
go install github.com/google/wire/cmd/wire
```

### 工作原理

Wire 具有两个基本概念：*Provider* 和 *Injector*。

Provider 是一个普通的 *Go Func* ，这个方法也可以接收其它 *Provider* 的返回值，从而形成了依赖注入；

```go
// 提供一个配置文件（也可能是配置文件）
func NewConfig() *conf.Data {...}

// 提供数据组件，依赖了数据配置（初始化 Database、Cache 等）
func NewData(c *conf.Data) (*Data, error) {...}

// 提供持久化组件，依赖数据组件（实现 CURD 持久化层）
func NewUserRepo(d *data.Data) (*UserRepo, error) {...}
```

### 使用方式

在 Kratos 中，主要分为 *server、service、biz、data* 服务模块，会通过 *Wire* 进行模块顺序的初始化；

<img src="/images/wire.png" alt="kratos ddd" width="650px" />

在每个模块中，只需要一个 *ProviderSet* 提供者集合，就可以在 wire 中进行依赖注入；

并且我们在每个组件提供入口即可，不需要其它依赖，例如：

```go
-data
--data.go    // var ProviderSet = wire.NewSet(NewData, NewGreeterRepo)
--greeter.go // func NewGreeterRepo(data *Data, logger log.Logger) biz.GreeterRepo {...}
```

然后通过 *wire.go* 中定义所有 *ProviderSet* 可以完成依赖注入配置。

### 初始化组件

通过 wire 初始化组件，需要定义对应的 wire.go，以及 kratos application 用于启动管理。

```go
// 应用程序入口
cmd
-main.go
-wire.go
-wire_gen.go

// main.go 创建 kratos 应用生命周期管理
func newApp(logger log.Logger, hs *http.Server, gs *grpc.Server, greeter *service.GreeterService) *kratos.App {
    pb.RegisterGreeterServer(gs, greeter)
    pb.RegisterGreeterHTTPServer(hs, greeter)
    return kratos.New(
        kratos.Name(Name),
        kratos.Version(Version),
        kratos.Logger(logger),
        kratos.Server(
            hs,
            gs,
        ),
    )
}

// wire.go 初始化模块
func initApp(*conf.Server, *conf.Data, log.Logger) (*kratos.App, error) {
    // 构建所有模块中的 ProviderSet，用于生成 wire_gen.go 自动依赖注入文件
    panic(wire.Build(server.ProviderSet, data.ProviderSet, biz.ProviderSet, service.ProviderSet, newApp))
}
```

在项目的 main 目录中，运行 wire 进行生成编译期依赖注入代码：

```
wire
```

## References

* [https://blog.golang.org/wire](https://blog.golang.org/wire)
* [https://github.com/google/wire](https://github.com/google/wire)
* [https://medium.com/@dche423/master-wire-cn-d57de86caa1b](https://medium.com/@dche423/master-wire-cn-d57de86caa1b)
