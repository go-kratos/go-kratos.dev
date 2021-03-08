---
slug: go-project-layout
title: Go工程化 - Project Layout 最佳实践
author: Tony
author_title: Maintainer of go-kratos
author_url: https://github.com/tonybase
author_image_url: https://avatars.githubusercontent.com/u/3871120?s=460&v=4
tags: [go, golang, project layout, best practice]
---

### 介绍

这篇文章主要讲 **Go 项目工程化** 上的一些思考，以及 Kratos 在项目不同角度中的设计理念。

Go 是一个面向包名设计的语言，可以通过各个包名进行组织 *Go项目的结构*，而大家遵循规范设计准则，可以改善团队成员之间的沟通。

### 项目结构

我们相信在每个公司都应该建立一个 **Kit 基础库**，然后每个应用依赖组成微服务体系。

#### Kit 基础库

将 Kit 项目作为公司的标准库，因此应该只有一个。并且 Kit 基础库也应该具备以下这些特点：

* 简单：不过度设计，代码平实简单；
* 通用：通用业务开发所需要的基础库的功能；
* 高效：提高业务迭代的效率；
* 稳定：基础库可测试性高，覆盖率高，有线上实践安全可靠；
* 健壮：通过良好的基础库设计，减少错用；
* 高性能：性能高，但不特定为了性能做hack优化，约会unsafe；
* 扩展性：良好的接口设计，来扩展实现，或者通过添加基础库目录来扩展功能；
* 容错性：为失败设计，大量约会对SRE的理解，鲁棒性高；
* 工具链：包含大量工具链，可以生成辅助代码，lint工具等等；

以 *Kratos* 为例子，一个典型的 Kit 基础库 可能看起来像这样：

```
github.com/go-kratos/kratos
├── cmd
├── docs
├── internal
├── examples
├── api
├── errors
├── config
├── log
├── metrics
├── registry
├── middleware
├── transport
├── third_party
├── app.go
├── options.go
├── go.mod
```

> 注意：为了保证 Kit 基础库的可移植性，尽可能进行接口抽象，并且 go.mod 依赖第三方库也尽可能简单，然后再通过 plugins 进行扩展基础库，以满足不同的业务需求定制化。

### 应用项目

应用项目包含着一些应用模块，然后应用模块之间可以通过 cmd/main.go 进行初始化。

```
application
|____api
| |____helloworld
| | |____v1
| | | |____greeter_http.pb.go
| | | |____greeter.pb.go
| | | |____greeter.proto
| | | |____greeter_grpc.pb.go
| | |____errors
| | | |____helloworld_errors.pb.go
| | | |____helloworld.proto
| | | |____helloworld.pb.go
|____cmd
| |____helloworld
| | |____wire_gen.go
| | |____wire.go
| | |____main.go
|____configs
| |____config.yaml
|____internal
| |____conf
| | |____conf.proto
| | |____conf.pb.go
| |____data
| | |____data.go
| | |____greeter.go
| |____biz
| | |____greeter.go
| | |____biz.go
| |____service
| | |____service.go
| | |____greeter.go
| |____server
| | |____server.go
| | |____grpc.go
| | |____http.go
|____pkg
|____go.sum
|____go.mod
|____LICENSE
|____README.md
```

