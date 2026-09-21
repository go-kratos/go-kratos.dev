---
id: recovery
title: Recovery
---

`recovery.Recovery()` converts a panic in a handler into an error and keeps the server process alive. By default it returns `recovery.ErrUnknownRequest`.

```go
srv := grpc.NewServer(grpc.Middleware(
    recovery.Recovery(recovery.WithLogger(logger)),
))
```

The logger must be `*slog.Logger`. Use `recovery.WithHandler(func(ctx context.Context, req, err any) error { ... })` to choose the error returned after a panic. The default handler returns `ErrUnknownRequest`; a custom handler's return value replaces it, including `nil`.

Normally return a non-nil public error. Returning `nil` makes the call complete
with no error and a nil reply, which can hide the failure from clients and
metrics. The custom handler context contains `recovery.Latency{}` as a
`float64` number of elapsed seconds when reporting needs it.

## Production behavior

Recovery always logs the recovered value, request, and current goroutine stack through its logger. Use a custom handler for reporting or classification, then return a safe Kratos error. Never expose the panic value or stack trace to an HTTP/gRPC client.

Place recovery inside logging if completion logs should record the converted
error, and outside middleware whose panics it must catch. Recovery covers only
the middleware and handler nested inside it.

Recovery is the final safeguard, not normal control flow. Fix panic causes and add tests; resources partially mutated before a panic may still require application-specific cleanup or compensating logic.
