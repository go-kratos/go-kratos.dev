---
id: logging
title: Logging
---

### 接口实现 

为了方便业务自适配不同的log接入使用，Logger只包含了最简单的print接口。当业务需要在kratos框架内部使用自定义的logging middlerware的时候，只需要简单实现Print方法即可

```
type Logger interface {
	Print(pairs ...interface{})
}
```
### 使用方式

#### 输出日志到stdout

使用自带的StdLogger可以创建标准输出日志对象. 通过NewHelper构造日志模块，help生成的日志模块可以提供不同等级的日志输出。

```
logger := log.NewStdLogger()
log := log.NewHelper("module_name", logger)
// Levels
log.Info("some log")
log.Infof("format %s", "some log")
log.Infow("field_name", "some log")
```

#### 输出日志到fluentd

引入 fluent sdk

```
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

在http.ServerOption 中引入logging.Server(), 则kratos会在每次收到http请求的时候打印详细请求信息。

```
var opts = []http.ServerOption{
		http.Middleware(
			middleware.Chain(
				logging.Server(),
			),
		),
	}
http.NewServer(opts...)
```



