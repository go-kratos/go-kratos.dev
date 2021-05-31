---
id: openapi
title: OpenAPI/Swagger使用
description: OpenAPI/Swagger使用
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
框架可通过两种方式提供OpenAPI/Swagger的使用：1. 在服务上提供swagger接口，2. 使用protoc插件生成swagger.json文件。下面介绍这两种方式。

## 方式1: 使用插件提供swagger接口
[swagger-api](https://github.com/go-kratos/swagger-api)插件提供了一系列swagger相关的API，以及相应的UI界面

### 安装
首先安装插件
```bash
go get -u github.com/go-kratos/swagger-api
```

然后在`internal/server/http.go`的NewHTTPServer中进行初始化和注册，请尽量将这个路由注册放在最前面，以免匹配不到。
```go
import	"github.com/go-kratos/swagger-api/openapiv2"

openAPIhandler := openapiv2.NewHandler()
srv.HandlePrefix("/q/", openAPIhandler)
```
### 使用
浏览器中访问服务的`/q/swagger-ui`路径即可打开Swagger UI

## 方式2: 使用protoc插件生成swagger.json文件
新建项目Makefile中已经默认集成了生成swagger.json的相关命令，这里也介绍下具体的使用方式

### 安装
首先安装protoc插件
```bash
go get -u github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2
```

### 生成
（推荐）在项目根目录下执行下列命令生成：
```bash
make swagger
```

或在项目根目录直接使用protoc命令，请注意修改命令最后的proto文件路径为实际路径
```bash
protoc --proto_path=. \
        --proto_path=./third_party \
        --openapiv2_out . \
        --openapiv2_opt logtostderr=true \
        --openapiv2_opt json_names_for_fields=false \
        api/helloworld/v1/greeter.proto
```

### 使用
上面的命令执行成功后，将在您的proto文件所在目录生成相应的swagger.json文件。
您可以将其导入任何支持OpenAPI规范的平台进行浏览，例如:
* [Swagger UI](https://github.com/swagger-api/swagger-ui)
* [Swagger Editor](https://editor.swagger.io/)
* [ReDoc](https://github.com/Redocly/redoc)
* [YApi](https://github.com/YMFE/yapi)
* [Postman](https://www.postman.com/)
