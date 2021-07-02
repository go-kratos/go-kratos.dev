---
id: openapi
title: OpenAPI Swagger
description: OpenAPI Swagger
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

### 方式1: 使用插件提供swagger接口
[swagger-api](https://github.com/go-kratos/swagger-api)插件提供了一系列swagger相关的API，以及相应的UI界面

#### 安装
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
#### 使用
Open `/q/swagger-ui/` in Web Browser in order to access Swagger UI

### 方式2: 使用protoc插件生成swagger.json文件
新建项目Makefile中已经默认集成了生成swagger.json的相关命令，这里也介绍下具体的使用方式

#### Installation
First, install the protoc plug-in
```bash
go get -u github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2
```

#### Generation
(Recommended) run the following command at the root of the project for generation:
```bash
make swagger
```

Or use the protoc command directly at the root of the project, note that modifying the final proto file path of the command is the actual path
```bash
protoc --proto_path=. \
        --proto_path=./third_party \
        --openapiv2_out . \
        --openapiv2_opt logtostderr=true \
        --openapiv2_opt json_names_for_fields=false \
        api/helloworld/v1/greeter.proto
```

#### Usage
Once the above command has been executed successfully, the corresponding swagger.json file will be generated in the directory where your proto file is located.
You can import it into any platform that supports the Open API specification for browsing, such as:
* [Swagger UI](https://github.com/swagger-api/swagger-ui)
* [Swagger Editor](https://editor.swagger.io/)
* [ReDoc](https://github.com/Redocly/redoc)
* [YApi](https://github.com/YMFE/yapi)
* [Postman](https://www.postman.com/)
