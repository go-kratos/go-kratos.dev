---
id: logging
title: Logging
---

### Interface
To make it easy to integrate with various of logging libraries, the `Logger` interface only requires the `Print` method. You could either use the logger that we provided, or implement the Logger interface by your own.


```go
type Logger interface {
	Print(pairs ...interface{})
}
```

### Usage

#### Print to Standard Output
You could use `NewHelper` create a `log.Helper` to wrap the logger struct, the helper will provide many log methods of different logging levels.

```go
logger := log.NewStdLogger()
log := log.NewHelper("module_name", logger)
// Levels
log.Info("some log")
log.Infof("format %s", "some log")
log.Infow("field_name", "some log")
```

#### Print to Fluentd

To print to fluentd, you could "github.com/go-kratos/fluent".

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

#### Logging middleware

To enable logging information of every requests, you could add `logging.Server()` in `http.ServerOption`.


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
