---
id: metrics
title: Metrics
---

### Interface

`Counter`, `Gauge`, `Observer` are the three major metric interface of kratos.

### Counter

```go

type Counter interface {
	With(lvs ...string) Counter
	Inc()
	Add(delta float64)
}
```



Counter is just a standard counter. It should expose `Inc` and `Add` method. This counter can only count the increasing. It usually used at counting the numbers of errors or QPS.

#### Gauge

```go
type Gauge interface {
	With(lvs ...string) Gauge
	Set(value float64)
	Add(delta float64)
	Sub(delta float64)
}
```

Gauge is a status indicator. It records the current status of service. The value of gauge may increase or decrease. It usually used at monitoring CPU usage or Mem usage etc.

#### Observer

```go
type Observer interface {
	With(lvs ...string) Observer
	Observe(float64)
}
```
Observer is a kind of more complex metric. It provides more extra information for monitoring sums, quantities and percentages. It is corresponding to Prometheus'**Histogram** and **Summary**. The Histogram is used for record the counts in different buckets, such as the count of requests in different latency ranges. The Histogram is efficient. Summary records the percentiles, because of extra computation, it maybe slower.


### Usage

#### Metrics in server

```go
import (
	"github.com/go-kratos/kratos/v2/middleware"
	kmetrics "github.com/go-kratos/prometheus/metrics"
	"github.com/go-kratos/kratos/v2/middleware/metrics"
	"github.com/go-kratos/kratos/v2/transport/http"
	"github.com/prometheus/client_golang/prometheus"
)
func NewHTTPServer(c *conf.Server) *http.Server {
    // for prometheus 
	counter := prometheus.NewCounterVec(prometheus.CounterOpts{Name: "kratos_counter"}, []string{"server", "qps"})
	var opts = []http.ServerOption{
		http.Middleware(
			middleware.Chain(
				recovery.Recovery(),
				metrics.Server(metrics.WithRequests(kmetrics.NewCounter(counter))),
			),
		),
	}

```

#### Metrics in Client

```go
import (
	"context"

	"github.com/go-kratos/kratos/v2/middleware"
	kmetrics "github.com/go-kratos/prometheus/metrics"

	"github.com/go-kratos/kratos/v2/middleware/metrics"
	"github.com/go-kratos/kratos/v2/transport/http"
	"github.com/prometheus/client_golang/prometheus"
)
func useClient() {
	counter := prometheus.NewCounterVec(prometheus.CounterOpts{Name: "kratos_counter"},
		[]string{"client", "qps"})
	client, _ := http.NewClient(context.Background(),
		http.WithMiddleware(metrics.Client(metrics.WithRequests(kmetrics.NewCounter(counter)))))
	// ...
}
```



### References

* https://prometheus.io/docs/concepts/metric_types/
