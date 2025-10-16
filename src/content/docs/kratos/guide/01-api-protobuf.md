---
id: api-protobuf
title: Protobuf Guideline
---

This documentation is the guideline of Protobuf definition which recommended in Kratos project.

The API definition is based on HTTP and gRPC, written with Protobuf format They should includes all the Request, Reply and the corresponding Errors.

## Directory Structure

The definition of Proto could be either in `api` directory of the project or in a unified repository, likes `googleapis`, `envoy-api`, `istio-api`.

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

- `my.package.v1` is the API's directory, which defines the API of the services.

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

- the proto dependencies' import path should be started from root path.
- third_party, includes the proto from third-party such as `protobuf`, `google rpc`,`google apis`, `gogo` etc.

## Naming Convention

### Directory Structure

The package name should be lower-case, consist with the project directory structure, e.g., `my/package/v1/`.

```protobuf
package my.package.v1;
```

### File Structure

The name of proto files should be `lower_snake_case.proto`.
The contents of proto file should be ordered in the following manner:

1. License header (if applicable)
2. File overview
3. Syntax
4. Package
5. Imports (sorted)
6. File options
7. Everything else

### Message & Field Naming

Use CamelCase (with an initial capital) for message names, e.g., `SongServerRequest`.  
Use underscore_separated_names for field names (including oneof field and extension names) , e.g., `song_name`.

```protobuf
message SongServerRequest {
  optional string song_name = 1;
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

### Repeated Fields

Use pluralized names for repeated fields.

```protobuf
repeated string keys = 1;
  ...
repeated MyMessage accounts = 17;
```

### Enums

Use CamelCase (with an initial capital) for enum type names and `CAPITALS_WITH_UNDERSCORES` for value names:

```protobuf
enum FooBar {
  FOO_BAR_UNSPECIFIED = 0;
  FOO_BAR_FIRST_VALUE = 1;
  FOO_BAR_SECOND_VALUE = 2;
}
```

Each enum value should end with a semicolon, not a comma. Prefer prefixing enum values instead of surrounding them in an enclosing message. The zero value enum should have the suffix `UNSPECIFIED`.

### Services

If your `.proto` defines an RPC service, you should use CamelCase (with an initial capital) for both the service name and any RPC method names.

```protobuf
service FooService {
  rpc GetSomething(GetSomethingRequest) returns (GetSomethingResponse);
  rpc ListSomething(ListSomethingRequest) returns (ListSomethingResponse);
}
```

## Comment

- **Service** describes the functions of this service.
- **Method** describe the functions of this API.
- **Field** describe the information of this field.

## Examples

Service API Definition (demo.proto)

```protobuf
syntax = "proto3";

package kratos.demo.v1;

// specifying the package names for importing from multiple programming language
option go_package = "github.com/go-kratos/kratos/demo/v1;v1";   //the name after ; is for relative code generation
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

- https://google.aip.dev/
- https://protobuf.dev/programming-guides/style/
- https://protobuf.dev/programming-guides/proto3/
- https://colobu.com/2017/03/16/Protobuf3-language-guide/
