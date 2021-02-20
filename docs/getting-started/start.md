---
id: start
title: 快速开始
---

## 版本需求
需要使用 kratos v2.0.0 以上版本；

## 环境准备
需要安装好对应的依赖环境，以及工具：
- [go](https://golang.org/dl/)
- [protoc](https://github.com/protocolbuffers/protobuf)
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)

建议开启GO111MODULE
```bash
go env -w GO111MODULE=on
```

如果拉取依赖遇到网络问题，建议[配置GOPROXY](https://goproxy.cn/)

## 安装

```bash
# 安装 kratos 命令工具
go get -u github.com/go-kratos/kratos/cmd/kratos/v2
```
## 创建项目
```bash
# 创建项目模板
kratos new helloworld

cd helloworld
# 生成proto模板
kratos proto add api/helloworld/helloworld.proto
# 生成service模板
kratos proto service api/helloworld/helloworld.proto -t internal/service
```
## 项目编译和运行
```bash
# 初始化依赖工具
make init
# 生成api下所有proto文件
make proto
# 编译cmd下所有main文件
make build
# 进行单元测试
make test

# 运行项目
./bin/helloworld -conf ./configs
```

## 项目模板
Kratos 是通过在线 github 仓库模板，并且进行拉取创建项目，对应模板地址：

* [Kratos Layout](https://github.com/go-kratos/kratos-layout)
