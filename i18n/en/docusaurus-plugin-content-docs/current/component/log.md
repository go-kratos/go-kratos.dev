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

### Interface 
Kratos contains only the simplest Log interface for business-adapted log access. When your business logic needs to use custom logs inside the kratos framework, you only need to implement the Log method simply. Kratos logs also provide some log helpful features such as valuer, helper, filter, and so on, which can be implemented directly using the framework's built-in implementations when we need them, or by ourselves.

```go
type Logger interface {
	Log(level Level, keyvals ...interface{}) error
}
```
### Implementation

#### Implement logger
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
#### Implement valuer
```go
func Timestamp(layout string) Valuer {
	return func(context.Context) interface{} {
		return time.Now().Format(layout)
	}
}
```
### Usage

#### Print log with Logger
```go
logger := log.DefaultLogger
logger.Log(LevelInfo, "key1", "value1")
```
#### Print log with Helper
```go
log := log.NewHelper(DefaultLogger)
log.Debug("test debug")
log.Info("test info")
log.Warn("test warn")
log.Error("test error")
```
#### Add some default fields with Valuer
```go
logger := DefaultLogger
logger = With(logger, "ts", DefaultTimestamp, "caller", DefaultCaller)
logger.Log(LevelInfo, "msg", "helloworld")
```
#### Log to multiple loggers
```go
out := log.NewStdLogger(os.Stdout)
err := log.NewStdLogger(os.Stderr)
l := log.With(MultiLogger(out, err))
l.Log(LevelInfo, "msg", "test")
```
#### Bind context to logger
```go
logger := log.With(NewStdLogger(os.Stdout),
	"trace", Trace(),
)
log := log.NewHelper(logger)
ctx := context.WithValue(context.Background(), "trace_id", "2233")
log.WithContext(ctx).Info("got trace!")
```

#### Log Filtering

If you need to filter some fields in the log that should not be printed in plain text, such as password, you can do so by log. NewFilter() implements filtering.

##### Filter by level

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterLevel(log.LevelWarn)))
l.Log(LevelDebug, "msg1", "te1st debug")
l.Debug("test debug")
l.Debugf("test %s", "debug")
l.Debugw("log", "test debug")
l.Warn("warn log")
```
##### Filter by key

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterKey("password")))
l.Debugw("password", "123456")
```

##### Filter by value

```go
l := log.NewHelper(log.NewFilter(log.DefaultLogger, log.FilterValue("kratos")))
l.Debugw("name", "kratos")
```

##### Filter with hook function

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

#### Print to STDOUT
You can create standard output log objects using the StdLogger that comes with it. With the NewHelper log module, Helper generates log modules that provide different levels of log output.

```go
logger := log.NewStdLogger()
log := log.NewHelper(logger)
// Levels
log.Info("some log")
log.Infof("format %s", "some log")
log.Infow("field_name", "some log")
```

#### Print to fluentd

Import fluent sdk

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
### Advanced Usage
#### Implement Zap Logger
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
