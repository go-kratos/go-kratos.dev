---
id: logging
title: Logging
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
description: Kratos 为了方便业务自适配不同的 log 接入使用，Logger 只包含了最简单的 Print 接口。当业务需要在 kratos 框架内部使用自定义的 logging middlerware 的时候，只需要简单实现Print方法即可
---

### 接口实现 

为了方便业务自适配不同的 log 接入使用，Logger 只包含了最简单的 Print 接口。当业务需要在 Kratos 框架内部使用自定义的 logging middlerware 的时候，只需要简单实现 Print 方法即可

```go
type Logger interface {
	Print(pairs ...interface{})
}
```
### 使用方式

#### 输出日志到stdout

使用自带的 StdLogger 可以创建标准输出日志对象. 通过 NewHelper 构造日志模块，Helper 生成的日志模块可以提供不同等级的日志输出。

```go
logger := log.NewStdLogger()
log := log.NewHelper("module_name", logger)
// Levels
log.Info("some log")
log.Infof("format %s", "some log")
log.Infow("field_name", "some log")
```

#### 输出日志到fluentd

引入 fluent sdk

```go
import "github.com/go-kratos/fluent"

addr := "unix:///var/run/fluent/fluent.sock"
logger,err := fluent.NewLogger(addr)
if err != nil {
    return 
}
log := log.NewHelper("module_name", logger)
// Levels
log.Info("some log")
log.Infof("format %s", "some log")
log.Infow("field_name", "some log")
```

#### 在kratos中引入logging middleware

在 http.ServerOption 中引入 logging.Server(), 则 Kratos 会在每次收到 HTTP 请求的时候打印详细请求信息。

```go
var opts = []http.ServerOption{
		http.Middleware(
			middleware.Chain(
				logging.Server(),
			),
		),
	}
http.NewServer(opts...)
```



