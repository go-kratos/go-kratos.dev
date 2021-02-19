---
id: errors
title: Errors
---

APIs 错误码可以统一通过 proto 定义，然后通过 protoc-gen-go-errors 生成判定代码。

### 安装
```bash
go get github.com/go-kratos/kratos/cmd/protoc-gen-go-errors
```

### Errors 定义

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

### Errors 生成

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

### Errors 使用
```
import "github.com/go-kratos/kratos/errors"
import apierr "app/api/errors"

func doSomething() error {
	return errrors.InvalidArgument("reason", "message")
}

if err := doSomething(); apierr.IsMissingName(err) {
	// DOTO
}
```
