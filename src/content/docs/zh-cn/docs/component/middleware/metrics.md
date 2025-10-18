---
id: metrics
title: 监控
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

Metrics 中间件用于实现服务的性能指标监控，统计了请求耗时和请求计数。

### 配置

Metrics 中间件中提供了两个配置方法 `WithSeconds()` 和 `WithRequests()`。

#### `WithSeconds()`
```go
func WithSeconds(c metrics.Observer) Option {
	return func(o *options) {
		o.seconds = c
	}
}
```
用于设置 metrics 中间件统计请求耗时的 `Observer` 直方图。

#### `WithRequests()`

```go
func WithRequests(c metrics.Counter) Option {
	return func(o *options) {
		o.requests = c
	}
}
```

用于设置 metrics 中间件统计请求计数的 `Counter` 计数器。

### 使用方式 (kratos < 2.8.0)

#### 使用 prometheus
```go
// 详见 https://github.com/go-kratos/examples/tree/main/metrics

_metricSeconds = prometheus.NewHistogramVec(prometheus.HistogramOpts{
	Namespace: "server",
	Subsystem: "requests",
	Name:      "duration_sec",
	Help:      "server requests duratio(sec).",
	Buckets:   []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.250, 0.5, 1},
}, []string{"kind", "operation"})

_metricRequests = prometheus.NewCounterVec(prometheus.CounterOpts{
	Namespace: "client",
	Subsystem: "requests",
	Name:      "code_total",
	Help:      "The total number of processed requests",
}, []string{"kind", "operation", "code", "reason"})
	
prometheus.MustRegister(_metricSeconds, _metricRequests)
```
#### Server 中使用 metrics

```go
import (
	prom "github.com/go-docs/docs/contrib/metrics/prometheus/v2"
)

// grpc service
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		metrics.Server(
			metrics.WithSeconds(prom.NewHistogram(_metricSeconds)),
			metrics.WithRequests(prom.NewCounter(_metricRequests)),
		),
	),
)

// http service
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		metrics.Server(
			metrics.WithSeconds(prom.NewHistogram(_metricSeconds)),
			metrics.WithRequests(prom.NewCounter(_metricRequests)),
		),
	),
)
httpSrv.Handle("/metrics", promhttp.Handler())
```

#### Client 中使用 metrics

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

### 使用方式 (kratos >= 2.8.0)
kratos 从 [v2.8.0](https://github.com/go-kratos/kratos/releases/tag/v2.8.0) 开始使用 otel.Metrics，需要用以下方法 export 数据到 prometheus。

#### 使用 prometheus
```go
import (
	"github.com/go-docs/docs/v2/middleware/metrics"
	"go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

// Detailed reference https://github.com/go-kratos/examples/tree/main/metrics
func init() {
	exporter, err := prometheus.New()
	if err != nil {
		panic(err)
	}
	provider := sdkmetric.NewMeterProvider(sdkmetric.WithReader(exporter))
	meter := provider.Meter(Name)

	_metricRequests, err = metrics.DefaultRequestsCounter(meter, metrics.DefaultServerRequestsCounterName)
	if err != nil {
		panic(err)
	}

	_metricSeconds, err = metrics.DefaultSecondsHistogram(meter, metrics.DefaultServerSecondsHistogramName)
	if err != nil {
		panic(err)
	}
}
```

#### Server 中使用 metrics
```go
import (
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// grpc service
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		metrics.Server(
			metrics.WithSeconds(_metricSeconds),
			metrics.WithRequests(_metricRequests),
		),
	),
)

// http service
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		metrics.Server(
			metrics.WithSeconds(_metricSeconds),
			metrics.WithRequests(_metricRequests),
		),
	),
)
httpSrv.Handle("/metrics", promhttp.Handler())
```

#### Client 中使用 metrics
```go
// grpc client
conn, err := grpc.DialInsecure(
	context.Background(),
	grpc.WithEndpoint("127.0.0.1:9000"),
	grpc.WithMiddleware(
		metrics.Client(
			metrics.WithSeconds(_metricSeconds),
			metrics.WithRequests(_metricRequests),
		),
	),
)

// http client
conn, err := http.NewClient(
	context.Background(),
	http.WithEndpoint("127.0.0.1:8000"),
	http.WithMiddleware(
		metrics.Client(
			metrics.WithSeconds(_metricSeconds),
			metrics.WithRequests(_metricRequests),
		),
	),
)
```

### References
* https://prometheus.io/docs/concepts/metric_types/
* https://github.com/go-kratos/examples/tree/main/metrics
* https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus
