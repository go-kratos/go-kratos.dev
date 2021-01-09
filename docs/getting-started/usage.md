---
id: usage
title: 工具使用
---

## 安装

```
go get github.com/go-kratos/kratos/cmd/kratos
```

## 工具使用

### 版本
查看工具版本：
```
kratos -v
```
Output:
```
kratos version v2.0.0
```

## 创建项目
通过 kratos 命令创建项目模板：
```
kratos new helloworld
```
Output:
```
Creating service helloworld
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Compressing objects: 100% (3/3), done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
```

## 添加 Proto 文件
```
kratos proto add api/helloworld/demo.proto
```
Output:

api/helloworld/demo.proto

```
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
```
kratos proto service api/helloworld/demo.proto
```
Output:
```
api/helloworld/demo.pb.go
api/helloworld/demo_grpc.pb.go
api/helloworld/demo_http.pb.go
```

## 生成 Service 代码

通过 proto文件，可以直接生成对应的 Service 实现代码：
```
kratos proto service api/helloworld/demo.proto -t internal/service
```
Output:
internal/service/demo.go

```
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
