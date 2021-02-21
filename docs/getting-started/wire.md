---
id: wire
title: 依赖注入
---

**Wire** 是一个灵活的依赖注入工具，通过自动生成代码的方式在编译期完成依赖注入。

在各个组件之间的依赖关系，通常鼓励显式初始化，而不是全局变量传递。

所有通过 *Wire* 进行初始化代码，可以很好地处理组件之间的耦合，以及提供代码维护性。

### Wire 的工作原理

**Wire** 具有两个基本概念：*Provider* 和 *Injector*。

**Provider** 是一个普通的 *Go Func* ，这个方法也可以接收其它 *Provider* 的返回值，从而形成了依赖注入；

```
// 提供一个配置文件（也可能是配置文件）
func NewConfig() *conf.Data {...}

// 提供数据组件，依赖了数据配置（初始化 Database、Cache 等）
func NewData(c *conf.Data) (*Data, error) {...}

// 提供持久化组件，依赖数据组件（实现 CURD 持久化层）
func NewUserRepo(d *data.Data) (*UserRepo, error) {...}
```

### Wire 使用方式

在 Kratos 中，主要分为 *server、service、biz、data* 服务模块，会通过 *Wire* 进行模块顺序的初始化；

<img src="/images/wire.png" alt="kratos ddd" width="650px" />

在每个模块中，只需要一个 *ProviderSet* 提供者集合，就可以在 wire 中进行依赖注入；

并且我们在每个组件提供入口即可，不需要其它依赖依赖，例如：

```
-data
--data.go    // var ProviderSet = wire.NewSet(NewData, NewGreeterRepo)
--greeter.go // func NewGreeterRepo(data *Data, logger log.Logger) biz.GreeterRepo
```

然后通过 *wire.go* 中定义所有 *ProviderSet* 可以完成依赖注入配置。

