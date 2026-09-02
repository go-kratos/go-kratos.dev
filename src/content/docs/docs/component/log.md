---
id: log
title: Logger
description: Kratos v3 logging is built on Go's standard library log/slog with structured attributes, composable handlers, and OpenTelemetry integration.
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

Logs help you observe program behavior, diagnose failures, and configure alerts. Kratos v3 uses Go's standard [`log/slog`](https://pkg.go.dev/log/slog) model, so log records are structured and can be handled by the standard library or by a custom handler.

## Design

The v3 logging package has two main building blocks:

- `slog.Logger` creates log records and provides methods such as `Info`, `Warn`, and `Error`.
- `slog.Handler` encodes and writes records. A handler can write text or JSON, apply a level threshold, and be replaced by an observability backend.

Kratos adds a small builder around these standard-library types:

- `log.NewHandler` creates a handler with Kratos defaults: text output to stderr at `Info` level, plus attributes attached with `ContextWithAttrs`.
- `log.NewLogger` wraps an existing handler and applies Kratos decorators such as context extraction and filtering.
- The package-level helpers use the logger registered with `log.SetDefault`.

This keeps application code dependent on `*slog.Logger`, while the handler remains replaceable for local output, JSON collection, or an observability platform.

## Basic usage

Create a handler, wrap it in a logger, and register it as the package default when the application needs global helpers:

```go
package main

import (
	"context"
	"os"

	"github.com/go-kratos/kratos/v3/log"
)

func main() {
	logger := log.NewLogger(log.NewHandler(
		log.WithWriter(os.Stdout),
		log.WithFormat(log.FormatJSON),
	))
	log.SetDefault(logger)

	log.Info("service started", "service.name", "helloworld")
	log.InfoContext(context.Background(), "request completed", "request_id", "req-1")
}
```

For a handler created directly with the standard library, use `slog.New`:

```go
handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
	Level: slog.LevelInfo,
})
logger := slog.New(handler)
logger.Info("service started", "service.name", "helloworld")
```

## Global logger

The package-level functions mirror the corresponding `slog.Logger` methods. The first argument is the message, followed by key/value pairs or typed `slog.Attr` values:

```go
log.Debug("cache miss", "key", key)
log.Info("user created", slog.String("user_id", userID))
log.Warn("retrying request", "attempt", attempt)
log.Error("request failed", "error", err)
log.InfoContext(ctx, "request completed", "request_id", requestID)
```

Call `log.SetDefault` once during application initialization to change the logger used by these helpers. `log.Default` returns the current default logger.

```go
logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.FormatJSON),
	log.WithLevel(log.LevelDebug),
))
log.SetDefault(logger)
```

There is no v3 `DefaultLogger`, `SetLogger`, or `NewHelper` API. Keep a `*slog.Logger` in components that need an explicit dependency instead of relying on global state.

## Builder and attributes

`log.NewHandler` is useful when the application owns the output destination. `log.NewLogger` is useful when the application already has a `slog.Handler`, or when it wants to add Kratos filtering and context extraction.

```go
logger := log.NewLogger(
	log.NewHandler(
		log.WithWriter(os.Stdout),
		log.WithFormat(log.FormatJSON),
		log.WithLevel(log.LevelDebug),
		log.WithAddSource(true),
	),
).With(
		slog.String("service.name", serviceName),
		slog.String("service.version", version),
)

logger.Info("service ready", "addr", address)
```

Use `With` to attach attributes to every record from a logger. Use `WithGroup` to keep related attributes together:

```go
requestLogger := logger.WithGroup("request")
requestLogger.Info("finished", "id", requestID, "latency_ms", latency)
```

Typed attributes such as `slog.String`, `slog.Int`, and `slog.Any` make the intended value type explicit. Key/value pairs are convenient for simple records; `LogAttrs` is useful when a record is assembled from a slice of attributes:

```go
logger.LogAttrs(ctx, log.LevelInfo, "user created",
		slog.String("user_id", userID),
		slog.String("source", "api"),
)
```

## Context attributes

Attach request-scoped attributes to a context with `ContextWithAttrs`. A logger returned by `log.NewLogger` or a handler returned by `log.NewHandler` extracts these attributes automatically for context-aware log calls:

```go
ctx = log.ContextWithAttrs(ctx,
		slog.String("request_id", requestID),
		slog.String("trace_id", traceID),
)

logger.InfoContext(ctx, "handling request")
```

Context attributes are added only to calls that receive that context. Use `With` for attributes that are fixed for the lifetime of a logger, such as service name and version.

For other context data, implement an `log.Extractor` and pass it with `log.WithExtractor`:

```go
logger := log.NewLogger(
	log.NewHandler(),
	log.WithExtractor(func(ctx context.Context) []slog.Attr {
		return []slog.Attr{slog.String("tenant_id", tenantIDFromContext(ctx))}
	}),
)
```

## Filtering and redaction

Use `log.WithFilter` when records need to be redacted or dropped before they reach the underlying handler.

`log.FilterKey` replaces values for matching attribute keys with `***`. It accepts leaf keys such as `password` and dotted paths such as `user.password`:

```go
logger := log.NewLogger(
	log.NewHandler(log.WithFormat(log.FormatJSON)),
	log.WithFilter(log.FilterKey("password", "token", "user.password")),
)

logger.Info("login", "username", username, "password", password)
```

`log.FilterFunc` receives the record after key redaction. Return `true` to drop the record:

```go
logger := log.NewLogger(
	log.NewHandler(),
	log.WithFilter(log.FilterFunc(func(_ context.Context, record slog.Record) bool {
		return record.Level < log.LevelInfo
	})),
)
```

Filtering is part of the logger configuration. Apply it to every logger that can receive sensitive data, including loggers passed to request middleware.

## Levels and output

The default handler writes text to stderr and emits records at `Info` level or above. Configure the writer, format, level, source location, and attribute replacement with builder options:

```go
logger := log.NewLogger(log.NewHandler(
	log.WithWriter(os.Stdout),
	log.WithFormat(log.FormatJSON),
	log.WithLevel(log.LevelDebug),
	log.WithAddSource(true),
	log.WithReplaceAttr(func(groups []string, attr slog.Attr) slog.Attr {
		if attr.Key == "password" {
			return slog.String(attr.Key, "***")
		}
		return attr
	}),
))
```

Available Kratos level aliases are `LevelDebug`, `LevelInfo`, `LevelWarn`, `LevelError`, and `LevelFatal`. The package-level convenience methods are `Debug`, `Info`, `Warn`, and `Error`; use `Log` or `LogAttrs` when an explicit level is needed.

## Request logging middleware

The `middleware/logging` package records server and client request details, including the transport kind, operation, status code, and latency. It accepts a `*slog.Logger`:

```go
import (
	kratoshttp "github.com/go-kratos/kratos/v3/transport/http"
	"github.com/go-kratos/kratos/v3/middleware/logging"
)

srv := kratoshttp.NewServer(
	kratoshttp.Middleware(logging.Server(logger)),
)
```

Use `logging.Client(logger)` with the HTTP or gRPC client middleware options to record outgoing requests. Request values should be redacted with a `Redact() string` method where appropriate, and the logger should also be configured with `FilterKey` for sensitive attributes.

## OpenTelemetry logs

The OpenTelemetry bridge is an optional contrib module. It converts `slog` records to OpenTelemetry Logs and adds trace correlation attributes when a valid span is present in the context:

```go
import (
	otellog "github.com/go-kratos/kratos/contrib/otel/v3/log"
	"github.com/go-kratos/kratos/v3/log"
)

logger := log.NewLogger(otellog.NewHandler("helloworld"))
log.SetDefault(logger)
```

Configure an OpenTelemetry `LoggerProvider` or other bridge settings with `otellog.WithLoggerProvider`, `otellog.WithSchemaURL`, `otellog.WithSource`, and `otellog.WithVersion`:

```go
logger := log.NewLogger(
	otellog.NewHandler("helloworld", otellog.WithLoggerProvider(provider)),
	log.WithFilter(log.FilterKey("password")),
).With(slog.String("service.name", "helloworld"))
```

The contrib import path is `github.com/go-kratos/kratos/contrib/otel/v3/log`; the core logger import path is `github.com/go-kratos/kratos/v3/log`.

## kratos-layout

The v3 project template initializes a `*slog.Logger` at the application entry point and injects it into the service layers. A typical setup is:

```go
logger := log.NewLogger(log.NewHandler(
	log.WithWriter(os.Stdout),
	log.WithFormat(log.FormatJSON),
)).With(
		slog.String("service.id", id),
		slog.String("service.name", Name),
		slog.String("service.version", Version),
)
```

Inject the logger directly into a service and use context-aware methods:

```go
func NewGreeterService(uc *GreeterUsecase, logger *slog.Logger) *GreeterService {
	return &GreeterService{uc: uc, log: logger}
}

func (s *GreeterService) SayHello(ctx context.Context, in *v1.HelloRequest) (*v1.HelloReply, error) {
	s.log.InfoContext(ctx, "SayHello received", "name", in.GetName())
	return &v1.HelloReply{Message: "Hello " + in.GetName()}, nil
}
```

See the [kratos-layout](https://github.com/go-kratos/kratos-layout) repository for the current generated project structure.

## Migrating from v2

| v2 | v3 |
| --- | --- |
| `github.com/go-kratos/kratos/v2/log` | `github.com/go-kratos/kratos/v3/log` |
| `log.Logger` and `log.NewHelper` | `*slog.Logger` and `slog.Handler` |
| `log.DefaultLogger` and `log.NewStdLogger` | `log.NewHandler` and `log.NewLogger` |
| `log.SetLogger` | `log.SetDefault` |
| `Infof`, `Errorf`, `Infow` | `Info`, `Error`, and typed `slog.Attr` values |
| `Valuer` | `Logger.With`, `Logger.WithGroup`, or `ContextWithAttrs` |
| `FilterLevel` and `FilterValue` | `WithLevel` and `FilterKey` |

The v3 API follows `log/slog`, so existing handlers can be reused when they implement `slog.Handler`. Update dependencies and imports together, then check that sensitive fields are covered by the new handler configuration.
