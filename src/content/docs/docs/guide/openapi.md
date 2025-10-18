---
id: openapi
title: OpenAPI Swagger 使用
description: OpenAPI Swagger 使用
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
### 使用protoc插件生成openapi.yaml文件

新建项目Makefile中已经默认集成了生成openapi.yaml的相关命令，这里也介绍下具体的使用方式

#### 安装

首先全局安装protoc插件

```bash
go install github.com/google/gnostic/cmd/protoc-gen-openapi@latest
```

#### 生成
如果是kratos-layout为模板创建出来的项目，已经集成了相应的指令，直接使用命令
```bash
make api
```
即可生成openapi.yaml文件。

或者直接调用protoc命令进行生成，在项目根目录直接使用protoc命令，请注意修改命令最后的proto文件路径为实际路径
```bash
protoc --proto_path=. \
        --proto_path=./third_party \
        --openapi_out=fq_schema_naming=true,default_response=false:. \
        api/helloworld/v1/greeter.proto
```

#### 使用

上面的命令执行成功后，将在您的proto文件所在目录生成相应的openapi.yaml文件。
您可以将其导入任何支持OpenAPI规范的平台进行浏览，例如:

* [Swagger UI](https://github.com/swagger-api/swagger-ui)
* [Swagger Editor](https://editor.swagger.io/)
* [ReDoc](https://github.com/Redocly/redoc)
* [YApi](https://github.com/YMFE/yapi)
* [Postman](https://www.postman.com/)
