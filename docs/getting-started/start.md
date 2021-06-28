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

### 安装
安装 kratos 命令工具
#### go get 安装

```bash
go get -u github.com/go-kratos/kratos/cmd/kratos/v2@latest
```
#### go install 安装
```bash
go install github.com/go-kratos/kratos/cmd/kratos/v2
# go 1.16版本以上需要指定版本号或使用最新版
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```
#### 源码编译安装
```bash
git clone https://github.com/go-kratos/kratos
cd kratos
make install
```
### 创建项目
```bash
# 创建项目模板
kratos new helloworld

cd helloworld
# 拉取项目依赖
go mod download
# 生成proto模板
kratos proto add api/helloworld/helloworld.proto
# 生成proto源码
kratos proto client api/helloworld/helloworld.proto
# 生成server模板
kratos proto server api/helloworld/helloworld.proto -t internal/service
```
### 项目编译和运行
```bash
# 生成所有proto源码、wire等等
go generate ./...

# 编译成可执行文件
go build -o ./bin/ ./...

# 运行项目
./bin/helloworld -conf ./configs
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
