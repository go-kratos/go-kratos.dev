---
id: api-protobuf
title: Protobuf Guideline
---
This documentation is the guideline of Protobuf definition which recommended in Kratos project.

The API definition is based on HTTP and gRPC, written with Protobuf format They should includes all the Request, Reply and the corresponding Errors.

## Directory Structure
The definition of Proto could be either in `api` directory of the project or in a unified repository, likes googleapis, envoy-api,istio-api.

For the proto in project, the api should be used as the root of package name.
```
kratos-demo：
|____api // The definition of service's API
| |____kratos
| | |____demo
| | | |____v1
| | | | |____demo.proto
```

For the proto in unified repository, the repository name should be used as the root of package name.
```
kratos-apis:
|____api // The definition of service's API
| |____kratos
| | |____demo
| | | |____v1
| | | | |____demo.proto
|____annotations // the options annotations
|____third_party // third-party protos
```

## Package
The name of the package (APP_ID) will be used for generate the request path of gRPC API or the path for proto importing.

*  my.package.v1 is the API's directory, which defines the API of the services.

For example.
```protobuf
// RequestURL: /<package_name>.<version>.<service_name>/{method}
package <package_name>.<version>;
```
### go_package
```protobuf
option go_package = "github.com/go-kratos/kratos/<package_name>;<version>";
```
### java_package
```protobuf
option java_multiple_files = true;
option java_package = "com.github.kratos.<package_name>.<version>";
```
### objc_class_prefix
```protobuf
option objc_class_prefix = "<PackageNameVersion>";
```

## Version
This version is for incompatible version and always used with `<package_name>`. It should be modified for API breaking changes.


## Import
* the proto dependencies' import path should be started from root path.
* third_party, includes the proto from third-party such as protobuf, google rpc,google apis, gogo etc.

## Naming Convention

### Directory Structure
The package name should be lower-case, consist with the project directory structure, e.g., `my/package/v1/`
```protobuf
package my.package.v1;
```

### File Structure
The name of proto files should be `lower_snake_case.proto`
The contents of proto file should be arranged as follows.
1. License header (if applicable)
2. File overview
3. Syntax
4. Package
5. Imports (sorted)
6. File options
7. Everything else

### Message & Field Naming
The name of message should be PascalCase, e.g., `SongServerRequest`.
The name of field should be snake_case, e.g., `song_name`

```protobuf
message SongServerRequest {
  required string song_name = 1;
}
```

Corresponding with the definitions which mentioned above, the generated code can be shown as follows.
```
C++:
  const string& song_name() { ... }
  void set_song_name(const string& x) { ... }

Java:
  public String getSongName() { ... }
  public Builder setSongName(String v) { ... }
```
### Repeated
Using keyword `repeated` to define an array(List):
```protobuf
repeated string keys = 1;
...
repeated Account accounts = 17;
```

### Enums
The name of enums should be PascalCase, and the enum values' name should be UPPER_CASE_SNAKE_CASE.

```protobuf
enum Foo {
  FIRST_VALUE = 0;
  SECOND_VALUE = 1;
}
```
Every line must be end with a semicolon (;) rather than comma.

### Services
In the .proto file, PascalCase should be applied on names of RPC services and the methods of the services.
```protobuf
service FooService {
  rpc GetSomething(FooRequest) returns (FooResponse);
}
```

## Comment
* Service describes the functions of this service.
* Method describe the functions of this API. 
* Field describe the information of this field.

## Examples
Service API Definition (demo.proto)
```protobuf
syntax = "proto3";

package kratos.demo.v1;

// specifying the package names for importing from multiple programming language
option go_package = "github.com/go-kratos/kratos/demo/v1;v1";
option java_multiple_files = true;
option java_package = "com.github.kratos.demo.v1";
option objc_class_prefix = "KratosDemoV1";

// Definition of the service
service Greeter {
    // definition the function of API
    rpc SayHello (HelloRequest) returns (HelloReply);
}
// the request of Hello
message HelloRequest {
    // user's name
    string name = 1;
}
// the response of Hello 
message HelloReply {
    // result data
    string message = 1;
}
```

## References
* https://developers.google.com/protocol-buffers/docs/style
* https://developers.google.com/protocol-buffers/docs/proto3
* https://colobu.com/2017/03/16/Protobuf3-language-guide/
