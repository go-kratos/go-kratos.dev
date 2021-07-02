---
id: log
title: 日志接口
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

### 接口实现 

为了方便业务自适配不同的 log 接入使用，Logger 只包含了最简单的 Log 接口。当业务需要在 Kratos 框架内部使用自定义的 log  的时候，只需要简单实现 Log 方法即可。同时 kratos log 也提供了一些日志的辅助功能，如 value、helper、 filter 等，当我们需要用到这些功能时可以直接使用框架的内置实现，或自行实现相应的功能。

```go
type Logger interface {
	Log(level Level, keyvals ...interface{}) error
}
```
### 如何实现

#### 实现 logger
```go
// https://github.com/go-kratos/kratos/blob/main/log/std.go
var _ Logger = (*stdLogger)(nil)

type stdLogger struct {
	log  *log.Logger
	pool *sync.Pool
}

// NewStdLogger new a logger with writer.
func NewStdLogger(w io.Writer) Logger {
	return &stdLogger{
		log: log.New(w, "", 0),
		pool: &sync.Pool{
			New: func() interface{} {
				return new(bytes.Buffer)
			},
		},
	}
}

// Log print the kv pairs log.
func (l *stdLogger) Log(level Level, keyvals ...interface{}) error {
	if len(keyvals) == 0 {
		return nil
	}
	if len(keyvals)%2 != 0 {
		keyvals = append(keyvals, "")
	}
	buf := l.pool.Get().(*bytes.Buffer)
	buf.WriteString(level.String())
	for i := 0; i < len(keyvals); i += 2 {
		fmt.Fprintf(buf, " %s=%v", keyvals[i], keyvals[i+1])
	}
	l.log.Output(4, buf.String())~~~~
	buf.Reset()
	l.pool.Put(buf)
	return nil
}
```
#### 实现 valuer
```go
func Timestamp(layout string) Valuer {
	return func(context.Context) interface{} {
		return time.Now().Format(layout)
	}
}
```
### 使用方式

#### 使用 Logger 打印日志
```go
logger := log.DefaultLogger
logger.Log(LevelInfo, "key1", "value1")
```
#### 使用 Helper 打印日志
```go
log := log.NewHelper(DefaultLogger)
log.Debug("test debug")
log.Info("test info")
log.Warn("test warn")
log.Error("test error")
```
#### 使用 valuer
```go
logger := DefaultLogger
logger = With(logger, "ts", DefaultTimestamp, "caller", DefaultCaller)
logger.Log(LevelInfo, "msg", "helloworld")
```
#### 同时打印多个 logger
```go
out := log.NewStdLogger(os.Stdout)
err := log.NewStdLogger(os.Stderr)
l := log.With(MultiLogger(out, err))
l.Log(LevelInfo, "msg", "test")
```
#### 使用 context
```go
logger := log.With(NewStdLogger(os.Stdout),
	"trace", Trace(),
)
log := log.NewHelper(logger)
ctx := context.WithValue(context.Background(), "trace_id", "2233")
log.WithContext(ctx).Info("got trace!")
```

#### 使用 filter 过滤日志

如果需要过滤日志中某些不应该被打印明文的字段如 password 等,可以通过 log.NewFilter() 来实现过滤功能

##### 通过 level 过滤日志

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterLevel(log.LevelWarn)))
l.Log(LevelDebug, "msg1", "te1st debug")
l.Debug("test debug")
l.Debugf("test %s", "debug")
l.Debugw("log", "test debug")
l.Warn("warn log")
```
##### 通过 key 过滤日志

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterKey("password")))
l.Debugw("password", "123456")
```

###### 通过 value 过滤日志

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterValue("kratos")))
l.Debugw("name", "kratos")
```

##### 通过 hook func 过滤日志

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterFunc(testFilterFunc)))
l.Debug("debug level")
l.Infow("password", "123456")
func testFilterFunc(level Level, keyvals ...interface{}) bool {
	if level == LevelWarn {
		return true
	}
	for i := 0; i < len(keyvals); i++ {
		if keyvals[i] == "password" {
			keyvals[i+1] = "***"
		}
	}
	return false
}
```

#### 输出日志到stdout

使用自带的 StdLogger 可以创建标准输出日志对象. 通过 NewHelper 构造日志模块，Helper 生成的日志模块可以提供不同等级的日志输出。

```go
logger := log.NewStdLogger()
log := log.NewHelper(logger)
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
log := log.NewHelper(logger)
// Levels
log.Info("some log")
log.Infof("format %s", "some log")
log.Infow("field_name", "some log")
```
### 扩展阅读
#### 使用 Zap 实现 Logger
```go
var _ log.Logger = (*ZapLogger)(nil)

type ZapLogger struct {
	log  *zap.Logger
	Sync func() error
}

// NewZapLogger return ZapLogger
func NewZapLogger(encoder zapcore.EncoderConfig, level zap.AtomicLevel, opts ...zap.Option) *ZapLogger {
	core := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoder),
		zapcore.NewMultiWriteSyncer(
			zapcore.AddSync(os.Stdout),
		), level)
	zapLogger := zap.New(core, opts...)
	return &ZapLogger{log: zapLogger, Sync: zapLogger.Sync}
}

// Log Implementation of logger interface
func (l *ZapLogger) Log(level log.Level, keyvals ...interface{}) error {
	if len(keyvals) == 0 || len(keyvals)%2 != 0 {
		l.log.Warn(fmt.Sprint("Keyvalues must appear in pairs: ", keyvals))
		return nil
	}

	// Zap.Field is used when keyvals pairs appear
	var data []zap.Field
	for i := 0; i < len(keyvals); i += 2 {
		data = append(data, zap.Any(fmt.Sprint(keyvals[i]), fmt.Sprint(keyvals[i+1])))
	}
	switch level {
	case log.LevelDebug:
		l.log.Debug("", data...)
	case log.LevelInfo:
		l.log.Info("", data...)
	case log.LevelWarn:
		l.log.Warn("", data...)
	case log.LevelError:
		l.log.Error("", data...)
	}
	return nil
}
```
