---
id: layout-intro
title: Kratos Layout介绍
---
我们[kratos-layout](https://github.com/go-kratos/kratos-layout)作为创建项目时所使用结构，其中包括了开发过程中所需的配套生成脚本(Makefile)等，便于开发者更高效地维护整个项目，本项目亦可以作为使用Kratos构建微服务的工程化最佳实践的参考。

使用如下命令即可基于kratos-layout创建项目

```
kratos new <project-name>
```

生成的目录结构如下

```
.
├── LICENSE  
├── Makefile   // make命令使用的配置文件，可以在这里新增您的自定义命令
├── README.md     
├── api   // 下面维护了微服务使用的proto文件以及根据它们所生成的go文件
│   └── helloworld
│       ├── errors
│       │   ├── helloworld.pb.go
│       │   ├── helloworld.proto
│       │   └── helloworld_errors.pb.go
│       └── v1
│           ├── greeter.pb.go
│           ├── greeter.proto
│           ├── greeter_grpc.pb.go
│           └── greeter_http.pb.go
├── cmd  //整个项目启动的入口文件
│   └── server
│       ├── main.go
│       ├── wire.go  //我们使用wire来维护依赖注入
│       └── wire_gen.go
├── configs  // 这里通常维护一些本地调试用的样例配置文件
│   └── config.yaml
├── go.mod           
├── go.sum
└── internal  // 该服务所有不对外暴露的代码，通常的业务逻辑都在这下面，使用internal避免错误引用
    ├── biz  // 业务逻辑的组装层，类似 DDD 的 domain 层，data 类似 DDD 的 repo，repo 接口在这里定义，使用依赖倒置的原则。
    │   ├── README.md
    │   ├── biz.go
    │   └── greeter.go
    ├── conf  // 内部使用的config的结构定义，使用proto格式生成
    │   ├── conf.pb.go
    │   └── conf.proto
    ├── data  // 业务数据访问，包含 cache、db 等封装，实现了 biz 的 repo 接口。我们可能会把 data 与 dao 混淆在一起，data 偏重业务的含义，它所要做的是将领域对象重新拿出来，我们去掉了 DDD 的 infra层。
    │   ├── README.md
    │   ├── data.go
    │   └── greeter.go
    ├── server  // http和grpc实例的创建和配置
    │   ├── grpc.go
    │   ├── http.go
    │   └── server.go
    └── service  // 实现了 api 定义的服务层，类似 DDD 的 application 层，处理 DTO 到 biz 领域实体的转换(DTO -> DO)，同时协同各类 biz 交互，但是不应处理复杂逻辑
        ├── README.md
        ├── greeter.go
        └── service.go
```
