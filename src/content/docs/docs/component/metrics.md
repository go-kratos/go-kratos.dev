---
id: metrics
title: Metrics
description: Configure OpenTelemetry metrics for a Kratos v3 service.
---

Kratos v3 core has no metrics facade or exporter. Request instrumentation lives
in the independent `github.com/go-kratos/kratos/contrib/otel/v3/metrics` module
and uses OpenTelemetry metric instruments supplied by the application.

## Responsibilities

The application must construct and shut down its OpenTelemetry SDK meter
provider, reader, and exporter. The Kratos contrib middleware only records
request count and duration around HTTP/gRPC handlers. Export intervals,
temporality, resource attributes, endpoint authentication, and retry policy
belong to the SDK/exporter configuration.

Initialize the provider before servers, install it globally or pass its meter
to instrument constructors, and flush/shut it down after transports stop. Treat
provider startup errors as application startup failures.

## Instruments and labels

The contrib package supplies helpers for an `Int64Counter` and
`Float64Histogram`. Its default names are:

| Side | Counter | Duration histogram |
| --- | --- | --- |
| Server | `server_requests_code_total` | `server_requests_seconds` |
| Client | `client_requests_code_total` | `client_requests_seconds` |

Counters record `kind`, `operation`, HTTP-equivalent `code`, and Kratos error
`reason`. Histograms record `kind` and `operation`; duration is in seconds. The
provided histogram helper uses explicit boundaries from 5 ms through 1 s.

Operation names come from generated RPC descriptors, such as
`/todo.v1.TodoService/GetTodo`, so they have bounded cardinality. Do not add
request IDs, user IDs, raw URLs, or unbounded error messages as metric labels.

## Export and dashboards

Choose Prometheus, OTLP, or another exporter supported by OpenTelemetry. Kratos
does not select or configure one by default. Keep endpoints and credentials in
runtime configuration, and keep stable instrument names when dashboards and
alerts depend on them.

See [Metrics Middleware](/docs/component/middleware/metrics/) for construction
and the [metrics package](https://github.com/go-kratos/kratos/tree/main/contrib/otel/metrics)
for its exported API.
