---
id: log
title: Logger
description: Kratos contains only the simplest Log interface for business-adapted log access. When your business logic needs to use custom logs inside the kratos framework, you only need to implement the Log method simply.
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

We can use logs to observe program behavior, diagnose problems, or configure corresponding alarms. And defining a well structured log can improve search efficiency and facilitate handling of problems.

## Design concept

For convenience, Kratos defines two levels of abstraction. Logger unifies the access mode of logs and helper interface unifies the call mode of logstore.

Different companies and infrastructures may have different requirements for the printing method, format and output location of logs. Kratos abstracts the log component in order to adapt and migrate to various environments more flexibly, so that the use of logs in business code can be isolated from the specific implementation of the underlying log, and the overall maintainability can be improved.

Log of kratos has the following characteristics:

- Logger is used to connect various log libraries or log platforms, which can be implemented by off the shelf or by yourself.
- Helper is actually called in your project code, it is used to print logs in business code
- Filter is used to filter or modify the output log (usually used for log desensitization)
- Valuer is used to bind some global fixed or dynamic values (such as timestamp, traceID or instance ID) to the output log.

### Helper - log in project code

[Helper](https://github.com/go-kratos/kratos/blob/main/log/helper.go):Advanced log interface, which provides a series of help functions with log levels and formatting methods. This is usually recommended in business logic, which can simplify log code.
You can think of it as a wrapper for the logger, which simplifies the parameters that need to be passed in when printing.
Its usage is basically the following, and the specific usage will be introduced later

```go
helper.Info("hello")
helper.Errorf("hello %s", "eric")
```

### Logger - adapts to various log output methods

[Logger](https://github.com/go-kratos/kratos/blob/main/log/log.go):This is the underlying log interface, which is used to quickly adapt various log libraries to the framework. Only the simplest Log method needs to be implemented.

### Interface 
Kratos contains only the simplest Log interface for business-adapted log access. When your business logic needs to use custom logs inside the kratos framework, you only need to implement the Log method simply. Kratos logs also provide some log helpful features such as valuer, helper, filter, and so on, which can be implemented directly using the framework's built-in implementations when we need them, or by ourselves.

```go
type Logger interface {
	Log(level Level, keyvals ...interface{}) error
}
```

`Level` parameter is used to identify the level of the log, which can be found in [level.go](https://github.com/go-kratos/kratos/blob/main/log/level.go).

`keyvals` is a tiled array of key-values. Its length needs to be an even number, with keys on odd bits and values on even bits.
The use of this Logger interface after implementation, as follows:

```go
logger.Log(log.LevelInfo, "msg", "hello", "instance_id", 123)
```

Its significance is that by simply using the Logger interface, you can quickly adaptation your log library and use Helper to unify the printing behavior.

#### Log level

Log levels are defined in [level.go](https://github.com/go-kratos/kratos/blob/main/log/level.go), you can pass them in when using the underlying Log method, and they will be output to the level field of the log. Using a specific method with log level such as `.Infof` in the advanced interface Helper will automatically apply the level without binding the level yourself.

```go
log.LevelDebug
log.LevelInfo
log.LevelWarn
log.LevelError
log.LevelFatal
```

#### Adaptation and implementation

We have implemented some plug-ins in [contrib/log](https://github.com/go-kratos/kratos/tree/main/contrib/log) to adapt to the currently commonly used log libraries. You can also refer to their codes to implement the adaptation of the log library you need:

* [std](https://github.com/go-kratos/kratos/blob/main/log/std.go) stdout, built into Kratos
* [fluent](https://github.com/go-kratos/kratos/tree/main/contrib/log/fluent) output to fluentd
* [zap](https://github.com/go-kratos/kratos/tree/main/contrib/log/zap) Adapted to uber's [zap](https://github.com/uber-go/zap) log library
* [aliyun](https://github.com/go-kratos/kratos/blob/main/contrib/log/aliyun) output to aliyun log service

## Use

The Kratos log library is very simple to use, similar to most logging libraries.

### DefaultLogger: default logger

If you feel that creating a logger is troublesome, You can directly use the default-initialized `log.DefaultLogger` instance of the framework, which directly calls the log of the go standard library at the bottom, and can print to standard output.

### stdLogger

This framework has a built-in implementation of [stdLogger](https://github.com/go-kratos/kratos/blob/main/log/std.go), capable of printing to standard output. Use the `NewStdLogger` method to pass in a `io.Writer`.

```go
//Output to console
l := log.DefaultLogged
l.Log(log.LevelInfo, "stdout_key", "stdout_value")

// Output to ./test.log file
f, err := os.OpenFile("test.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
if err != nil {
    return
}
l = log.NewStdLogger(f)
l.Log(log.LevelInfo, "file_key", "file_value")
```

### initialize

First, you need to create a Logger, here you can choose: the built-in std print to standard output, or find an already implemented adaptation under contrib, or use your own implemented Logger.

```go
import "github.com/go-kratos/kratos/v2/log"

h := log.NewHelper(yourlogger)

// You can use the default logger directly
h := log.NewHelper(log.DefaultLogger)
```

Or find a plugin in [contrib/log](https://github.com/go-kratos/kratos/tree/main/contrib/log) to use, for example, here we want to use fluentd:

```go
import "github.com/go-kratos/kratos/contrib/log/fluent/v2"
import "github.com/go-kratos/kratos/v2/log"

logger, err := fluent.NewLogger("unix:///var/run/fluent/fluent.sock")
if err != nil {
	return 
}
h := log.NewHelper(logger)
```

You can specify the default log to print to the field, if not set, the default is msg.

```go
NewHelper(logger, WithMessageKey("message"))
```

### Print log

Note: The method of calling the Fatal level will interrupt the program running after printing the log, please use it with caution.
Directly print logs of different levels, which will be entered into messageKey, the default is msg.

```go
h.Debug("Are you OK?")
h.Info("42 is the answer to life, the universe, and everything")
h.Warn("We are under attack!")
h.Error("Houston, we have a problem.")
h.Fatal("So Long, and Thanks for All the Fish.")
```

Format and print logs of different levels, all methods end with f

```go
h.Debugf("Hello %s", "boy")
h.Infof("%d is the answer to life, the universe, and everything", 233)
h.Warnf("We are under attack %s!", "boss")
h.Errorf("%s, we have a problem.", "Master Shifu")
h.Fatalf("So Long, and Thanks for All the %s.", "banana")
```

Format and print logs of different levels. The methods all end with w. The parameter is a key value pair, and multiple groups can be entered.

```go
h.Debugw("custom_key", "Are you OK?")
h.Infow("custom_key", "42 is the answer to life, the universe, and everything")
h.Warnw("custom_key", "We are under attack!")
h.Errorw("custom_key", "Houston, we have a problem.")
h.Fatalw("custom_key", "So Long, and Thanks for All the Fish.")
```


Use the underlying Log interface to print key and value.

```go
h.Log(log.LevelInfo, "key1", "value1")
```

### Valuer: sets global fields

In business logs, we usually output some global fields in each log, such as timestamp, instance id, tracking id, user id, calling function name, etc. Obviously, it is very troublesome to manually write these values in each log . To solve this problem, Valuer can be used. You can think of it as the "middleware" of the logger, and use it to type some global information into the log.

The `log.With` method will return a new Logger and bind the Valuer of the parameter to it.
Note that the parameters should be written in the order of key and value.
The method of use is as follows:

```go
logger = log.With(logger, "ts", log.DefaultTimestamp, "caller", log.DefaultCaller)
```

By default, the framework provides the following Valuers for use. You can also refer to their codes to implement custom Valuers.

* [log.Caller](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/log/value.go#L32) Print out the file name and function name of the calling log method.
* [log.Timestamp](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/log/value.go#L49) Print timestamp.
* [tracing.TraceID](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/middleware/tracing/tracing.go#L70) Print TraceID.
* [tracing.SpanID](https://github.com/go-kratos/kratos/blob/2acede53f3e821cef7d3e167dc1cbd6dac22609b/middleware/tracing/tracing.go#L80) Print SpanID.


### Filter: Log filtering

Sometimes there may be sensitive information in the log, which needs to be desensitized, or only high-level logs can be printed. At this time, Filter can be used to filter the output of the log. The usual usage is to use Filter to wrap the original Logger and use To create Helper use.

It provides the following parameters:
- `FilterLevel` filters according to the log level, logs below this level will not be output. For example, if `FilterLevel(log.LevelError)` is passed in here, the debug/info/warn log will be filtered out and will not be output, and error and fatal will be output normally.
- `FilterKey(key ...string) FilterOption` Filter by key, the value of these keys will be masked by `***`
- `FilterValue(value ...string) FilterOption` Filter by value, matching values will be masked by `***`
- `FilterFunc(f func(level Level, keyvals ...interface{}) bool)` Use a custom function to process the log. Keyvals are the key and the corresponding value, which can be read according to the parity.

```go
h := NewHelper(
    NewFilter(logger,
        // Level filtration
        FilterLevel(log.LevelError),

        // Press key to mask
        FilterKey("username"),

        // Press value to mask
        FilterValue("hello"),

        // Custom filter function
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

### Bind context

Set the context, using the following method will return a helper instance bound to the specified context

```go
newHelper := h.WithContext(ctx)
```

### Request log middleware

We provide a log middleware in [middleware/logging](https://github.com/go-kratos/kratos/blob/main/middleware/logging/logging.go), which can record the routing, parameters, time-consuming and other information of each request on the server or client side. When using it, it is recommended to desensitize the request parameter log with Filter to avoid leakage of sensitive information.
The code of this middleware also clearly shows how to obtain and process request and return information in the middleware, which has great reference value. You can implement your own log middleware based on its code.

### Global log

If you are in a project and just want to use a simple log function that can be printed at any time in the global, we provide a global log.

```go
import "github.com/go-kratos/kratos/v2/log"

log.Info("info")
log.Warn("warn")
```

The above is using the default `log.DefaultLogger`  standard output. You can also find an already implemented adaptation under contrib, or use your own implemented Logger and use `log.SetLogger` to set the global log logger.

```go
// Setting up a global logger with zap log

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

// Print log
log.Info("info")
log.Debug("debug")
```

## kratos-layout

In our default project template, we initialized the logger instance at the program entry in the `main()` function of `[cmd/server/main.go](https://github.com/go-kratos/kratos-layout/blob/cf30efc32d78338e8e4739d3288feeba426388a5/cmd/server/main.go#L49)`, and injected some global log values, which will be typed into all output logs.

You can modify the logger used here to customize the printed value, or replace it with the logger implementation you need.

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

This logger will be generated by the dependency injection tool wire and injected into each layer of the project for its internal use.
A specific internal use example can refer to [internal/service/greeter.go](https://github.com/go-kratos/kratos-layout/blob/cf30efc32d78338e8e4739d3288feeba426388a5/internal/service/greeter.go#L21).
We will inject the logger instance here, wrap it as a Helper with `log.NewHelper` and bind it to the service, so that the bound helper object can be called at this layer to log.

```go
func NewGreeterService(uc *biz.GreeterUsecase, logger log.Logger) *GreeterService {
	return &GreeterService{uc: uc, log: log.NewHelper(logger)} // 初始化和绑定helper
}

func (s *GreeterService) SayHello(ctx context.Context, in *v1.HelloRequest) (*v1.HelloReply, error) {
	// Print log
	s.log.WithContext(ctx).Infof("SayHello Received: %v", in.GetName())

	return &v1.HelloReply{Message: "Hello " + in.GetName()}, nil
}
```

The initialization and usage methods of other layers are also the same. In the [biz layer](https://github.com/go-kratos/kratos-layout/blob/cf30efc32d78338e8e4739d3288feeba426388a5/internal/biz/greeter.go#L23) and the [data layer](https://github.com/go-kratos/kratos-layout/blob/main/internal/data/greeter.go), we also give a sample of logger injection, you can refer to.

