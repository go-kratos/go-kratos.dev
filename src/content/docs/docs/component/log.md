---
id: log
title: Logging
---

Kratos v3 uses the standard-library `log/slog` API. Construct a `*slog.Logger` with `log.NewLogger`, then pass it to the application and middleware. This replaces the v2 `log.Logger` and `log.Helper` interfaces.

```go
logger := log.NewLogger(
	slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}),
	log.WithFilter(log.FilterKey("password")),
).With(slog.String("service.name", "example"))

app := kratos.New(kratos.Name("example"), kratos.Logger(logger))
```

## Configure a handler

`log.NewHandler` builds a text or JSON handler using Kratos options. It defaults to text output on standard output. Set the format, writer, minimum level, source location, and any `slog.HandlerOptions.ReplaceAttr` callback without constructing an `slog.Handler` yourself.

```go
level := new(slog.LevelVar)
level.Set(slog.LevelDebug)

logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.JSONFormat),
	log.WithWriter(os.Stdout),
	log.WithLevel(level),
	log.WithAddSource(true),
))
```

`log.ParseLevel` accepts the standard slog level names. Store application-wide fields on a derived logger with `logger.With(...)`, or use `log.With(...)` after calling `log.SetDefault(logger)`.

```go
logger = logger.With(
	slog.String("service.name", "example"),
	slog.String("service.version", version),
)
logger.Info("server started", "address", ":8000")
```

## Filter sensitive values

`FilterKey` redacts attribute values by leaf key or dotted group path. Wrap it with `log.WithFilter` when creating a Kratos handler. A custom `FilterFunc` can drop an entire record by returning `false`.

```go
logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.JSONFormat),
	log.WithFilter(log.FilterKey("password", "authorization.token")),
))
logger.Info("login", "user", "alice", "password", "secret")
```

Filtering protects output, but it does not make storing credentials in request objects safe. Prefer not to log them at all.

## Request-scoped attributes

`log.ContextWithAttrs` attaches `slog.Attr` values to a context. Loggers made with `NewLogger` or `NewHandler` add those values to records handled with that context. `log.AttrsFromContext` returns a copy of the stored attributes.

```go
ctx = log.ContextWithAttrs(ctx,
	slog.String("request.id", requestID),
	slog.String("trace.id", traceID),
)
logger.InfoContext(ctx, "creating order", "order.id", orderID)
```

Use standard slog methods (`Debug`, `Info`, `Warn`, `Error`) or the package helpers (`log.InfoContext`, `log.ErrorContext`) consistently. Pass this logger to `logging.Server(logger)` and `logging.Client(logger)` to log completed transport calls.

## OpenTelemetry

Kratos core does not configure an OpenTelemetry log exporter. The optional integration is `github.com/go-kratos/kratos/contrib/otel/v3/log`; add it only when the application has an OpenTelemetry logging pipeline. The former `Logger`, `Helper`, `Valuer`, and `NewStdLogger` APIs are v2 APIs and must not be mixed with v3 `slog` code.