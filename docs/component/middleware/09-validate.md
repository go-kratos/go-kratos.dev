---
id: validate
title: 参数校验
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

Validate 中间件使用 proto-gen-validate 生成后的代码进行参数校验，我们可以通过在 proto 中编写参数校验规则，然后生成代码，通过中间件自动的进行校验。

### 安装工具

在使用 validate 之前首先需要安装 [proto-gen-validate](https://github.com/envoyproxy/protoc-gen-validate)。
```bash
go get -d github.com/envoyproxy/protoc-gen-validate
```

如果使用中遇到无法使用或者生成的代码中 包含 `// no validation rules for xxxx`

可以尝试 `git clone github.com/envoyproxy/protoc-gen-validate` 然后 `make build`

### 规则示例
下面为大家列举几种常用类型的参数校验示例，更多的示例可以在 [proto-gen-validate](https://github.com/envoyproxy/protoc-gen-validate) 文档中查看。

### 数字类型

```protobuf
// 参数必须大于 0
int64 id = 1 [(validate.rules).int64 = {gt: 0}];
// 参数必须在 0 到 120 之间
int32 age = 2 [(validate.rules).int64 = {gt:0, lte: 120}];
// 参数是 1 或 2 或 3
uint32 code = 3 [(validate.rules).uint32 = {in: [1,2,3]}];
// 参数不能是 0 或 99.99
float score = 1 [(validate.rules).float = {not_in: [0, 99.99]}];
```

#### 布尔类型
```protobuf
// 参数必须为 true
bool state = 5 [(validate.rules).bool.const = true];
// 参数必须为 false
bool state = 5 [(validate.rules).bool.const = false];
```

#### 文本类型
```protobuf
// 参数必须为 /hello
string path = 6 [(validate.rules).string.const = "/hello"];
// 参数文本长度必须为 11
string phone = 7 [(validate.rules).string.len = 11];
// 参数文本长度不能小于 10 个字符
string explain = 8 [(validate.rules).string.min_len =  10];
// 参数文本长度不能小于 1 个字符并且不能大于 10 个字符
string name = 9 [(validate.rules).string = {min_len: 1, max_len: 10}];
// 参数文本使用正则匹配,匹配必须是非空的不区分大小写的十六进制字符串
string card = 10 [(validate.rules).string.pattern = "(?i)^[0-9a-f]+$"];
// 参数文本必须是 email 格式
string email = 11 [(validate.rules).string.email = true];
```

#### 消息体
```protobuf
// 参数为必填项
Info info = 11 [(validate.rules).message.required = true];
message Info {
    string address = 1;
}
```

### 生成代码
可以使用 kratos layout 提供的 Makefile 中的 `make api` 命令生成所有 protobuf 代码，也可以直接使用 `protoc`。
```bash
make api
# 或者
protoc --proto_path=. \
           --proto_path=./third_party \
           --go_out=paths=source_relative:. \
           --validate_out=paths=source_relative,lang=go:. \
           xxxx.proto
```
### 搭配中间件使用
我们可以将 validate 中间件注入到 http 或者 grpc 中，在有请求进入时 validate 中间件会自动对参数根据 proto 中编写的规则进行校验。
#### http
```go
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		validate.Validator(),
	))
```
#### grpc
```go
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		validate.Validator(),
	))
```

### References

* https://github.com/go-kratos/kratos/tree/main/examples/validate
