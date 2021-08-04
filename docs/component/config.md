---
id: config
title: 应用配置
description: Kratos 配置源可以指定多个，并且 config 会进行合并成 map[string]interface{}，然后通过 Scan 或者 Value 获取值内容
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
在 Kratos 项目中，配置源可以指定多个，并且 config 会进行合并成 key/value 。
然后用户通过 Scan 或者 Value 获取对应键值内容，主要功能特性:

- 默认实现了本地文件数据源。
- 用户可以自定义数据源实现。
- 支持配置热加载，以及通过 Atomic 方式变更已有 Value。
- 支持自定义数据源解码实现。
- 支持通过通过占位符`$`获取环境变量或已有字段的值

### 通过 proto 定义配置
在 Kratos 项目中，我们默认推荐通过 proto 进行定义配置文件，主要有以下几点好处：

- 可以定义统一的模板配置
- 添加对应的配置校验
- 更好地管理配置
- 跨语言支持

#### 配置文件
```yaml
server:
  http:
    addr: 0.0.0.0:8000
    timeout: 1s
  grpc:
    addr: 0.0.0.0:9000
    timeout: 1s
data:
  database:
    driver: mysql
    source: root:root@tcp(127.0.0.1:3306)/test
  redis:
    addr: 127.0.0.1:6379
    read_timeout: 0.2s
    write_timeout: 0.2s

```

#### proto 声明
```protobuf
syntax = "proto3";
package kratos.api;

option go_package = "github.com/go-kratos/kratos-layout/internal/conf;conf";

import "google/protobuf/duration.proto";

message Bootstrap {
  Server server = 1;
  Data data = 2;
}

message Server {
  message HTTP {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration timeout = 3;
  }
  message GRPC {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration timeout = 3;
  }
  HTTP http = 1;
  GRPC grpc = 2;
}

message Data {
  message Database {
    string driver = 1;
    string source = 2;
  }
  message Redis {
    string network = 1;
    string addr = 2;
    google.protobuf.Duration read_timeout = 3;
    google.protobuf.Duration write_timeout = 4;
  }
  Database database = 1;
  Redis redis = 2;
}
```

### 生成配置
在项目根目录执行

```shell
make config
```

### 使用方式
配置源可以指定多个，并且 config 会进行合并成 map[string]interface{}，然后通过 Scan 或者 Value 获取值内容；目前支持的配置源：

- file
- env

```go
c := config.New(
    config.WithSource(
        file.NewSource(path),
    ),
    config.WithDecoder(func(kv *config.KeyValue, v map[string]interface{}) error {
        // kv.Key
        // kv.Value
        // kv.Format
        // 自定义实现对应的数据源解析，如果是配置中心数据源也可以指定对应的 format 进行识别配置类型
    }),
    config.WithResolver(func(map[string]interface{}) error {
        // 默认 resolver 提供了对 ${key:default} 与 $key 两种占位符的处理
        // 自定义加载配置数据后的处理方法
    })
)
// 加载配置源：
if err := c.Load(); err != nil {
    log.Fatal(err)
}
// 获取对应的值内容：
name, err := c.Value("service").String()

/*
  通过 proto 文件生成的结构体，也可以直接声明结构体进行解析如：
  var v struct {
      Service string `json:"service"`
      Version string `json:"version"`
  }
*/
var bc conf.Bootstrap
if err := c.Scan(&bc); err != nil {
	log.Fatal(err)
}
// 监听某个键值内容变更
c.Watch("service.name", func(key string, value config.Value) {
    // 值内容变更
})
```

Kratos可以通过配置文件中的占位符来读取**环境变量**或者**已有字段**的Value

```yaml
service:
  name: "kratos_app"
http:
  server:
    # 使用 service.name 的值
    name: "${service.name}"
    # 使用环境变量 PORT 替换，若不存在，使用默认值 8080
    port: "${PORT:8080}"
    # 使用环境变量 TIMEOUT 替换，无默认值
    timeout: "$TIMEOUT"
```

加载来自环境变量的配置源时**无需要提前加载**，环境配置的解析会在所有 source 加载完成后进行

```go
c := config.New(
    config.WithSource(
        // 添加前缀为 KRATOS_ 的环境变量
        env.NewSource("KRATOS_"),
        // 添加配置文件
        file.NewSource(path),
    ))
    
// 加载配置源：
if err := c.Load(); err != nil {
    log.Fatal(err)
}

// 获取环境变量 KRATOS_PORT 的值
port, err := c.Value("PORT").String()
```
