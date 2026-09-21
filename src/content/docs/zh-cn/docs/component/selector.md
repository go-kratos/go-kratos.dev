---
id: selector
title: 路由与负载均衡
---

`selector.Selector` 从发现到的服务节点中选择一个，并返回完成回调。核心包含加权轮询（`selector/wrr`）、二选一（`selector/p2c`）和随机（`selector/random`）策略。

## 接口实现与内置策略

selector 通过 rebalancer 接收节点，在 `Select` 中选择节点，并返回选中节点与完成回调。默认 transport 集成从 discovery 更新节点并提供 operation context。`selector/wrr` 提供加权轮询，`selector/p2c` 与 `selector/random` 提供其他策略。应根据可观测的服务行为选择算法，而不是为了形式替换它。

## 在 client 中使用

创建 HTTP/gRPC client 时传入 discovery endpoint 与 `WithDiscovery`，需要将 request 路由到兼容子集时添加 node filter。endpoint 必须使用 discovery scheme，例如 `discovery:///orders`。直接 endpoint 不涉及 discovery 或 selector 负载均衡。

在 transport client 中使用 `http.WithNodeFilter(...)` 或 `grpc.WithNodeFilter(...)`，可按版本、metadata 或其他路由规则选择实例。client 会组合 discovery、endpoint、selector 和 filter options；endpoint 必须使用 discovery scheme。`selector.WithNodeFilter` 是直接调用 selector 时使用的低层 select-call option。只有直接实现 selector 或自定义 client 集成时才需要调用 selector 返回的完成回调。

```go
conn, err := http.NewClient(ctx,
	http.WithEndpoint("discovery:///orders"),
	http.WithDiscovery(discovery),
	http.WithNodeFilter(filter.Version("v3.0.0")),
)
```

## 路由策略

node filter 在负载均衡前缩小候选集。将其用于明确的兼容性规则（如版本或区域），而不是将缺少实例隐式回退。使路由 key 在日志和 metrics 中可观测，方便诊断空候选集。

标准 transport client 负责 discovery 更新和 selector 调用。只有服务需要全进程一致策略时才自定义 global selector；否则将路由策略保持在拥有 client 构造的代码附近。自定义 selector 必须处理空节点列表，并且对选中节点的完成回调恰好调用一次。

`DoneInfo` 会把 reply metadata 和错误结果报告给所选 node。Adaptive balancer 依赖这个 completion signal，漏调或调用两次都会破坏其观测。没有可选 node 时，标准错误为 `selector.ErrNoAvailable`。
