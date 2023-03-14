---
id: log
title: 日志
description: Kratos 为了方便业务自适配不同的 log 接入使用，Logger 只包含了最简单的 Log 接口。当业务需要在 kratos 框架内部使用自定义的 log 的时候，只需要简单实现 Log 方法即可
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

我们可以使用日志来观察程序的行为、诊断问题或者配置相应的告警等。定义良好的结构化日志，能够提高日志的检索效率，使处理问题变得更加方便。

## 设计理念
为了方便使用，Kratos定义了两个层面的抽象，Logger统一了日志的接入方式，Helper接口统一的日志库的调用方式。

在不同的公司、使用不同的基础架构，可能对日志的打印方式、格式、输出的位置等要求各有不同。Kratos为了更加灵活地适配和迁移到各种环境，把日志组件也进行了抽象，这样就可以把业务代码里日志的使用，和日志底层具体的实现隔离开来，提高整体的可维护性。

Kratos的日志库主要有如下特性：

* Logger用于对接各种日志库或日志平台，可以用现成的或者自己实现
* Helper是在您的项目代码中实际需要调用的，用于在业务代码里打日志
* Filter用于对输出日志进行过滤或魔改（通常用于日志脱敏）
* Valuer用于绑定一些全局的固定值或动态值（比如时间戳、traceID或者实例id之类的东西）到输出日志中

### Helper - 在项目代码中打日志
[Helper](https://github.com/go-kratos/kratos/blob/main/log/helper.go)：高级日志接口，提供了一系列带有日志等级和格式化方法的帮助函数，通常业务逻辑中建议使用这个，能够简化日志代码。

你可以认为它是一个对Logger的包装，简化了打印时需要传入的参数。

它的用法基本上是下面的样子，后面会介绍具体的使用方法
```go
helper.Info("hello")
helper.Errorf("hello %s", "eric")
```

### Logger - 适配各种日志输出方式
[Logger](https://github.com/go-kratos/kratos/blob/main/log/log.go)：这个是底层日志接口，用于快速适配各种日志库到框架中来，仅需要实现一个最简单的Log方法。

```go
type Logger interface {
	Log(level Level, keyvals ...interface{}) error
}
```
`Level`参数用来标识日志的等级，可以在[level.go](https://github.com/go-kratos/kratos/blob/main/log/level.go)中找到。

`keyvals`是一个平铺的键值数组，它的长度需要是偶数，奇数位上的是key，偶数位上的是value。


这个Logger接口在实现完毕后的使用，简单来讲就是如下的样子：

```go
logger.Log(log.LevelInfo, "msg", "hello", "instance_id", 123)
```

很显然,直接用它有点难受，所以我们建议在项目中用`Helper`。

它的意义在于，通过简单使用Logger接口，能够快速把您的日志库适配进来，并且用Helper来统一打印的行为。

#### 日志等级
对于日志等级的定义在[level.go](https://github.com/go-kratos/kratos/blob/main/log/level.go)中，您可以在使用底层的Log方法时传入它们，它们会被输出到日志的`level`字段中。在高级接口`Helper`使用特定的带日志等级的方法比如`.Infof`等，会自动应用等级，无需自己绑定等级。

```go
log.LevelDebug
log.LevelInfo
log.LevelWarn
log.LevelError
log.LevelFatal
```

#### 适配实现

我们已经在[contrib/log](https://github.com/go-kratos/kratos/tree/main/contrib/log)实现好了一些插件，用于适配目前常用的日志库，您也可以参考它们的代码来实现自己需要的日志库的适配：

* [std](https://github.com/go-kratos/kratos/blob/main/log/std.go) 标准输出，Kratos内置
* [fluent](https://github.com/go-kratos/kratos/tree/main/contrib/log/fluent) 输出到fluentd
* [zap](https://github.com/go-kratos/kratos/tree/main/contrib/log/zap) 适配了uber的[zap](https://github.com/uber-go/zap)日志库
* [aliyun](https://github.com/go-kratos/kratos/blob/main/contrib/log/aliyun) 输出到阿里云日志

## 使用
Kratos日志库使用十分简单，和大部分日志库类似。

### DefaultLogger 默认logger
如果觉得创建logger很麻烦，可以直接用框架默认初始化好的`log.DefaultLogger`实例，它底层直接调用了go标准库的log，可以打到标准输出。

### stdLogger
框架内置实现了[stdLogger](https://github.com/go-kratos/kratos/blob/main/log/std.go)，能够打印到标准输出。使用`NewStdLogger`方法传入一个`io.Writer`即可。

```go
// 输出到控制台
l := log.DefaultLogged
l.Log(log.LevelInfo, "stdout_key", "stdout_value")

// 输出到 ./test.log 文件
f, err := os.OpenFile("test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
if err != nil {
    return
}
l = log.NewStdLogger(f)
l.Log(log.LevelInfo, "file_key", "file_value")
```

### 初始化
首先你需要创建一个Logger，这里可以选：自带的std打印到标准输出，或者在contrib下面找一个已经实现好的适配，或者用自己实现的Logger。
```go
import "github.com/go-kratos/kratos/v2/log"

h := NewHelper(yourlogger)

// 用默认logger可以直接用
h := NewHelper(log.DefaultLogger)
```

或者在[contrib/log](https://github.com/go-kratos/kratos/tree/main/contrib/log)里面找一个插件用，比如这里我们想用fluentd：
```go
import "github.com/go-kratos/kratos/contrib/log/fluent/v2"

logger, err := fluent.NewLogger("unix:///var/run/fluent/fluent.sock")
if err != nil {
	return 
}
h := log.NewHelper(logger)
```

您可以指定默认的日志打印到的字段，不设的话默认为`msg`
```go
NewHelper(logger, WithMessageKey("message"))
```

### 打印日志
注意：调用Fatal等级的方法会在打印日志后中断程序运行，请谨慎使用。

直接打印不同等级的日志，会默认打到messageKey里,默认是`msg`
```go
h.Debug("Are you OK?")
h.Info("42 is the answer to life, the universe, and everything")
h.Warn("We are under attack!")
h.Error("Houston, we have a problem.")
h.Fatal("So Long, and Thanks for All the Fish.")
```

格式化打印不同等级的日志，方法都以f结尾
```go
h.Debugf("Hello %s", "boy")
h.Infof("%d is the answer to life, the universe, and everything", 233)
h.Warnf("We are under attack %s!", "boss")
h.Errorf("%s, we have a problem.", "Master Shifu")
h.Fatalf("So Long, and Thanks for All the %s.", "banana")
```

格式化打印不同等级的日志，方法都以w结尾，参数为key value对，可以输入多组。
```go
h.Debugw("custom_key", "Are you OK?")
h.Infow("custom_key", "42 is the answer to life, the universe, and everything")
h.Warnw("custom_key", "We are under attack!")
h.Errorw("custom_key", "Houston, we have a problem.")
h.Fatalw("custom_key", "So Long, and Thanks for All the Fish.")
```

使用底层的Log接口直接打印key和value
```go
h.Log(log.LevelInfo, "key1", "value1")
```
### Valuer 设置全局字段
在业务日志中，通常我们会在每条日志中输出一些全局的字段，比如时间戳，实例id，追踪id，用户id，调用函数名等，显然在每条日志中手工写入这些值很麻烦。为了解决这个问题，可以使用Valuer。您可以认为它是logger的“中间件”，用它来打一些全局的信息到日志里。

`log.With`方法会返回一个新的Logger，把参数的Valuer绑上去。

注意要按照key,value的顺序对应写入参数。

使用方法如下：
```go
logger = log.With(logger, "ts", log.DefaultTimestamp, "caller", log.DefaultCaller)
```

框架默认提供了如下Valuer供使用，您也可以参考它们的代码实现自定义Valuer。
* [log.Caller](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/log/value.go#L32) 打印出调用日志方法的文件名和函数名
* [log.Timestamp](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/log/value.go#L49) 打印时间戳
* [tracing.TraceID](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/middleware/tracing/tracing.go#L70) 打印TraceID
* [tracing.SpanID](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/middleware/tracing/tracing.go#L80) 打印SpanID



### Filter 日志过滤
有时日志中可能会有敏感信息，需要进行脱敏，或者只打印级别高的日志，这时候就可以使用Filter来对日志的输出进行一些过滤操作，通常用法是使用Filter来包装原始的Logger，用来创建Helper使用。

它提供了如下参数：
* `FilterLevel` 按照日志等级过滤，低于该等级的日志将不会被输出。例如这里传入`FilterLevel(log.LevelError)`，则debug/info/warn日志都会被过滤掉不会输出，error和fatal正常输出。
* `FilterKey(key ...string) FilterOption` 按照key过滤，这些key的值会被`***`遮蔽
* `FilterValue(value ...string) FilterOption` 按照value过滤，匹配的值会被`***`遮蔽
* `FilterFunc(f func(level Level, keyvals ...interface{}) bool)` 使用自定义的函数来对日志进行处理，keyvals里为key和对应的value，按照奇偶进行读取即可

```go
h := NewHelper(
	NewFilter(logger,
		// 等级过滤
		FilterLevel(log.LevelError),

		// 按key遮蔽
		FilterKey("username"),

		// 按value遮蔽
		FilterValue("hello"),

		// 自定义过滤函数
		FilterFunc(
			func (level Level, keyvals ...interface{}) bool {
				if level == LevelWarn {
					return true
				}
				for i := 0; i < len(keyvals); i++ {
					if keyvals[i] == "password" {
						keyvals[i+1] = fuzzyStr
					}
				}
				return false
			}
		),
	),
)

h.Log(log.LevelDebug, "msg", "test debug")
h.Info("hello")
h.Infow("password", "123456")
h.Infow("username", "kratos")
h.Warn("warn log")
```

### 绑定context
设置context，使用如下方法将返回一个绑定指定context的helper实例
```go
newHelper := h.WithContext(ctx)
```

### 请求日志中间件
我们在[middleware/logging](https://github.com/go-kratos/kratos/blob/main/middleware/logging/logging.go)提供了一个日志中间件，使用它可以记录server端或client端每个请求的路由、参数、耗时等信息。使用时建议配合Filter对请求参数日志进行脱敏，避免敏感信息泄漏。

这个middleware的代码也十分清晰地展示了如何在中间件里获取和处理请求和返回信息，具有很大的参考价值，您可以基于它的代码实现自己的日志中间件等。

### 全局日志

如果您在项目中，只想使用简单的日志功能，全局可以随时打印，我们提供了全局日志。

```go
import "github.com/go-kratos/kratos/v2/log"

log.Info("info")
log.Warn("warn")
```

以上为使用默认 `log.DefaultLogger` 标准输出。您也可以在contrib下面找一个已经实现好的适配，或者用自己实现的Logger，使用`log.SetLogger` 设置全局日志的logger。

```go
// 使用zap日志设置全局logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	kratoszap "github.com/go-kratos/kratos/contrib/log/zap/v2"
	"github.com/go-kratos/kratos/v2/log"
)

f, err := os.OpenFile("test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
if err != nil {
    return
}
writeSyncer := zapcore.AddSync(f)

encoder := zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig())
core := zapcore.NewCore(encoder, writeSyncer, zapcore.DebugLevel)
z := zap.New(core)

logger := kratoszap.NewLogger(z)
log.SetLogger(logger)

// 打印日志
log.Info("info")
log.Debug("debug")
```

## kratos-layout

在我们的默认项目模板中，我们在[cmd/server/main.go](https://github.com/go-kratos/kratos-layout/blob/cf30efc32d78338e8e4739d3288feeba426388a5/cmd/server/main.go#L49)的`main()`函数，即程序入口处初始化了logger实例，并注入了一些全局的日志值，它们会被打到所有输出的日志中。

您可以修改这里使用的logger，来进行自定义打印的值，或者更换为自己需要的logger实现。

```go
logger := log.With(log.NewStdLogger(os.Stdout),
	"ts", log.DefaultTimestamp,
	"caller", log.DefaultCaller,
	"service.id", id,
	"service.name", Name,
	"service.version", Version,
	"trace_id", tracing.TraceID(),
	"span_id", tracing.SpanID(),
)
```

这个logger将通过依赖注入工具wire的生成，注入到项目的各层中，供其内部使用。

一个具体的内部使用例子可以参考[internal/service/greeter.go](https://github.com/go-kratos/kratos-layout/blob/cf30efc32d78338e8e4739d3288feeba426388a5/internal/service/greeter.go#L21)

我们在这里将注入进来的logger实例，用`log.NewHelper`包装成Helper，绑定到service上，这样就可以在这一层调用这个绑定的的helper对象来打日志了。

```go
func NewGreeterService(uc *biz.GreeterUsecase, logger log.Logger) *GreeterService {
	return &GreeterService{uc: uc, log: log.NewHelper(logger)} // 初始化和绑定helper
}

func (s *GreeterService) SayHello(ctx context.Context, in *v1.HelloRequest) (*v1.HelloReply, error) {
	// 打印日志
	s.log.WithContext(ctx).Infof("SayHello Received: %v", in.GetName())

	return &v1.HelloReply{Message: "Hello " + in.GetName()}, nil
}
```

其它几个层级的初始化和使用方式也是一样的，在[biz层](https://github.com/go-kratos/kratos-layout/blob/cf30efc32d78338e8e4739d3288feeba426388a5/internal/biz/greeter.go#L23)和[data层](https://github.com/go-kratos/kratos-layout/blob/main/internal/data/greeter.go)中我们也给了logger注入的样例，您可以进行参考。
