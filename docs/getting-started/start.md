---
id: start
title: 快速开始
---

# 版本
需要使用 kratos v2.0.0 以上版本；
# 环境准备
需要安装好对应的依赖环境，以及工具：
- [go](https://golang.org/dl/)
- [protoc](https://github.com/protocolbuffers/protobuf)
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)

# 安装
```
# 安装 kratos 命令工具
go get github.com/go-kratos/kratos/cmd/kratos
go get github.com/go-kratos/kratos/cmd/protoc-gen-go-http
go get github.com/go-kratos/kratos/cmd/protoc-gen-go-errors

# 或者通过 Source 安装
cd cmd/kratos && go install
cd cmd/protoc-gen-go-http && go install
cd cmd/protoc-gen-go-errors && go install
```
# 创建项目
```
# 创建项目模板
kratos new helloworld

cd helloworld
# 生成proto模板
kratos proto add api/helloworld/helloworld.proto
# 生成service模板
kratos proto service api/helloworld/helloworld.proto -t internal/service
```
# 项目编译和运行
```
# 生成api下所有proto文件
make proto
# 编码cmd下所有main文件
make build
# 进行单元测试
make test

# 运行项目
./bin/helloworld
```

# 项目模板
Kratos 是通过在线 github 模板，进行创建项目模板：

* [Service Layout](https://github.com/go-kratos/service-layout)
