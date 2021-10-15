---
id: selector
title: 路由与负载均衡
description: 路由与负载均衡主要的接口是Selector，但在同目录下也提供了一个默认的Selector实现，该实现可以通过替换NodeBuilder、Filter、Balancer和来分别实现节点权重计算、路由过滤、负载均衡算法的可插拔
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
### 接口实现 

路由与负载均衡主要的接口是Selector，在同目录下也提供了一个默认的Selector实现，该实现可以通过替换NodeBuilder、Filter、Balancer和来分别实现节点权重计算算法、服务路由过滤策略、负载均衡算法的可插拔

```go
type Selector interface {
  // Selector 内部维护的服务节点列表通过Rebalancer接口来更新
  Rebalancer

  // Select nodes
  // if err == nil, selected and done must not be empty.
  Select(ctx context.Context, opts ...SelectOption) (selected Node, done DoneFunc, err error)
}

// 通过Rebalancer实现服务节点变更感知
type Rebalancer interface {
  Apply(nodes []Node)
}
```
已支持的实现：
* [wrr](https://github.com/go-kratos/wrr) : Weighted round robin (Kratos Client内置默认算法)
* [p2c](github.com/go-kratos/kratos/selector/p2c) : Power of two choices
* [random](github.com/go-kratos/kratos/selector/random) : Random

### 使用方式

#### HTTP Client

```go
import	"github.com/go-kratos/kratos/v2/selector/p2c"
import	"github.com/go-kratos/kratos/v2/selector/filter"

// 创建路由Filter：筛选版本号为"2.0.0"的实例
filter :=  filter.Version("2.0.0")
// 创建P2C负载均衡算法Selector，并将路由Filter注入
selector := p2c.New(p2c.WithFilter(filter))

hConn, err := http.NewClient(
  context.Background(),
  http.WithEndpoint("discovery:///helloworld"),
  http.WithDiscovery(r),
  // 通过http.WithSelector将Selector注入HTTP client中
  http.WithSelector(
    p2c.New(p2c.WithFilter(filter.Version("2.0.0"))),
  )
)
```

#### gRPC Client


```go
import	"github.com/go-kratos/kratos/v2/selector/p2c"
import	"github.com/go-kratos/kratos/v2/selector/filter"

// 创建路由Filter：筛选版本号为"2.0.0"的实例
filter :=  filter.Version("2.0.0")

conn, err := grpc.DialInsecure(
  context.Background(),
  grpc.WithEndpoint("discovery:///helloworld"),
  grpc.WithDiscovery(r),
  // 由于gRPC框架的限制只能使用全局balancer name的方式来注入selector
  grpc.WithBalancerName(wrr.Name),
  // 通过grpc.WithSelectFilter注入路由Filter
  grpc.WithSelectFilter(filter),
)
```