---
id: metrics
title: 指标 Middleware
description: 使用 OpenTelemetry instrument 记录 Kratos v3 client/server 请求指标。
---

安装 v3 OpenTelemetry contrib module；旧 core `middleware/metrics` package 在 v3 中不存在。

```bash
go get github.com/go-kratos/kratos/contrib/otel/v3
```

使用应用的 meter 创建 instrument，再传给 server 或 client middleware：

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

出站 client 应使用 client constant name 和 `metrics.Client`。Server middleware 未传入 instrument 时会直接调用下一个 handler；client middleware 同样只记录非 nil instrument。

## Histogram view

`DefaultSecondsHistogramView(name)` 返回使用相同显式 bucket 的 SDK view。如果需要该 aggregation，应在构造 SDK meter provider 时注册。View 在 provider 构造时影响匹配 instrument；meter 已开始工作后再加入就太晚了。

`EnableOTELExemplar` 设置 `OTEL_GO_X_EXEMPLAR=true` 并返回环境修改错误。由于运行中修改环境是进程全局状态，条件允许时应在启动前通过部署环境配置。

## 放置位置

Server metrics 必须在 transport context 创建后执行；通过 Kratos server option 注册 middleware 时会满足这一点。Middleware 从 transport context 读取 operation 和 kind，并从返回的 Kratos error 得到 code/reason。它在链中的位置决定覆盖哪些 middleware 和 handler 工作。

Provider shutdown 仍是应用代码。Middleware constructor 不会创建、flush 或关闭 exporter。
