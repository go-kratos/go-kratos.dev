---
id: usage
title: Usage
---

## Installation

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```

## Tool Usage

### Version
To show the version
```bash
kratos -v
```
Output:
```
kratos version v2.0.0
```

## Project Creation
To create a new project:
```bash
kratos new helloworld
```
Output:
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

## Adding Proto files
```bash
kratos proto add api/helloworld/demo.proto
```
Output:

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

## Generate Proto Codes
```bash
kratos proto client api/helloworld/demo.proto
```
Output:
```bash
api/helloworld/demo.pb.go
api/helloworld/demo_grpc.pb.go
api/helloworld/demo_http.pb.go
```

## Generate Service Codes
kratos can generate the bootstrap codes from the proto file.
```bash
kratos proto server api/helloworld/demo.proto -t internal/service
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
