---
id: selector
title: 路由与负载均衡
description: 路由与负载均衡主要的接口是 Selector，但在同目录下也提供了一个默认的 Selector 实现，该实现可以通过替换 NodeBuilder、Filter、Balancer 来分别实现节点权重计算、路由过滤、负载均衡算法的可插拔
keywords:
  - Go
  - Kratos
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
  - Balancer
  - Route
  - Selector
---

## 接口实现

路由与负载均衡主要的接口是 Selector，在同目录下也提供了一个默认的 Selector 实现，该实现可以通过替换 **NodeBuilder**、**Filter**、**Balancer** 来分别实现节点权重计算算法、服务路由过滤策略、负载均衡算法的可插拔

```go
type Selector interface {
  // Selector 内部维护的服务节点列表通过 Rebalancer 接口来更新
  Rebalancer

  // Select nodes
  // if err == nil, selected and done must not be empty.
  Select(ctx context.Context, opts ...SelectOption) (selected Node, done DoneFunc, err error)
}

// 通过 Rebalancer 实现服务节点变更感知
type Rebalancer interface {
  Apply(nodes []Node)
}
```

已支持的实现：

- [wrr](https://github.com/go-kratos/kratos/tree/main/selector/wrr) : Weighted round robin (Kratos Client 内置默认算法)
- [p2c](https://github.com/go-kratos/kratos/tree/main/selector/p2c) : Power of two choices
- [random](https://github.com/go-kratos/kratos/tree/main/selector/random) : Random

## 使用方式

### HTTP Client

```go
import	"github.com/go-kratos/kratos/v2/selector/p2c"
import	"github.com/go-kratos/kratos/v2/selector/filter"

// 创建路由 Filter：筛选版本号为"2.0.0"的实例
filter :=  filter.Version("2.0.0")
// 创建 P2C 负载均衡算法 Selector，并将路由 Filter 注入
selector.SetGlobalSelector(wrr.NewBuilder)

hConn, err := http.NewClient(
  context.Background(),
  http.WithEndpoint("discovery:///helloworld"),
  http.WithDiscovery(r),
  http.WithNodeFilter(filter)
)
```

### gRPC Client

```go
import	"github.com/go-kratos/kratos/v2/selector/p2c"
import	"github.com/go-kratos/kratos/v2/selector/filter"

// 创建路由 Filter：筛选版本号为"2.0.0"的实例
filter :=  filter.Version("2.0.0")
// 由于 gRPC 框架的限制，只能使用全局 balancer name 的方式来注入 selector
selector.SetGlobalSelector(wrr.NewBuilder)

conn, err := grpc.DialInsecure(
  context.Background(),
  grpc.WithEndpoint("discovery:///helloworld"),
  grpc.WithDiscovery(r),

  // 通过 grpc.WithFilter 注入路由 Filter
  grpc.WithNodeFilter(filter),
)
```
