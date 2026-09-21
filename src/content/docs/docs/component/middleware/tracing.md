---
id: tracing
title: Tracing
description: Propagate and record OpenTelemetry spans with the Kratos v3 contrib middleware.
---

Tracing moved from core to `github.com/go-kratos/kratos/contrib/otel/v3/tracing`.
The application creates an OpenTelemetry tracer provider and exporter; the
contrib module supplies transport middleware and propagation.

```go
serverTracing := tracing.Server(
	tracing.WithTracerProvider(provider),
	tracing.WithTracerName("todo-service"),
)
clientTracing := tracing.Client(
	tracing.WithTracerProvider(provider),
	tracing.WithTracerName("todo-service"),
)
```

When no provider is passed, the constructors use the global OpenTelemetry
provider. The default tracer name is `kratos`. The default propagator combines
Kratos metadata, W3C baggage, and W3C trace context; use `WithPropagator` only
when the service fleet has selected another compatible policy.

## Server and client behavior

Server middleware extracts parent context from request headers, starts a server
span named with the canonical RPC operation, records request attributes, and
ends the span with the reply or error. Client middleware starts a client span
and injects propagation headers before the outbound call.

Errors are recorded on the span. Kratos error codes are added as
`rpc.status_code`; protobuf reply size is recorded when a reply implements
`proto.Message`. Middleware can only do this when a transport context exists.

## Correlate logs

`TraceID`, `SpanID`, and `TraceAttrs` read the active span context. The current
layout passes `tracing.TraceAttrs` to `log.WithExtractor`, which adds trace and
span IDs to logs written with the request context.

```go
logger := log.NewLogger(
	slog.NewTextHandler(os.Stdout, nil),
	log.WithExtractor(tracing.TraceAttrs),
)
```

Use `InfoContext`/`ErrorContext` with the request context; package helpers that
use a background context cannot recover the active span.

## Shutdown and sampling

Create the provider before transport servers and shut it down after they stop,
allowing a bounded flush interval. Configure resource identity, sampling,
batching, exporter TLS, and credentials in application-owned code. The Kratos
middleware does not choose those policies.
