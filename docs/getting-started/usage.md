---
id: usage
title: 工具介绍
---

## 安装

```bash
go get -u github.com/go-kratos/kratos/cmd/kratos/v2
```

## 工具使用

### 版本
查看工具版本：
```bash
kratos -v
```
输出:
```
kratos version v2.0.0
```

## 创建项目
通过 kratos 命令创建项目模板：
```bash
kratos new helloworld
```
输出:
```bash
helloworld
|____api
| |____helloworld
| | |____v1
| | | |____helloworld_grpc.pb.go
| | | |____helloworld.proto
| | | |____helloworld.pb.go
| | | |____helloworld_http.pb.go
| | |____errors
| | | |____helloworld_errors.pb.go
| | | |____helloworld.proto
| | | |____helloworld.pb.go
|____cmd
| |____helloworld
| | |____main.go
|____internal
| |____biz
| | |____README.md
| |____service
| | |____README.md
| | |____greeter.go
| |____data
| | |____README.md
|____README.md
|____Makefile
|____LICENSE
|____go.mod
|____go.sum
```

## 添加 Proto 文件
```bash
kratos proto add api/helloworld/demo.proto
```
输出:

api/helloworld/demo.proto

```protobuf
syntax = "proto3";

package api.helloworld;

option go_package = "helloworld/api/api/helloworld;helloworld";
option java_multiple_files = true;
option java_package = "api.helloworld";

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

## 生成 Proto 代码
可以通过 make proto 直接生成，或者：
```bash
kratos proto source api/helloworld/demo.proto
// 或者
make proto
```
输出:
```bash
api/helloworld/demo.pb.go
api/helloworld/demo_grpc.pb.go
api/helloworld/demo_http.pb.go
```

## 生成 Service 代码

通过 proto文件，可以直接生成对应的 Service 实现代码：
```bash
kratos proto service api/helloworld/demo.proto -t internal/service
```
Output:
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

func NewDemoService() pb.DemoServer {
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
