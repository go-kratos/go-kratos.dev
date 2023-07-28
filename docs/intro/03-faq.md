---
id: faq
title: 常见问题
description: Kratos FAQ 使用文档
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

### 1、在使用`kratos proto`命令时报`google/protobuf/descriptor.proto: File not found.`的错误

通常是因为您的protoc工具没有正确安装导致的。具体安装方式可以参考文档[protoc-installation](https://grpc.io/docs/protoc-installation/)

请尽量采用包管理器方式进行安装，以确保安装的完整性。

如果您一定要自行下载zip包安装预编译的版本或自行编译安装，请参考zip包中`readme.txt`文件的说明进行操作，确保`include`下的所有东西（通常是`google`目录，里面是一系列`.proto`后缀的文件）都已经正确放置在您的include路径下，如`/usr/local/include/`目录中，以确保protoc在编译过程中能成功找到。

### 2、IDE中import "google/api/annotations.proto";等proto文件有错误提示（被画波浪线）

IDE中的这个提示不会影响项目的正常编译，如果您需要解决这个报错，请将项目中的thrid_party目录加入Protobuf的custom include paths下。请参照如下文档操作：

* [GoLand](https://github.com/ksprojects/protobuf-jetbrains-plugin#configuration)
* GoLand(新)
<img src='/images/goland-protobuf.png' width="650px" />
* [VSCode](https://github.com/zxh0/vscode-proto3#extension-settings)

### 3、如何使用 goland 进行开发

在 goland 中，可以添加构建配置如下图
<img src="/images/goland.png" width="650px" />

### 4、新版本发布后重新生成代码，发现无法运行，生成出来的代码有报错

可以尝试以下步骤

1. kratos upgrade
2. 修改 go.mod 中的 kratos 依赖版本
3. go generate ./...

### 5、使用 `kratos client .` 后发现 http 没有被生成

* 可以使用 make http
* 可以 kratos proto client xxx -- --go-http_opt=omitempty=false

### 6、安装 kratos 工具后使用时终端提示 command not found: kratos

环境变量没有配置，可以把 GOBIN 目录配置到环境变量中即可，或者在 GOBIN 目录下使用 kratos 工具

### 7、proto 中引入了一些其他 proto 文件，生成代码时提示 not found

可以把缺失的文件放到项目的 third_party 中，或者定制 Makefile 将 proto 文件所在位置 添加到构建命令中

### 8、使用 validate 生成参数校验代码时，工具生成的代码全部都是 `// no validation rules for xxxx` 但是已经配置了 校验规则

1. git clone git@github.com:envoyproxy/protoc-gen-validate.git
2. cd protoc-gen-validate
3. make build

### 9、如何控制 http 的返回值

可以覆盖默认的 DefaultResponseEncoder, 通过 http.ResponseEncoder() 配置，注入到 http.Server() 中

### 10、如何控制 http 返回的字段0值忽略字段和使用proto的message字段作为http的返回字段

可以在http服务的main.go中引入

```go
import (
  "github.com/go-kratos/kratos/v2/encoding/json"
  "google.golang.org/protobuf/encoding/protojson"
)
```

在init方法中设置json.MarshalOptions

```go
func init() {
 flag.StringVar(&flagconf, "conf", "../../configs", "config path, eg: -conf config.yaml")
 //增加这段代码
 json.MarshalOptions = protojson.MarshalOptions{
  EmitUnpopulated: true, //默认值不忽略
  UseProtoNames:   true, //使用proto name返回http字段
 }
}
```

### 11、控制 http 返回 enum（枚举类型）的名称和数字

可以在http服务的main.go中引入

```go
import (
  "github.com/go-kratos/kratos/v2/encoding/json"
  "google.golang.org/protobuf/encoding/protojson"
)
```

在init方法中设置json.MarshalOptions

```go
func init() {
 ...
 //增加这段代码
 json.MarshalOptions = protojson.MarshalOptions{
  UseEnumNumbers: true, // 将枚举值作为数字发出，默认为枚举值的字符串
 }
}
```

更多控制 http 返回内容，请参考文档：https://pkg.go.dev/google.golang.org/protobuf@v1.30.0/encoding/protojson#MarshalOptions
