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

### `google/protobuf/descriptor.proto: File not found.` error while using `kratos proto` command.
This issue is mainly caused by the improperly installation of protoc. The documentation [protoc-installation](https://grpc.io/docs/protoc-installation/) shows the correct way to install protoc. It is highly recommended that install protoc by system package manager to ensure the installation's integrity. If you have to install the pre-compiled version, please refer to the `readme.txt` in the zip file, make sure all the files under `include` folder could be put to correct include path of your system, e.g. `/usr/local/include/`, so that protoc can find them while compiling.


### IDE中import "google/api/annotations.proto";等proto文件有错误提示（被画波浪线）
IDE中的这个提示不会影响项目的正常编译，如果您需要解决这个报错，请将项目中的thrid_party目录加入Protobuf的custom include paths下。请参照如下文档操作：
* [GoLand](https://github.com/ksprojects/protobuf-jetbrains-plugin#configuration) 
* [VSCode](https://github.com/zxh0/vscode-proto3#extension-settings)

### 如何使用 goland 进行开发

在 goland 中，可以添加构建配置如下图
<img src="/images/goland.png" width="650px" />

### 新版本发布后重新生成代码，发现无法运行，生成出来的代码有报错

可以尝试以下步骤
1. kratos upgrade
2. 修改 go.mod 中的 kratos 依赖版本
3. go generate ./...

### 使用 `kratos client .` 后发现 http 没有被生成

- 可以使用 make http
- 可以 kratos client xxx --go-http_opt=omitempty=false

### 安装 kratos 工具后使用时终端提示 command not found: kratos

环境变量没有配置，可以吧 go bin 目录配置到环境变量中即可，或者在 bin 目录下使用 kratos 工具

### proto 中引入了一些其他 proto 文件，生成代码时提示 not found

可以把缺失的文件放到项目的 third_party 中，或者定制 Makefile 将 proto 文件所在位置 添加到构建命令中

### 使用 validate 生成参数校验代码时，工具生成的代码全部都是 `// no validation rules for xxxx` 但是已经配置了 校验规则
```
git clone github.com/envoyproxy/protoc-gen-validate
cd protoc-gen-validate
make build
```