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
* [zookeeper](https://github.com/go-kratos/kratos/tree/main/contrib/registry/zookeeper)

### Usage

#### Register a Service
Create a Registrar(e.g. consul) and inject it to Kratos applications. Then the framework will do register and deregister automatically.

```go
import consul "github.com/go-kratos/consul/registry"
import	"github.com/hashicorp/consul/api"

cli, err := api.NewClient(api.DefaultConfig())
if err != nil {
	panic(err)
}
reg := consul.New(cli)

app := kratos.New(
    kratos.Name(Name),
    kratos.Version(Version),
    kratos.Metadata(map[string]string{}),
    kratos.Logger(logger),
    kratos.Server(
        hs,
        gs,
    ),
    kratos.Registrar(reg),
)
```


#### Service Discovery (gRPC)
Create a Registrar(e.g. consul), create an Endpoint with url format as `<schema>://[namespace]/<service-name>`, then use `grc.WithDiscovery` and `grpc.WithEndpoint` as the options of the Dial method to get the gRPC connection.

```go
import "github.com/go-kratos/kratos/transport/http"
import "github.com/go-kratos/kratos/v2/transport/grpc"

cli, err := api.NewClient(api.DefaultConfig())
if err != nil {
	panic(err)
}
dis := consul.New(cli)

endpoint := "discovery://default/provider"
conn, err := grpc.Dial(context.Background(), grpc.WithEndpoint(endpoint), grpc.WithDiscovery(dis))
if err != nil {
    panic(err)
}
```
