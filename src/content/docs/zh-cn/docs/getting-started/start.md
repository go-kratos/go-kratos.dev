---
id: start
title: 项目初始化
description: Kratos 微服务框架，快速创建项目代码，生成 Go 工程化项目
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

### 环境准备
首先，您需要安装好对应的依赖环境，以及工具：
- [go](https://golang.org/dl/)
- [protoc](https://github.com/protocolbuffers/protobuf)
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)

建议开启GO111MODULE
```bash
go env -w GO111MODULE=on
```

### kratos 命令工具

kratos 是与 Kratos 框架配套的脚手架工具，kratos 能够

- 通过模板快速创建项目
- 快速创建与生成 protoc 文件
- 使用开发过程中常用的命令
- 极大提高开发效率，减轻心智负担

详细使用请参照 [CLI工具](usage.md)

为使接下来的步骤能够顺利进行，需要 [安装 kratos 命令工具](usage.md#安装)


### 创建项目
```bash
# 使用默认模板创建项目
docs new helloworld

# 如在国内环境拉取失败, 可 -r 指定源
docs new helloworld -r https://gitee.com/go-kratos/kratos-layout.git

# 进入项目目录
cd helloworld

# 拉取项目依赖
go mod download
```
如果拉取依赖遇到网络问题，建议 [配置GOPROXY](https://goproxy.cn/)



### 代码生成与运行
#### 生成
```bash
# 安装依赖
go get github.com/google/wire/cmd/wire@latest
# 生成所有proto源码、wire等等
go generate ./...
```
#### 运行
```bash
# 运行项目
docs run

# 输出
INFO msg=config loaded: config.yaml format: yaml # 默认载入 configs/config.yaml 配置文件
INFO msg=[gRPC] server listening on: [::]:9000 # gRPC服务监听 9000 端口
INFO msg=[HTTP] server listening on: [::]:8000 # HTTP服务监听 8000 端口
```

### 测试接口
测试HTTP接口

相关逻辑代码位于 `internal/service/greeter.go`

```bash
curl 'http://127.0.0.1:8000/helloworld/kratos'
# 输出：
{
  "message": "Hello kratos"
}


curl 'http://127.0.0.1:8000/helloworld/error'
# 输出
{
    "code": 404,
    "reason": "USER_NOT_FOUND",
    "message": "user not found: error",
    "metadata": {}
}
```

### 项目模板
Kratos 通过 Git 仓库进行模板管理，创建项目时通过拉取模板进行初始化。对应模板地址：

* [【Github】Kratos Layout](https://github.com/go-kratos/kratos-layout)
* [【Gitee】Kratos Layout](https://gitee.com/go-kratos/kratos-layout.git)

⭐ 项目布局详解 [Go工程化 - Project Layout 最佳实践](/blog/go-project-layout)


### 自定义项目模板
您也可以自行创建模板，以减免每次都需要进行的繁琐工作
