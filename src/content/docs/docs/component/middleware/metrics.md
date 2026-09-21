---
id: metrics
title: Metrics Middleware
description: Record Kratos v3 client and server request metrics with OpenTelemetry instruments.
---

Install the v3 OpenTelemetry contrib module; the old core
`middleware/metrics` package does not exist in v3.

```bash
go get github.com/go-kratos/kratos/contrib/otel/v3
```

Create instruments from the application's meter, then pass them into the
server or client middleware:

```go
meter := otel.Meter("todo-service")
requests, err := metrics.DefaultRequestsCounter(meter, metrics.DefaultServerRequestsCounterName)
if err != nil {
	return err
}
seconds, err := metrics.DefaultSecondsHistogram(meter, metrics.DefaultServerSecondsHistogramName)
if err != nil {
	return err
}

srv := http.NewServer(http.Middleware(
	metrics.Server(metrics.WithRequests(requests), metrics.WithSeconds(seconds)),
))
```

Use the client constant names and `metrics.Client` for outbound clients. Passing
no instruments makes server middleware call the next handler without recording;
client middleware also records only non-nil instruments.

## Histogram view

`DefaultSecondsHistogramView(name)` returns an SDK view using the same explicit
buckets as the helper. Register the view when constructing the SDK meter
provider if that aggregation is required. A view affects matching instruments
at provider construction time; adding it after meters are active is too late.

`EnableOTELExemplar` sets `OTEL_GO_X_EXEMPLAR=true` and returns the environment
update error. Prefer configuring process environment before startup when
possible, since changing it inside a running process is global state.

## Placement

Install server metrics after transport context has been created; Kratos server
options do this for registered middleware. Middleware reads operation and kind
from the transport context and derives code/reason from returned Kratos errors.
Place it so it measures the middleware and handler work you intend to observe.

Provider shutdown remains application code. A middleware constructor does not
create, flush, or close an exporter.
