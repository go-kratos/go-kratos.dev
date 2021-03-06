---
id: errors
title: Errors
---

APIs 错误码可以统一通过 proto 定义业务原因，然后通过 protoc-gen-go-errors 生成判定代码。

在errors包中，错误信息通过 proto 定义，并且实现对应的 Error 接口，并且可以直接通过 middleware 转换成 gRPC 错误码。
```protobuf
message Status {
  // 错误码，跟 grpc-status 一致，并且在HTTP中可映射成 http-status
  int32 code = 1;
  // 错误原因，定义为业务判定错误码
  string reason = 2;
  // 错误信息，为用户可读的信息，可作为用户提示内容
  string message = 3;
  // 错误详细信息，可以附加自定义的信息列表
  repeated google.protobuf.Any details = 4;
}
```

### 安装工具
```bash
go get github.com/go-kratos/kratos/cmd/protoc-gen-go-errors@latest
```

### 错误定义

api/helloworld/errors/helloworld.proto

```protobuf
syntax = "proto3";

package api.helloworld.errors;

import "kratos/api/annotations.proto";

// 多语言特定包名，用于源代码引用
option go_package = "api/helloworld/errors;errors";
option java_multiple_files = true;
option java_package = "helloworld.errors";
option objc_class_prefix = "APIHelloworldErrors";

enum Helloworld {
    option (kratos.api.errors) = true;

    MissingName = 0;
}
```

### 错误生成

通过 proto 生成对应的代码：

```bash
make proto
```
生成的源码，可以直接通过 `errors.IsMissingName(err)` 进行对应的错误判定:
```go
const (
	Errors_MissingName = "Helloworld_MissingName"
)

func IsMissingName(err error) bool {
	return errors.Reason(err) == Errors_MissingName
}
```

### 使用方式
```go
import "github.com/go-kratos/kratos/errors"
import apierr "app/api/errors"

func doSomething() error {
	return errrors.InvalidArgument("reason", "message")
}

if err := doSomething(); apierr.IsMissingName(err) {
	// TODO
}
```
