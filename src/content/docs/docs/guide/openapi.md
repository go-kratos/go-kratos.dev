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
### Use protoc to generate openapi.yaml
The new project Makefile has been integrated by default with the commands associated with generating openapi.yaml, and here's how to use them

#### Installation
First, install the protoc plug-in globally.
```bash
go install github.com/google/gnostic/cmd/protoc-gen-openapi@latest
```

#### Generation
If you're using kratos-layout, execute this command directly to generate.
```bash
make api
```

Or you can use the protoc command directly at the root of the project, note that modifying the final proto file path of the command is the actual path
```bash
protoc --proto_path=. \
        --proto_path=./third_party \
        --openapi_out=fq_schema_naming=true,default_response=false:. \
        api/helloworld/v1/greeter.proto
```

#### Usage
Once the above command has been executed successfully, the corresponding openapi.yaml file will be generated in the directory where your proto file is located.
You can import it into any platform that supports the Open API specification for browsing, such as:
* [Swagger UI](https://github.com/swagger-api/swagger-ui)
* [Swagger Editor](https://editor.swagger.io/)
* [ReDoc](https://github.com/Redocly/redoc)
* [YApi](https://github.com/YMFE/yapi)
* [Postman](https://www.postman.com/)
