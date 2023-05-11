---
id: selector
title: Routing and Load Balancing
description: The main interface for routing and load balancing is Selector, but a default Selector implementation is also provided in the same directory. This implementation can implement node weight calculation, route filtering, and load balancing algorithms by replacing NodeBuilder, Filter, Balancer, and Pluggable
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

## Interface Implementation

The main interface for routing and load balancing is Selector, and a default Selector implementation is also provided in the same directory. This implementation can implement node weight calculation algorithm, service routing filtering strategy, and load balancing algorithm by replacing **NodeBuilder**, **Filter**, **Balancer**, and Pluggable.

```go
type Selector interface {
    // The list of service nodes maintained internally by the Selector is updated through the Rebalancer interface.
    Rebalancer

    // Select nodes
    // if err == nil, selected and done must not be empty.
    Select(ctx context.Context, opts ...SelectOption) (selected Node, done DoneFunc, err error)
}

// Realize service node change awareness through Rebalancer.
type Rebalancer interface {
    Apply(nodes []Node)
}
```

Supported implementations:

- [wrr](https://github.com/go-kratos/kratos/tree/main/selector/wrr) : Weighted round robin (Kratos Client built-in default algorithm)
- [p2c](https://github.com/go-kratos/kratos/tree/main/selector/p2c) : Power of two choices
- [random](https://github.com/go-kratos/kratos/tree/main/selector/random) : Random

## How to use

### HTTP Client

```go
import "github.com/go-kratos/kratos/v2/selector/p2c"
import "github.com/go-kratos/kratos/v2/selector/filter"

// Create a route Filter: filter instances with version number "2.0.0".
filter := filter.Version("2.0.0")
// Create P2C load balancing algorithm Selector, and inject routing Filter.
selctor.SetGlobalSelector(wrr.NewBuilder)

hConn, err := http.NewClient(
  http.WithEndpoint("discovery:///helloworld"),
  http.WithDiscovery(r),
  http.WithNodeFilter(filter)
)
```

### gRPC Client

```go
import "github.com/go-kratos/kratos/v2/selector/p2c"
import "github.com/go-kratos/kratos/v2/selector/filter"

// Create a route Filter: filter instances with version number "2.0.0".
filter := filter.Version("2.0.0")
// Due to the limitations of the gRPC framework, only the global balancer name can be used to inject Selector.
selector.SetGlobalSelector(wrr.NewBuilder)

conn, err := grpc.DialInsecure(
  context.Background(),
  grpc.WithEndpoint("discovery:///helloworld"),
  grpc.WithDiscovery(r),

  // Inject routing Filter through grpc.WithFilter.
  grpc.WithNodeFilter(filter),
)
```
