---
id: errors
title: Errors
description: Kratos APIs 错误码可以统一通过 proto 定义业务原因，然后通过 protoc-gen-go 生成枚举定义。
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

APIs 错误码可以统一通过 proto 定义业务原因，然后通过 protoc-gen-go 生成枚举定义。

在errors包中，错误模型主要跟 gRPC 状态码一致，并且 Error 实现了 GRPCStatus() 接口，业务原因通过 ErrorInfo 返回：
```json
{
    // 错误码，跟 grpc-status 一致，并且在HTTP中可映射成 http-status
    "code": 3,
    // 错误原因，定义为业务判定错误码
    "reason": "custom_error",
    // 错误信息，为用户可读的信息，可作为用户提示内容
    "message": "invalid argument error",
    // 错误元信息，为错误添加附加可扩展信息
    "metadata": {}
}
```

### 安装工具
```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go
```

### 错误定义

api/helloworld/v1/helloworld.proto

```protobuf
syntax = "proto3";

package api.helloworld.v1;

// 多语言特定包名，用于源代码引用
option go_package = "api/helloworld/v1;v1";
option java_multiple_files = true;
option java_package = "helloworld.v1";
option objc_class_prefix = "APIHelloworldV1";

enum ErrorReason {
  // Do not use this default value.
  ERROR_REASON_UNSPECIFIED = 0;
  // The request is calling a disabled service for a consumer.
  SERVICE_DISABLED = 1;
}
```

### 错误生成

通过 proto 生成对应的代码：

```bash
protoc --go_out=. --go_opt=paths=source_relative api/helloworld/v1/error_reason.proto
```

### 使用方式
```go
import "github.com/go-kratos/kratos/errors"
import "<app>/api/helloworld/v1"

func doSomething() error {
	return errors.BadRequest(v1.SERVICE_DISABLED.String(), "service has been disabled")
}

if err := doSomething(); errors.IsBadRequest(err) {
	// TODO
}

if err := doSomething(); errors.Reason(err) == v1.SERVICE_DISABLED.String() {
	// TODO
}
```
