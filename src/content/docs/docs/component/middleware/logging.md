---
id: logging
title: Logging Middleware
description: Record completed Kratos v3 transport calls with log/slog.
---

Logging middleware emits one structured record after each handler completes.
It accepts `*slog.Logger`; passing `nil` uses `slog.Default()`.

```go
logger := log.NewLogger(log.NewHandler(log.WithWriter(os.Stdout)))
srv := http.NewServer(http.Middleware(logging.Server(logger)))
```

Use `logging.Server` for incoming calls and `logging.Client` for outbound
calls. Both read normalized transport information and Kratos errors.

## Recorded attributes

Records include side (`client` or `server`), transport kind, canonical RPC
operation, formatted request arguments, HTTP-equivalent status code, error
reason, and latency in seconds. Failures also include the error and its
formatted stack text. Successful calls log at info; calls returning an error
log at error.

Request formatting follows this order:

1. Call `Redact() string` when the request implements `logging.Redacter`.
2. Otherwise call `String()` for `fmt.Stringer` values, which includes generated
   protobuf messages.
3. Otherwise format the value with `%+v`.

Implement `Redact` on application request types that may contain secrets.
Logger key filters can provide a second layer, but they cannot redact text that
has already been flattened into the `args` string.

## Context attributes

Attach request values through `log.ContextWithAttrs`, then write application
logs with the same context. A logger created by `log.NewLogger` merges those
attributes into handled records.

Keep logging inside metadata/tracing middleware when it needs values those
middlewares add to the context. Place logging outside recovery when a recovered
panic should return to logging as an error and produce a completed-call record.

The v2 `log.Logger`, `log.Helper`, and `log.NewStdLogger` APIs are not compatible
with v3. See [Logging](/docs/component/log/) for handler configuration.
