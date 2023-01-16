---
id: errors
title: 错误处理
description: Kratos API 错误码可以统一通过 proto 定义业务原因，然后通过 protoc-gen-go 生成枚举定义。
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

APIs 响应错误时可以直接使用 errors 包中的 New 方法来声明一个 error，也可以直接通过 proto 预定义定义错误码，然后通过 proto-gen-go 生成帮助代码，直接返回 error。

在errors包中，错误模型主要跟 gRPC 状态码一致，并且 Error 实现了 GRPCStatus()  接口, 实现了 grpc 和 http 错误码的转换, 业务原因通过 ErrorInfo 返回：
```json
{
    // 错误码，跟 http-status 一致，并且在 grpc 中可以转换成 grpc-status
    "code": 500,
    // 错误原因，定义为业务判定错误码
    "reason": "USER_NOT_FOUND",
    // 错误信息，为用户可读的信息，可作为用户提示内容
    "message": "invalid argument error",
    // 错误元信息，为错误添加附加可扩展信息
    "metadata": {
      "foo": "bar"
    }
}
```

### 安装工具
```bash
# 如果电脑中没有protoc-gen-go需要先安装
# go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install github.com/go-kratos/kratos/cmd/protoc-gen-go-errors/v2@latest
```

### 错误定义

api/helloworld/v1/helloworld.proto

```protobuf
syntax = "proto3";

// 定义包名
package api.kratos.v1;
import "errors/errors.proto";

// 多语言特定包名，用于源代码引用
option go_package = "kratos/api/helloworld;helloworld";
option java_multiple_files = true;
option java_package = "api.helloworld";

enum ErrorReason {
  // 设置缺省错误码
  option (errors.default_code) = 500;

  // 为某个枚举单独设置错误码
  USER_NOT_FOUND = 0 [(errors.code) = 404];

  CONTENT_MISSING = 1 [(errors.code) = 400];
}
```
注意事项:
- 当枚举组没有配置缺省错误码时, 当前枚举组的没有配置错误码的枚举值会被忽略
- 当整个枚举组都没配置错误码时，当前枚举组会被忽略
- 错误码的取值范围应该在 0 < code <= 600 之间, 超出范围将抛出异常
### 错误生成

通过 proto 生成对应的代码：

```bash
protoc --proto_path=. \
         --proto_path=./third_party \
         --go_out=paths=source_relative:. \
         --go-errors_out=paths=source_relative:. \
         $(API_PROTO_FILES)
```

或者在项目根目录使用Makefile指令
```
make errors
```

执行成功之后，会在 api/helloworld 目录下生成 helloworld_errors.pb.go 文件，代码如下：

```
package helloworld

import (
	fmt "fmt"
	errors "github.com/go-kratos/kratos/v2/errors"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the kratos package it is being compiled against.
const _ = errors.SupportPackageIsVersion1

func IsUserNotFound(err error) bool {
	if err == nil {
		return false
	}
	e := errors.FromError(err)
	return e.Reason == ErrorReason_USER_NOT_FOUND.String() && e.Code == 404
}

func ErrorUserNotFound(format string, args ...interface{}) *errors.Error {
	return errors.New(404, ErrorReason_USER_NOT_FOUND.String(), fmt.Sprintf(format, args...))
}

func IsContentMissing(err error) bool {
	if err == nil {
		return false
	}
	e := errors.FromError(err)
	return e.Reason == ErrorReason_CONTENT_MISSING.String() && e.Code == 400
}

func ErrorContentMissing(format string, args ...interface{}) *errors.Error {
	return errors.New(400, ErrorReason_CONTENT_MISSING.String(), fmt.Sprintf(format, args...))
}
```

### 使用方式

#### 响应错误
当业务逻辑中需要响应错误时，可以通过使用 kratos errors 包中的 New 方法来响应错误, 或者可以通过proto定义，然后通过 protoc-gen-go-error 工具生成帮助代码来响应错误

```go
// 通过 errors.New() 响应错误
errors.New(500, "USER_NAME_EMPTY", "user name is empty")

// 通过 proto 生成的代码响应错误，并且包名应替换为自己生成代码后的 package name
api.ErrorUserNotFound("user %s not found", "kratos")

// 传递metadata
err := errors.New(500, "USER_NAME_EMPTY", "user name is empty")
err = err.WithMetadata(map[string]string{
	"foo": "bar",
})
```
#### 错误断言
```go
// 引入 helloworld 包
import "kratos/api/helloworld"

err := wrong()

// 通过 errors.Is() 断言
if errors.Is(err,errors.BadRequest("USER_NAME_EMPTY","")) {
// do something
}

// 通过判断 *Error.Reason 和 *Error.Code
e := errors.FromError(err)
if  e.Reason == "USER_NAME_EMPTY" && e.Code == 500 {
// do something
}

// 通过 proto 生成的代码断言错误，并且包名应替换为自己生成代码后的 package name（此处对应上面生成的 helloworld 包，调用定义的方法）
if helloworld.IsUserNotFound(err) {
// do something
})
```
