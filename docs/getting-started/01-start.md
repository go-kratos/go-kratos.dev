---
id: start
title: 创建项目
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

### 版本需求
需要使用 kratos v2.0.0 以上版本；

### 环境准备
需要安装好对应的依赖环境，以及工具：
- [go](https://golang.org/dl/)
- [protoc](https://github.com/protocolbuffers/protobuf)
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)

建议开启GO111MODULE
```bash
go env -w GO111MODULE=on
```

如果拉取依赖遇到网络问题，建议[配置GOPROXY](https://goproxy.cn/)

### 安装 kratos 命令工具

> 以下三种方式选其一

#### 1. go get 安装

```bash
go get -u github.com/go-kratos/kratos/cmd/kratos/v2@latest
```
#### 2. go install 安装
```bash
go install github.com/go-kratos/kratos/cmd/kratos/v2
# go 1.16版本以上需要指定版本号或使用最新版
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```
#### 3. 源码编译安装
```bash
git clone https://github.com/go-kratos/kratos
cd kratos
make install
```
### 创建项目
```bash
# 创建项目模板
kratos new helloworld
# 在国内拉取失败, 可 -r 指定源
kratos new helloworld -r https://gitee.com/go-kratos/kratos-layout.git

cd helloworld
# 拉取项目依赖
go mod download
```
### 项目编译和运行
```bash
# 生成所有proto源码、wire等等
go generate ./...

# 运行项目
kratos run
```

### 测试接口
```bash
curl 'http://127.0.0.1:8000/helloworld/kratos'

输出：
{
  "message": "Hello kratos"
}
```

### 项目模板
Kratos 是通过在线 github 仓库模板，并且进行拉取创建项目，对应模板地址：

* [Kratos Layout](https://github.com/go-kratos/kratos-layout)
