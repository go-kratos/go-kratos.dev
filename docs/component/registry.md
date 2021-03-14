---
id: registry
title: Registry
description: Kratos Registry 接口分为两个，Registrar为实例注册和反注册，Discovery为服务实例列表获取
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

Registry接口分为两个，Registrar为实例注册和反注册，Discovery为服务实例列表获取

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
	// 根据serviceName直接拉取实例列表
	Fetch(ctx context.Context, serviceName string) ([]*ServiceInstance, error)
	// 根据serviceName阻塞式订阅一个服务的实例列表信息
	Watch(ctx context.Context, serviceName string) (Watcher, error)
}
```
已支持的实现：
[consul](https://github.com/go-kratos/consul)
[etcd](https://github.com/go-kratos/etcd)
[k8s](https://github.com/go-kratos/kube)

### 使用方式

#### 注册服务实例

创建一个Registrar（以consul为例），将Registrar注入进Kratos应用实例中，Kratos会自动完成实例注册和反注册

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


#### 服务发现（gRPC）

创建一个Discoverer（以consul为例）,根据Dial url格式`<schema>://[namespace]/<service-name>`创建一个Endpoint，通过grc.WithDiscoverer ,grpc.WithEndpoint创建一个grpc connection
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





