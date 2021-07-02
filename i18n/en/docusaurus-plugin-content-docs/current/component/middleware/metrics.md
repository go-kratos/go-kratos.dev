---
id: metrics
title: Metrics
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

Metrics middleware is used to monitor performance metrics for services, counting request time and request counts.

### Configuration

Two configuration methods are available in metrics middleware `WithSeconds()` and `WithRequests()`。

#### `WithSeconds()`
```go
func WithSeconds(c metrics.Observer) Option {
	return func(o *options) {
		o.seconds = c
	}
}
```
The `Observer` histogram used to set up the metrics middleware statistics request.

#### `WithRequests()`

```go
func WithRequests(c metrics.Counter) Option {
	return func(o *options) {
		o.requests = c
	}
}
```

The `Counter` counter used to set the metrics middleware statistics request count.

### Usage

#### Prometheus
```go
// https://github.com/go-kratos/kratos/tree/main/examples/metrics
_metricSeconds = prometheus.NewHistogramVec(prometheus.HistogramOpts{
	Namespace: "server",
	Subsystem: "requests",
	Name:      "duration_ms",
	Help:      "server requests duration(ms).",
	Buckets:   []float64{5, 10, 25, 50, 100, 250, 500, 1000},
}, []string{"kind", "operation"})

_metricRequests = prometheus.NewCounterVec(prometheus.CounterOpts{
	Namespace: "client",
	Subsystem: "requests",
	Name:      "code_total",
	Help:      "The total number of processed requests",
}, []string{"kind", "operation", "code", "reason"})
	
prometheus.MustRegister(_metricSeconds, _metricRequests)

httpSrv.Handle("/metrics", promhttp.Handler())
```
#### To configure metrics in servers

```go
// grpc sever
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		metrics.Server(
			metrics.WithSeconds(prom.NewHistogram(_metricSeconds)),
			metrics.WithRequests(prom.NewCounter(_metricRequests)),
		),
	),
)

// http server
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		metrics.Server(
			metrics.WithSeconds(prom.NewHistogram(_metricSeconds)),
			metrics.WithRequests(prom.NewCounter(_metricRequests)),
		),
	),
)
```

#### To configure metrics in clients

```go
// grpc client
conn, err := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("127.0.0.1:9000"),
	grpc.WithMiddleware(
		metrics.Client(
			metrics.WithSeconds(prom.NewHistogram(_metricSeconds)),
			metrics.WithRequests(prom.NewCounter(_metricRequests)),
		),
	),
)

// http client
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("127.0.0.1:8000"),
	http.WithMiddleware(
		metrics.Client(
			metrics.WithSeconds(prom.NewHistogram(_metricSeconds)),
			metrics.WithRequests(prom.NewCounter(_metricRequests)),
		),
	),
)
```



### References

* https://prometheus.io/docs/concepts/metric_types/
* https://github.com/go-kratos/kratos/tree/main/examples/metrics
