---
id: registry
title: Registry
---

### Interface

Registry has two interface, the Registrar is for services' register and deregister, the Discoverer is for fetching the list of services.

```go
type Registrar interface {
	// register the service
	Register(ctx context.Context, service *ServiceInstance) error
	// deregister the service
	Deregister(ctx context.Context, service *ServiceInstance) error
}
```
```go
type Discoverer interface {
	// fetch the service list of serviceName
	Fetch(ctx context.Context, serviceName string) ([]*ServiceInstance, error)
	// subscribe to a list of serviceName
	Watch(ctx context.Context, serviceName string) (Watcher, error)
}
```
Implementations:
[consul](https://github.com/go-kratos/consul)
[etcd](https://github.com/go-kratos/etcd)
[k8s](https://github.com/go-kratos/kube)

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
reg, err := consul.New(cli)
if err != nil {
	panic(err)
}
app := kratos.New(
    kratos.Name(Name),
    kratos.Version(Version),
    kratos.Metadata(map[string]string{}),
    kratos.Logger(logger),
    kratos.Server(
        hs,
        gs,
    ),
    kratos.Registrar(r),
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
dis, err := consul.New(cli)
if err != nil {
	panic(err)
}
endpoint ：= WithEndpoint("discovery://default/provider")
conn, err := grpc.Dial(context.Background(), grpc.WithEndpoint(endpoint), grpc.WithDiscovery(dis))
if err != nil {
    panic(err)
}
```
