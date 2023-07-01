---
id: metrics
title: 监控接口
description: Kratos 暴露了三种监控接口，分别是 Counter, Gauge, Observer
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

### 接口实现

Kratos 暴露了三种监控接口，分别是 Counter, Gauge, Observer。

#### Counter

```go

type Counter interface {
	With(lvs ...string) Counter
	Inc()
	Add(delta float64)
}
```



Counter 是最简单的计数器，对外提供了Inc, Add两个方法。只能用于计数的增加。通常用于统计服务的错误数，请求qps。

#### Gauge

```go
type Gauge interface {
	With(lvs ...string) Gauge
	Set(value float64)
	Add(delta float64)
	Sub(delta float64)
}
```

 Gauge是个状态指示器，用于记录服务当前的状态，状态值可以随着时间增加或减少。通常用于监控服务当前的cpu使用率，内存使用量等。

#### Observer

```go
type Observer interface {
	With(lvs ...string) Observer
	Observe(float64)
}
```

Observer属于比较复杂的监控指标，对比以上两个提供了更多额外的信息，可以用于观察统计总值，数量以及分位百分比。在Prometheus中，对应了**Histogram** 和**Summary**的实现。其中Histogram 直方图用于记录不同分桶的数量。比如不同请求耗时区间的请求数，用于指示将指标保存到了多个分桶，因此Histogram几乎无开销。Summary则记录了不同分位的值，基于概率采样计算，比如90% 99% 分位耗时，由于需要进行额外的计算，因此对于服务有一定的开销。

### References

* https://prometheus.io/docs/concepts/metric_types/
* https://github.com/go-kratos/examples/tree/main/metrics
