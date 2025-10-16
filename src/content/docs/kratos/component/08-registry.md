---
id: registry
title: Registry
---

### Interface

Registry has two interface, the Registrar is for services' register and deregister, the Discovery is for fetching the list of services.

```go
type Registrar interface {
	// register the service
	Register(ctx context.Context, service *ServiceInstance) error
	// deregister the service
	Deregister(ctx context.Context, service *ServiceInstance) error
}
```

```go
type Discovery interface {
	// fetch the service list of serviceName
	Fetch(ctx context.Context, serviceName string) ([]*ServiceInstance, error)
	// subscribe to a list of serviceName
	Watch(ctx context.Context, serviceName string) (Watcher, error)
}
```

Implementations:
* [consul](https://github.com/go-kratos/kratos/tree/main/contrib/registry/consul)
* [discovery](https://github.com/go-kratos/kratos/tree/main/contrib/registry/discovery)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/registry/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/registry/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/registry/nacos)
* [polaris](https://github.com/go-kratos/kratos/tree/main/contrib/registry/polaris)
* [zookeeper](https://github.com/go-kratos/kratos/tree/main/contrib/registry/zookeeper)

### Usage

#### Register a Service

Create a Registrar(e.g. consul) and inject it to Kratos applications. Then the framework will do register and deregister automatically.

```go
import (
    consul "github.com/go-kratos/consul/registry"
    "github.com/hashicorp/consul/api"
)

// new consul client
client, err := api.NewClient(api.DefaultConfig())
if err != nil {
	panic(err)
}
// new reg with consul client
reg := consul.New(client)

app := kratos.New(
    // service-name
    kratos.Name(Name),
    kratos.Version(Version),
    kratos.Metadata(map[string]string{}),
    kratos.Logger(logger),
    kratos.Server(
        hs,
        gs,
    ),
    // with registrar
    kratos.Registrar(reg),
)
```

If use etcd or any other implementations, you can create a Registrar with other client.

```go
import (
    "github.com/go-kratos/kratos/contrib/registry/etcd/v2"
    clientv3 "go.etcd.io/etcd/client/v3"
)

// new etcd client
client, err := clientv3.New(clientv3.Config{
    Endpoints: []string{"127.0.0.1:2379"},
})
if err != nil {
    panic(err)
}
// new reg with etcd client
reg := etcd.New(client)

app := kratos.New(
    // service-name
    kratos.Name(Name),
    kratos.Version(Version),
    kratos.Metadata(map[string]string{}),
    kratos.Logger(logger),
    kratos.Server(
        hs,
        gs,
    ),
    // with registrar
    kratos.Registrar(reg),
)
```

#### Service Discovery (gRPC)

Create a Registrar(e.g. consul), create an Endpoint with url format as `<schema>://[authority]/<service-name>`, then use `grc.WithDiscovery` and `grpc.WithEndpoint` as the options of the Dial method to get the gRPC connection.

```go
import (
    "context"

    consul "github.com/go-kratos/consul/registry"
    "github.com/go-kratos/kratos/v2/transport/grpc"
    "github.com/hashicorp/consul/api"
)

// new consul client
client, err := api.NewClient(api.DefaultConfig())
if err != nil {
	panic(err)
}
// new dis with consul client
dis := consul.New(client)

endpoint := "discovery:///provider"
conn, err := grpc.Dial(context.Background(), grpc.WithEndpoint(endpoint), grpc.WithDiscovery(dis))
if err != nil {
    panic(err)
}
```

It is the same as Register, if use etcd or any other implementations, you can create a Discovery with other client.

```go
import (
    "github.com/go-kratos/kratos/contrib/registry/etcd/v2"
    "github.com/go-kratos/kratos/v2/transport/grpc"
    clientv3 "go.etcd.io/etcd/client/v3"
)

// new etcd client
client, err := clientv3.New(clientv3.Config{
    Endpoints: []string{"127.0.0.1:2379"},
})
if err != nil {
    panic(err)
}
// new dis with etcd client
dis := etcd.New(client)

// This Dial need to use DialInsecure() or use grpc.WithTransportCredentials in Dial option
endpoint := "discovery:///provider"
conn, err := grpc.Dial(context.Background(), grpc.WithEndpoint(endpoint), grpc.WithDiscovery(dis))
if err != nil {
    panic(err)
}
```
