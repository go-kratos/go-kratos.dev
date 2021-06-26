---
id: config
title: Config
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
// 解析到结构体（由于已经合并到map[string]interface{}，所以需要指定 jsonName 进行解析）：
var v struct {
    Service string `json:"service"`
    Version string `json:"version"`
}
if err := c.Scan(&v); err != nil {
    log.Fatal(err)
}
// 监听某个键值内容变更
c.Watch("service.name", func(key string, value config.Value) {
    // 值内容变更
})
```
