---
id: registry
title: 注册中心
---

核心 `registry` 包定义 `Registrar`、`Discovery`、`Watcher` 和 `ServiceInstance`。registrar 负责注册和注销服务实例；discovery 负责获取实例并监听变更。具体实现是独立的 contrib 模块。

将 registrar 传给 `kratos.New(kratos.Registrar(registrar))`，应用生命周期会使用应用名称、版本、metadata 与 server endpoint 注册。client 使用 `grpc.WithDiscovery(discovery)` 或 `http.WithDiscovery(discovery)`，endpoint 例如 `discovery:///orders`。

```go
app := kratos.New(
	kratos.Name("orders"),
	kratos.Version(version),
	kratos.Registrar(registrar),
	kratos.Server(httpServer, grpcServer),
)

conn, err := grpc.NewClient(ctx,
	grpc.WithEndpoint("discovery:///orders"),
	grpc.WithDiscovery(discovery),
)
```

Contrib repository 包含 Consul、etcd、Eureka、Kubernetes、Nacos、Polaris、ServiceComb、ZooKeeper 和通用 discovery adapter 的独立 `/v3` module。这些 module 的功能并不完全相同；应检查所选实现的 `Register`、`Deregister`、`Fetch`、`Watch` 和 `Stop` 行为。不要使用旧的 `contrib/registry/*/v2` import。

## 生命周期与 endpoint

server 通过 transport 实现暴露 endpoint。应用启动时，registrar 会接收包含服务名称、版本、metadata、endpoint 的 `registry.ServiceInstance`；关闭时会注销该实例。必须保证声明的 endpoint 可从 consumer 访问，而不只是本地 bind 成功。

discovery client 使用相同的服务名称和 provider discovery 实现，让 transport 维护 watch。不要永久缓存 `Fetch` 结果：使用 `Watcher` 或带 `WithDiscovery` 的 transport client 才能处理实例变更。

## 运行建议

注册中心凭据、namespace 与 TLS option 属于 provider 特定配置。将其保存到配置中，在关闭阶段关闭 provider client，并先独立测试直接 endpoint 调用，再排查 discovery 或 selector。

接口定义可查阅 core [registry package](https://github.com/go-kratos/kratos/tree/main/registry)。
