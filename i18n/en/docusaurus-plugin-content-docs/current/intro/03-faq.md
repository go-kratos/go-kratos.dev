---
id: faq
title: FAQ
description: Kratos FAQ
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

### 1. `google/protobuf/descriptor.proto: File not found.` error while using `kratos proto` command.
This issue is mainly caused by the improperly installation of protoc. The documentation [protoc-installation](https://grpc.io/docs/protoc-installation/) shows the correct way to install protoc. It is highly recommended that install protoc by system package manager to ensure the installation's integrity. If you have to install the pre-compiled version, please refer to the `readme.txt` in the zip file, make sure all the files under `include` folder could be put to correct include path of your system, e.g. `/usr/local/include/`, so that protoc can find them while compiling.


### 2. IDE中import "google/api/annotations.proto";等proto文件有错误提示（被画波浪线）
IDE中的这个提示不会影响项目的正常编译，如果您需要解决这个报错，请将项目中的thrid_party目录加入Protobuf的custom include paths下。请参照如下文档操作：
* [GoLand](https://github.com/ksprojects/protobuf-jetbrains-plugin#configuration) 
* [VSCode](https://github.com/zxh0/vscode-proto3#extension-settings)

### 3. Develop with goland

All you need to do is configurate some setting like this:
<img src="/images/goland.png" width="650px" />

### 4. The code newly generated after the new release is unavailable, with system alarming errors.

You can try to follow this:
1. kratos upgrade
2. Modify the version of kratos in `go.mod` file
3. go generate ./...

### 5. After invoke `kratos client`, there are no deserved http file.

You can run `make http` or `kratos client xxx --go-http_opt=omitempty=false`

### 6. It show `Command not found: kratos` after installed Kratos

Make sure the env value `PATH` contain `GOBIN` directory. Or you can invoke `kratos` inside `GOBIN` directory.

### 7. proto 中引入了一些其他 proto 文件，生成代码时提示 not found

可以把缺失的文件放到项目的 third_party 中，或者定制 Makefile 将 proto 文件所在位置 添加到构建命令中

### 8. 使用 validate 生成参数校验代码时，工具生成的代码全部都是 `// no validation rules for xxxx` 但是已经配置了 校验规则
```
git clone github.com/envoyproxy/protoc-gen-validate
cd protoc-gen-validate
make build
```

### 9. Custom Http return value

You can write a custom ResponseEncoder and set to http.Server() by using http.ResponseEncoder()