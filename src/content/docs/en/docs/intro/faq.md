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


### 2. There are errors from IDE show `import "google/api/annotations.proto";` with red wavy line 
You can append `thrid_party` directory to custom protobuf`s include paths. Please follow these doc:

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

### 7. It show some proto file not found when generate pb file.
Copy the missing proto file to `third_party` directory. Or append missing proto file location to corresponding Makefile command.

### 8.There are  `// no validation rules for xxxx` for configurated property.
```
git clone github.com/envoyproxy/protoc-gen-validate
cd protoc-gen-validate
make build
```

### 9. Custom Http return value

You can write a custom `ResponseEncoder` and set to `http.Server()` by using `http.ResponseEncoder()`

### 10. How to control the http return field 0 value ignore field and use proto's message field as the http return field

You can import it in the `main.go` of the http service

```
import (
  "github.com/go-kratos/kratos/v2/encoding/json"
  "google.golang.org/protobuf/encoding/protojson"
)
```

Set `json.MarshalOptions` in the init method

```
func init() {
    flag.StringVar(&flagconf, "conf", "../../configs", "config path, eg: -conf config.yaml")
    //Add this code
    json.MarshalOptions = protojson.MarshalOptions{
        EmitUnpopulated: true, //Default value not ignored
        UseProtoNames:   true, //Use proto name to return http field
    }
}
```

### 11、Controls the name and number of the enum (enumeration type) returned by http

You can import it in the `main.go` of the http service

```
import (
  "github.com/go-kratos/kratos/v2/encoding/json"
  "google.golang.org/protobuf/encoding/protojson"
)
```

Set `json.MarshalOptions` in the init method

```
func init() {
    flag.StringVar(&flagconf, "conf", "../../configs", "config path, eg: -conf config.yaml")
    // Add this code
    json.MarshalOptions = protojson.MarshalOptions{
        UseEnumNumbers: true, // UseEnumNumbers emits enum values as numbers.
    }
}
```

For more control over http return content, please refer to the documentation: https://pkg.go.dev/google.golang.org/protobuf@v1.30.0/encoding/protojson#MarshalOptions



