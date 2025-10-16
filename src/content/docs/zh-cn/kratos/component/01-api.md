---
id: api
title: API 定义
description: Kratos API 与用户的通信协议，通常是 REST API 和 RPC API 作为传输层协议，而 Kratos 主要参考 Google API 指南，实现了对应通信协议支持，并且遵守了 gRPC API 使用 HTTP 映射功能进行 JSON/HTTP 的支持
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

API 与用户的通信协议，通常是 REST API 和 RPC API 作为传输层协议，而 Kratos 主要参考 Google API 指南，实现了对应通信协议支持，并且遵守了 gRPC API 使用 HTTP 映射功能进行 JSON/HTTP 的支持。

也就是通过定义 proto 即可使用 REST API 和 RPC API，通过类似 Google API 的仓库方式进行 API Schema 的管理。

## 定义接口

通过 Protobuf IDL 定义对应的 REST API 和 gRPC API：

api/helloworld/v1/greeter.proto

```protobuf
syntax = "proto3";

package helloworld.v1;

import "google/api/annotations.proto";

option go_package = "github.com/go-kratos/service-layout/api/helloworld/v1;v1";
option java_multiple_files = true;
option java_package = "dev.kratos.api.helloworld.v1";
option java_outer_classname = "HelloWorldProtoV1";

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply)  {
    option (google.api.http) = {
        // 定义一个 GET 接口，并且把 name 映射到 HelloRequest
        get: "/helloworld/{name}",
        // 可以添加附加接口
        additional_bindings {
            // 定义一个 POST 接口，并且把 body 映射到 HelloRequest
            post: "/v1/greeter/say_hello",
            body: "*",
        }
    };
  }
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```
## 生成接口

```shell
# 生成 proto 模板
kratos proto add api/helloworld/v1/greeter.proto
# 生成 client 源码
kratos proto client api/helloworld/v1/greeter.proto
# 生成 server 源码
kratos proto server api/helloworld/v1/greeter.proto -t internal/service
```

```api
client:
|____api
| |____helloworld
| | |____v1
| | | |____greeter.pb.go
| | | |____greeter.proto
| | | |____greeter_http.pb.go
| | | |____greeter_grpc.pb.go

server:
| |____service
| | |____greeter.go
```

## 注册接口

**HTTP API** 是通过 protoc-gen-go-http 插件进行生成 http.Handler，然后可以注册到 HTTP Server 中：

```go
import "github.com/go-kratos/kratos/v2/transport/http"

greeter := &GreeterService{}
srv := http.NewServer(http.Address(":9000"))
v1.RegisterGreeterHTTPServer(srv, greeter)
```

**gRPC API** 是通过 protoc-gen-go-grpc 插件进行生成 gRPC Register，然后可以注册到 GRPC Server 中；

```go
import "github.com/go-kratos/kratos/v2/transport/grpc"

greeter := &GreeterService{}
srv := grpc.NewServer(grpc.Address(":9000"))
v1.RegisterGreeterServer(srv, greeter)
```



## References

- https://cloud.google.com/apis/design
- https://cloud.google.com/endpoints/docs/grpc/transcoding
- https://github.com/googleapis/googleapis
- https://go-kratos.dev/docs/guide/api-protobuf/
- https://developers.google.com/protocol-buffers/docs/style
- https://developers.google.com/protocol-buffers/docs/proto3
- https://colobu.com/2017/03/16/Protobuf3-language-guide/
