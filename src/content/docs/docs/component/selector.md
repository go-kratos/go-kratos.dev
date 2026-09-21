---
id: selector
title: Routing and Load Balancing
---

`selector.Selector` chooses a discovered service node and returns a completion function. The core includes weighted round-robin (`selector/wrr`), power of two choices (`selector/p2c`), and random (`selector/random`) strategies.

## Selector interface and implementations

A selector receives nodes through its rebalancer, selects one using `Select`, and returns both the selected node and a completion function. The default transport integration updates nodes from discovery and supplies the operation context. Weighted round-robin is available in `selector/wrr`; `selector/p2c` and `selector/random` provide alternate strategies. Choose an algorithm based on observable service behavior rather than replacing it for cosmetic reasons.

## Use with clients

Create HTTP or gRPC clients with a discovery endpoint and `WithDiscovery`, then configure a node filter when a request must be routed to a compatible subset. The endpoint must use the discovery scheme, for example `discovery:///orders`. Direct endpoints do not involve discovery or selector balancing.

Use the transport's `http.WithNodeFilter(...)` or `grpc.WithNodeFilter(...)`
option to select instances by version, metadata, or another routing rule. The
client combines discovery, endpoint, selector, and filter options; ensure its
endpoint uses the discovery scheme. `selector.WithNodeFilter` is the lower-level
select-call option used when invoking a selector directly. Call the completion
function returned by a selector only when implementing a selector or custom
client integration directly.

```go
conn, err := http.NewClient(ctx,
	http.WithEndpoint("discovery:///orders"),
	http.WithDiscovery(discovery),
	http.WithNodeFilter(filter.Version("v3.0.0")),
)
```

## Routing policy

Node filters narrow the candidate set before balancing. Use them for explicit compatibility rules such as a version or region, not as an implicit fallback for missing instances. Make the routing key observable in logs and metrics so an empty candidate set can be diagnosed.

The standard transport clients own discovery updates and selector calls. Customize the global selector only when the service needs a consistent process-wide strategy; otherwise keep routing policy close to the client construction that owns it. A custom selector must handle an empty node list and invoke its selected node's completion callback exactly once.

`DoneInfo` reports reply metadata and error outcome to the selected node.
Adaptive balancers depend on that completion signal, so skipping or invoking
it twice corrupts their observations. `selector.ErrNoAvailable` is the standard
error when no node can be selected.
