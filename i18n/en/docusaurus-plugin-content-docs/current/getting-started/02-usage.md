---
id: usage
title: Usage
---

## Installation

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```

## Project Creation

To create a new project:
```bash
kratos new helloworld
```

Use `-r` to specify the source

```bash
# If pull fails in China, you can use gitee source.
kratos new helloworld -r https://gitee.com/go-kratos/kratos-layout.git
# You can also use custom templates
kratos new helloworld -r xxx-layout.git
# You can also specify the source through the environment variable
KRATOS_LAYOUT_REPO=xxx-layout.git
kratos new helloworld
```

Use `-b` to specify the branch

```bash
kratos new helloworld -b main
```

Use `--nomod` to add services and working together using ` go.mod `, large warehouse mode

```bash
kratos new helloworld
cd helloworld
kratos new app/user --nomod
```

Output:

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
# Attention: The http code will only be generated if http is declared in the proto file.  
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

## Run project

- If there are multiple items under the subdirectory, the selection menu appears

```bash
kratos run
```

## View Version

To show the tool version

```bash
kratos -v
```

Output:

```
kratos version v2.2.1
```

## Tool upgrade

The following tools will be upgraded

- Kratos and the tool itself
- Protoc related build plugins

```bash
kratos upgrade
```

## Changelog

```bash
# Equivalent to printing the version changelog of https://github.com/go-kratos/kratos/releases/latest 
kratos changelog

# Print the update log of the specified version
kratos changelog v2.1.4

# View the changelog since the last release
kratos changelog dev
```

## View help

Add `-h` to any command for help

```bash
kratos -h
kratos new -h
```
