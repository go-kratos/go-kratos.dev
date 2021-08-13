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
The framework provides open API/Swagger use in two ways: 1. Provide swagger interface on service, 2. Use the protoc plug-in to generate the swagger.json file. Here are two ways to do this.

### Method 1: Use plug-ins to provide the swagger API 
Plugin [swagger-api](https://github.com/go-kratos/swagger-api) provides a range of swagger-related APIs, as well as the corresponding UI interface.

#### Installation
First install this plugin.
```bash
go get -u github.com/go-kratos/swagger-api
```

Then initialize and register in newHTTPServer of `internal/server/http.go`, and try to put this route registration first to avoid match failed.

```go
import	"github.com/go-kratos/swagger-api/openapiv2"

openAPIhandler := openapiv2.NewHandler()
srv.HandlePrefix("/q/", openAPIhandler)
```
#### Usage
Open `/q/swagger-ui/` in Web Browser in order to access Swagger UI

### Method 2: Use protoc to generate swagger.json
The new project Makefile has been integrated by default with the commands associated with generating swagger.json, and here's how to use them

#### Installation
First, install the protoc plug-in
```bash
go get -u github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2
```

#### Generation
Use the protoc command directly at the root of the project, note that modifying the final proto file path of the command is the actual path
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
