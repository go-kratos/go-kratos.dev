---
id: registry
title: 服务注册与发现
description: Kratos Registry 接口分为两个，Registrar 为实例注册和反注册，Discovery 为服务实例列表获取
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

Registry 接口分为两个，Registrar 为实例注册和反注册，Discovery 为服务实例列表获取

```go
type Registrar interface {
	// 注册实例
	Register(ctx context.Context, service *ServiceInstance) error
	// 反注册实例
	Deregister(ctx context.Context, service *ServiceInstance) error
}
```

```go
type Discovery interface {
	// 根据 serviceName 直接拉取实例列表
	GetService(ctx context.Context, serviceName string) ([]*ServiceInstance, error)
	// 根据 serviceName 阻塞式订阅一个服务的实例列表信息
	Watch(ctx context.Context, serviceName string) (Watcher, error)
}
```

已支持的实现：
* [consul](https://github.com/go-kratos/kratos/tree/main/contrib/registry/consul)
* [discovery](https://github.com/go-kratos/kratos/tree/main/contrib/registry/discovery)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/registry/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/registry/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/registry/nacos)
* [polaris](https://github.com/go-kratos/kratos/tree/main/contrib/registry/polaris)
* [zookeeper](https://github.com/go-kratos/kratos/tree/main/contrib/registry/zookeeper)

### 使用方式

#### 注册服务实例

创建一个 Registrar（以 consul 为例），将 Registrar 注入进 Kratos 应用实例中，Kratos 会自动完成实例注册和反注册

```go
import (
    consul "github.com/go-docs/docs/contrib/registry/consul/v2"
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

如果使用 etcd 或是其它实现，只需要根据不同的实现来创建 Registry 后传入

```go
import (
    "github.com/go-docs/docs/contrib/registry/etcd/v2"
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

#### 服务发现（gRPC）

创建一个 Discoverer（以 consul 为例），根据 Dial url 格式 `<schema>://[authority]/<service-name>` 创建一个 Endpoint，通过 grpc.WithDiscoverer，grpc.WithEndpoint 创建一个 grpc connection

```go
import (
    "context"

    consul "github.com/go-docs/docs/contrib/registry/consul/v2"
    "github.com/go-docs/docs/v2/transport/grpc"
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

与服务注册相同，如果使用 etcd 或是其它实现，只需要根据不同的实现来创建 Discovery 后传入

```go
import (
    "github.com/go-docs/docs/contrib/registry/etcd/v2"
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

endpoint := "discovery:///provider"
conn, err := grpc.Dial(context.Background(), grpc.WithEndpoint(endpoint), grpc.WithDiscovery(dis))
if err != nil {
    panic(err)
}
```
