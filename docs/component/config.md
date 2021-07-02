---
id: config
title: 应用配置 Config
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

### 使用方式
配置源可以指定多个，并且 config 会进行合并成 map[string]interface{}，然后通过 Scan 或者 Value 获取值内容；

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
        return yaml.Unmarshal(kv.Value, v)
    }),
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