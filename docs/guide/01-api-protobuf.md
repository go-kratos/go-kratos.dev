---
id: api-protobuf
title: Protobuf 规范
description: API接口统一以HTTP/GRPC为基础，并通过Protobuf进行协议定义，包括完整的Request/Reply，以及对应的接口错误码（Errors）
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

这里主要进行修订 Proto 规范约定和多语言之间特定商定，帮助大家写出更标准的接口。

API 接口统一以 HTTP/GRPC 为基础，并通过 Protobuf 进行协议定义，包括完整的 Request/Reply，以及对应的接口错误码（Errors）。

## 目录结构

API 接口可以定义到项目，或者在统一仓库中管理 Proto，类似 `googleapis`、`envoy-api`、`istio-api`；

项目中定义 Proto，以 api 为包名根目录：

```bash
kratos-demo：
|____api // 服务API定义
| |____kratos
| | |____demo
| | | |____v1
| | | | |____demo.proto
```

在统一仓库中管理 Proto，以仓库为包名根目录：

```bash
kratos-apis:
|____api // 服务API定义
| |____kratos
| | |____demo
| | | |____v1
| | | | |____demo.proto
|____annotations // 注解定义options
|____third_party // 第三方引用
```

## 包名

包名为应用的标识（APP_ID），用于生成 gRPC 请求路径，或者 Proto 之间进行引用 Message。

- `my.package.v1`，为 API 目录，定义 service 相关接口，用于提供业务使用。

例如：

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

该版本号为标注不兼容版本，并且会在 `<package_name>` 中进行区分，当接口需要重构时一般会更新不兼容结构。

## Import

- 业务 proto 依赖，以根目录进行引入对应依赖的 proto。
- third_party，主要为依赖的第三方 proto，比如 `protobuf`、`google rpc`、`google apis`、`gogo` 定义。

## 命名规范

### 目录结构

包名为小写，并且同目录结构一致，例如：`my/package/v1/`。

```protobuf
package my.package.v1;
```

### 文件结构

文件应该命名为：`lower_snake_case.proto`。
所有 Proto 应按下列方式排列:

1. License header (if applicable)
2. File overview
3. Syntax
4. Package
5. Imports (sorted)
6. File options
7. Everything else

### Message 和 字段命名

使用驼峰命名法（首字母大写）命名 message，例子：`SongServerRequest`。  
使用下划线命名字段，例子：`song_name`。  
Proto2 和 Proto3 的语法也有所不同。

```protobuf
message SongServerRequest {
  optional string song_name = 1;
}
```

使用上述这种字段的命名约定，生成的访问器将类似于如下代码：

```
C++:
  const string& song_name() { ... }
  void set_song_name(const string& x) { ... }

Java:
  public String getSongName() { ... }
  public Builder setSongName(String v) { ... }
```

如果你的字段名包含一个数字，数字应该出现在字母后面，而不是下划线后面。例如，使用 `song_name1` 而不是 `song_name_1`。

### Repeated 字段

对于复数命名的 message 使用 repeated 字段。

```protobuf
repeated string keys = 1;
...
repeated Account accounts = 17;
```

### 枚举 Enums

枚举类型使用驼峰命名法（首字母大写）命名，使用 `CAPITALS_WITH_UNDERSCORES(带下划线的大写字母)` 的方式命名枚举值：

```protobuf
enum FooBar {
  FOO_BAR_UNSPECIFIED = 0;
  FOO_BAR_FIRST_VALUE = 1;
  FOO_BAR_SECOND_VALUE = 2;
}
```

每一个枚举值以分号结尾，而非逗号。倾向于给枚举值加前缀，而不是用一个包围的信息包围它们。零值枚举应该有后缀 `UNSPECIFIED`。

### 服务 Services

如果你在 `.proto` 文件中定义 RPC 服务，你应该使用驼峰命名法（首字母大写）命名 RPC 服务以及其中的 RPC 方法：

```protobuf
service FooService {
  rpc GetSomething(GetSomethingRequest) returns (GetSomethingResponse);
  rpc ListSomething(ListSomethingRequest) returns (ListSomethingResponse);
}
```

## Comment

- **Service**，描述清楚服务的作用
- **Method**，描述清楚接口的功能特性
- **Field**，描述清楚字段准确的信息

## Examples

API Service 接口定义(demo.proto)

```protobuf
syntax = "proto3";

package kratos.demo.v1;

// 多语言特定包名，用于源代码引用
option go_package = "github.com/go-kratos/kratos/demo/v1;v1";   // ';' 后面的 <version> 是为了生成对应代码
option java_multiple_files = true;
option java_package = "com.github.kratos.demo.v1";
option objc_class_prefix = "KratosDemoV1";

// 描述该服务的信息
service Greeter {
    // 描述该方法的功能
    rpc SayHello (HelloRequest) returns (HelloReply);
}
// Hello请求参数
message HelloRequest {
    // 用户名字
    string name = 1;
}
// Hello返回结果
message HelloReply {
    // 结果信息
    string message = 1;
}
```

## References

- https://google.aip.dev/
- https://protobuf.dev/programming-guides/style/
- https://protobuf.dev/programming-guides/proto3/
- https://colobu.com/2017/03/16/Protobuf3-language-guide/
