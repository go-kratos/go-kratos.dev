---
slug: go-project-layout
title: Go工程化 - Project Layout 最佳实践
description: Go 项目工程化/基础库，在项目不同角度中的设计理念，Go 是一个面向包名设计的语言，可以通过各个包名进行组织 Go 的项目布局
keywords:
  - Go 
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
author: Tony
author_title: Maintainer of go-kratos
author_url: https://github.com/tonybase
author_image_url: https://avatars.githubusercontent.com/u/3871120?s=460&v=4
tags: [go, golang, 工程化, 项目布局, 最佳实践]
---

## 介绍

这篇文章主要讲 **Go 项目工程化** 上的一些思考，以及 **Kratos** 在项目不同角度中的设计理念。

Go 是一个面向包名设计的语言，可以通过各个包名进行组织 Go 的项目布局，而大家遵循规范设计准则，可以很好地改善团队成员之间的沟通。

## 项目布局

每个公司都应当为不同的微服务建立一个统一的 Kit 工具包项目（基础库/框架）和 Application 项目。
基础库 Kit 为独立项目，公司级建议只有一个，按照功能目录来拆分会带来不少的管理工作，因此建议合并整合。

> by Package Oriented Design
> “To this end, the Kit project is not allowed to have a vendor folder. If any of packages are dependent on 3rd party packages, they must always build against the latest version of those dependences.”

### Kit 基础库

将 Kit 项目作为公司的标准库，因此应该只有一个。并且 Kit 基础库也应该具备以下这些特点：

* 简单：不过度设计，代码平实简单；
* 通用：通用业务开发所需要的基础库的功能；
* 高效：提高业务迭代的效率；
* 稳定：基础库可测试性高，覆盖率高，有线上实践安全可靠；
* 健壮：通过良好的基础库设计，减少错用；
* 高性能：性能高，但不特定为了性能做 hack 优化，引入 unsafe ；
* 扩展性：良好的接口设计，来扩展实现，或者通过新增基础库目录来扩展功能；
* 容错性：为失败设计，大量引入对 SRE 的理解，鲁棒性高；
* 工具链：包含大量工具链，比如辅助代码生成，lint 工具等等；

以 Kratos 为例子，一个典型的 Kit 基础库 可能看起来像这样：

```
github.com/go-kratos/kratos
├── cmd
├── docs
├── internal
├── examples
├── api
├── errors
├── config
├── encoding
├── log
├── metrics
├── metadata
├── middleware
├── transport
├── registry
├── third_party
├── app.go
├── options.go
├── go.mod
├── go.sum
```

> 注意：为了保证 Kit 基础库的可移植性，尽可能进行接口抽象，并且 go.mod 依赖第三方库也尽可能简单，然后再通过 plugins 进行扩展基础库，以满足不同的业务需求定制化。

### Application 应用项目

如果你尝试学习 Go，或者你正在为自己建立一个 PoC 或一个玩具项目，这个项目布局是没啥必要的。从一些非常简单的事情开始（一个 main.go 文件绰绰有余）。当有更多的人参与这个项目时，你将需要更多的结构，包括需要一个 Toolkit 来方便生成项目的模板，尽可能大家统一的工程目录布局。

<img src="/images/ddd.png" alt="kratos ddd" width="500px" />

例如，通过 Kratos 工具生成一个 Go工程化项目 模板：

```
# 创建项目模板
kratos new helloworld

cd helloworld
# 拉取项目依赖
go mod download
# 生成proto模板
kratos proto add api/helloworld/helloworld.proto
# 生成client源码
kratos proto client api/helloworld/helloworld.proto
# 生成server模板
kratos proto server api/helloworld/helloworld.proto -t internal/service
```

在 Kratos 中，一个典型的 Go 项目布局 可能看起来像这样：

```
application
|____api
| |____helloworld
| | |____v1
| | |____errors
|____cmd
| |____helloworld
|____configs
|____internal
| |____conf
| |____data
| |____biz
| |____service
| |____server
|____test
|____pkg
|____go.mod
|____go.sum
|____LICENSE
|____README.md
```

### 应用类型

微服务中的 app 服务类型主要分为5类：interface、service、job、admin、task，应用 cmd 目录负责程序的：启动、关闭、配置初始化等。

* interface: 对外的 BFF 服务，接受来自用户的请求，比如暴露了 HTTP/gRPC 接口。
* service: 对内的微服务，仅接受来自内部其他服务或者网关的请求，比如暴露了gRPC 接口只对内服务。
* admin：区别于 service，更多是面向运营测的服务，通常数据权限更高，隔离带来更好的代码级别安全。
* job: 流式任务处理的服务，上游一般依赖 message broker。
* task: 定时任务，类似 cronjob，部署到 task 托管平台中。

## 应用目录

### /cmd

本项目的主干。
每个应用程序的目录名应该与你想要的可执行文件的名称相匹配（例如，`/cmd/myapp`）。
不要在这个目录中放置太多代码。如果你认为代码可以导入并在其他项目中使用，那么它应该位于 `/pkg` 目录中。如果代码不是可重用的，或者你不希望其他人重用它，请将该代码放到 `/internal` 目录中。

### /internal

私有应用程序和库代码。这是你不希望其他人在其应用程序或库中导入代码。请注意，这个布局模式是由 Go 编译器本身执行的。有关更多细节，请参阅 Go 1.4 release notes。注意，你并不局限于顶级 `internal` 目录。在项目树的任何级别上都可以有多个内部目录。
你可以选择向 `internal` 包中添加一些额外的结构，以分隔共享和非共享的内部代码。这不是必需的(特别是对于较小的项目)，但是最好有有可视化的线索来显示预期的包的用途。你的实际应用程序代码可以放在 `/internal/app` 目录下（例如 `/internal/app/myapp`），这些应用程序共享的代码可以放在 `/internal/pkg` 目录下（例如 /internal/pkg/myprivlib）。
因为我们习惯把相关的服务，比如账号服务，内部有 rpc、job、admin 等，相关的服务整合一起后，需要区分 app。单一的服务，可以去掉 `/internal/myapp`。

### /pkg

外部应用程序可以使用的库代码（例如 `/pkg/mypubliclib`）。其他项目会导入这些库，所以在这里放东西之前要三思:-)注意，`internal` 目录是确保私有包不可导入的更好方法，因为它是由 Go 强制执行的。`/pkg` 目录仍然是一种很好的方式，可以显式地表示该目录中的代码对于其他人来说是安全使用的好方法。

> /pkg 目录内，可以参考 go 标准库的组织方式，按照功能分类。/internal/pkg 一般用于项目内的 跨多个应用的公共共享代码，但其作用域仅在单个项目工程内。  

由 Travis Jeffery  撰写的 I'll take pkg over internal 博客文章提供了 `pkg` 和 `internal` 目录的一个很好的概述，以及什么时候使用它们是有意义的。
当根目录包含大量非 Go 组件和目录时，这也是一种将 Go 代码分组到一个位置的方法，这使得运行各种 Go 工具变得更加容易组织。

## 服务应用目录

### /api

​API 协议定义目录，services.proto protobuf 文件，以及生成的 go 文件。我们通常把 api 文档直接在 proto 文件中描述。

### /configs

​配置文件模板或默认配置。

### /test

​额外的外部测试应用程序和测试数据。你可以随时根据需求构造 /test 目录。对于较大的项目，有一个数据子目录是有意义的。例如，你可以使用 /test/data 或 /test/testdata (如果你需要忽略目录中的内容)。请注意，Go 还会忽略以 “.” 或 “_” 开头的目录或文件，因此在如何命名测试数据目录方面有更大的灵活性。

## 服务内部目录

Application 目录下有 api、cmd、configs、internal、pkg 目录，目录里一般还会放置 README、CHANGELOG、OWNERS。

internal 是为了避免有同业务下有人跨目录引用了内部的 data、biz、service、server 等内部 struct。

### data

业务数据访问，包含 cache、db 等封装，实现了 biz 的 repo 接口。我们可能会把 data 与 dao 混淆在一起，data 偏重业务的含义，它所要做的是将领域对象重新拿出来，我们去掉了 DDD 的 infra 层。

### biz

业务逻辑的组装层，类似 DDD 的 domain 层，data 类似 DDD 的 repo，repo 接口在这里定义，使用依赖倒置的原则。

### service

实现了 api 定义的服务层，类似 DDD 的 application 层，处理 DTO 到 biz 领域实体的转换（DTO -> DO），同时协同各类 biz 交互，但是不应处理复杂逻辑。

### server

为http和grpc实例的创建和配置，以及注册对应的 service 。

## 不建议的目录

### ~~src/~~

  src 目录在 java 开发语言的项目中是一个常用的模式，但是在 go 开发项目中，尽量不要使用 src 目录。

### ~~model/~~

在其他语言开发中一个非常通用的模块叫 model，把所有类型都放在 model 里。但是在 go 里不建议的，因为 go 的包设计是根据功能职责划分的。比如一个 User 模型，应该声明在他被用的功能模块里。

### ~~xxs/~~

带复数的目录或包。虽然 go 源码中有 strings 包，但更多都是用单数形式。

## 总结

在实际 go 项目开发中，一定要灵活运用，当然也可以完全不按照这样架构分层、包设计的规则，一切以项目的大小、业务的复杂度、个人专业技能认知的广度和深度、时间的紧迫度为准。

并且，一定要按实际情况，选择合适自己团队的 Kit 基础库，进行充分的调研以及是否可满足插件定制化，需要维护好属于团队的 Kit 基础库 和 代码规范 ，带动开发者进行积极参与贡献。

如果大家有更好的架构设计理念，欢迎到 go-kratos 社区进行探讨，希望这篇文章对您有帮助~

## 参考文献

* [Package Oriented Design](https://www.ardanlabs.com/blog/2017/02/package-oriented-design.html)
* [Layered Application Guidelines](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/ee658109(v=pandp.10))
* [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
* [Go 面向包的设计和架构分层](https://github.com/danceyoung/paper-code/blob/master/package-oriented-design/packageorienteddesign.md)
* [Go 进阶训练营 - 极客时间](https://u.geekbang.org/subject/go)
