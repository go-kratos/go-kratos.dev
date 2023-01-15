---
id: usage
title: CLI工具
description: Kratos 工具使用，创建 Protobuf 模板，创建 Go 工程项目，创建 Service 模板
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

### 安装

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```

### 创建项目
通过 kratos 命令创建项目模板：

```bash
kratos new helloworld
```

使用 `-r` 指定源

```bash
# 国内拉取失败可使用gitee源
kratos new helloworld -r https://gitee.com/go-kratos/kratos-layout.git
# 亦可使用自定义的模板
kratos new helloworld -r xxx-layout.git
# 同时也可以通过环境变量指定源
KRATOS_LAYOUT_REPO=xxx-layout.git
kratos new helloworld
```

使用 `-b` 指定分支

```bash
kratos new helloworld -b main
```

使用 `--nomod` 添加服务，共用 `go.mod` ，大仓模式

```bash
kratos new helloworld
cd helloworld
kratos new app/user --nomod
```

输出:

```bash
.
├── Dockerfile
├── LICENSE
├── Makefile
├── README.md
├── api
│   └── helloworld
│       └── v1
│           ├── error_reason.pb.go
│           ├── error_reason.proto
│           ├── greeter.pb.go
│           ├── greeter.proto
│           ├── greeter_grpc.pb.go
│           └── greeter_http.pb.go
├── app
│   └── user
│       ├── Dockerfile
│       ├── Makefile
│       ├── cmd
│       │   └── user
│       │       ├── main.go
│       │       ├── wire.go
│       │       └── wire_gen.go
│       ├── configs
│       │   └── config.yaml
│       ├── internal
│       │   ├── biz
│       │   │   ├── biz.go
│       │   │   └── greeter.go
│       │   ├── conf
│       │   │   ├── conf.pb.go
│       │   │   └── conf.proto
│       │   ├── data
│       │   │   ├── data.go
│       │   │   └── greeter.go
│       │   ├── server
│       │   │   ├── grpc.go
│       │   │   ├── http.go
│       │   │   └── server.go
│       │   └── service
│       │       ├── greeter.go
│       │       └── service.go
│       └── openapi.yaml
├── cmd
│   └── helloworld
│       ├── main.go
│       ├── wire.go
│       └── wire_gen.go
├── configs
│   └── config.yaml
├── go.mod
├── go.sum
├── internal
│   ├── biz
│   │   ├── README.md
│   │   ├── biz.go
│   │   └── greeter.go
│   ├── conf
│   │   ├── conf.pb.go
│   │   └── conf.proto
│   ├── data
│   │   ├── README.md
│   │   ├── data.go
│   │   └── greeter.go
│   ├── server
│   │   ├── grpc.go
│   │   ├── http.go
│   │   └── server.go
│   └── service
│       ├── README.md
│       ├── greeter.go
│       └── service.go
├── openapi.yaml
└── third_party
    ├── README.md
    ├── errors
    │   └── errors.proto
    ├── google
    │   ├── api
    │   │   ├── annotations.proto
    │   │   ├── client.proto
    │   │   ├── field_behavior.proto
    │   │   ├── http.proto
    │   │   └── httpbody.proto
    │   └── protobuf
    │       └── descriptor.proto
    └── validate
        ├── README.md
        └── validate.proto
```

### 添加 Proto 文件
> kratos-layout 项目中对 proto 文件进行了版本划分，放在了 v1 子目录下

```bash
kratos proto add api/helloworld/v1/demo.proto
```

输出:

api/helloworld/v1/demo.proto

```protobuf
syntax = "proto3";

package api.helloworld.v1;

option go_package = "helloworld/api/helloworld/v1;v1";
option java_multiple_files = true;
option java_package = "api.helloworld.v1";

service Demo {
	rpc CreateDemo (CreateDemoRequest) returns (CreateDemoReply);
	rpc UpdateDemo (UpdateDemoRequest) returns (UpdateDemoReply);
	rpc DeleteDemo (DeleteDemoRequest) returns (DeleteDemoReply);
	rpc GetDemo (GetDemoRequest) returns (GetDemoReply);
	rpc ListDemo (ListDemoRequest) returns (ListDemoReply);
}

message CreateDemoRequest {}
message CreateDemoReply {}

message UpdateDemoRequest {}
message UpdateDemoReply {}

message DeleteDemoRequest {}
message DeleteDemoReply {}

message GetDemoRequest {}
message GetDemoReply {}

message ListDemoRequest {}
message ListDemoReply {}
```

### 生成 Proto 代码
```bash
# 可以直接通过 make 命令生成
make api

# 或使用 kratos cli 进行生成
kratos proto client api/helloworld/v1/demo.proto
```
会在proto文件同目录下生成:
```bash
api/helloworld/v1/demo.pb.go
api/helloworld/v1/demo_grpc.pb.go
# 注意 http 代码只会在 proto 文件中声明了 http 时才会生成
api/helloworld/v1/demo_http.pb.go
```

### 生成 Service 代码

通过 proto 文件，可以直接生成对应的 Service 实现代码：

使用 `-t` 指定生成目录
```bash
kratos proto server api/helloworld/v1/demo.proto -t internal/service
```


输出:  
internal/service/demo.go

```go
package service

import (
	"context"

	pb "helloworld/api/helloworld"
)

type DemoService struct {
	pb.UnimplementedDemoServer
}

func NewDemoService() *DemoService {
	return &DemoService{}
}

func (s *DemoService) CreateDemo(ctx context.Context, req *pb.CreateDemoRequest) (*pb.CreateDemoReply, error) {
	return &pb.CreateDemoReply{}, nil
}
func (s *DemoService) UpdateDemo(ctx context.Context, req *pb.UpdateDemoRequest) (*pb.UpdateDemoReply, error) {
	return &pb.UpdateDemoReply{}, nil
}
func (s *DemoService) DeleteDemo(ctx context.Context, req *pb.DeleteDemoRequest) (*pb.DeleteDemoReply, error) {
	return &pb.DeleteDemoReply{}, nil
}
func (s *DemoService) GetDemo(ctx context.Context, req *pb.GetDemoRequest) (*pb.GetDemoReply, error) {
	return &pb.GetDemoReply{}, nil
}
func (s *DemoService) ListDemo(ctx context.Context, req *pb.ListDemoRequest) (*pb.ListDemoReply, error) {
	return &pb.ListDemoReply{}, nil
}
```

### 运行项目
- 如子目录下有多个项目则出现选择菜单
```bash
kratos run 
```

### 查看版本
查看工具版本：
```bash
kratos -v
```
输出:
```bash
kratos version v2.2.0
```

### 工具升级
将升级以下工具
- Kratos与工具自身
- protoc相关的生成插件
```bash
kratos upgrade
```

### 更新日志
```bash
# 等同于打印 https://github.com/go-kratos/kratos/releases/latest 的版本更新日志
kratos changelog

# 打印指定版本更新日志
kratos changelog v2.1.4

# 查看自上次版本发布后的更新日志
kratos changelog dev
```

### 查看帮助
任何命令下加 ` -h ` 查看帮助
```bash
kratos -h
kratos new -h
```
