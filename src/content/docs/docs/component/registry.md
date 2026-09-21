---
id: registry
title: Registry
---

The core `registry` package defines `Registrar`, `Discovery`, `Watcher`, and `ServiceInstance`. A registrar registers and deregisters service instances; discovery fetches instances and watches changes. Registry implementations are independent contrib modules.

Pass a registrar to `kratos.New(kratos.Registrar(registrar))`; application lifecycle registration then uses the application's name, version, metadata, and server endpoints. For clients, provide the implementation as `grpc.WithDiscovery(discovery)` or `http.WithDiscovery(discovery)` with an endpoint such as `discovery:///orders`.

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

The contrib repository contains independent `/v3` modules for
Consul, etcd, Eureka, Kubernetes, Nacos, Polaris, ServiceComb, ZooKeeper, and a
generic discovery adapter. Presence in the repository does not imply identical
features: inspect the selected implementation's `Register`, `Deregister`,
`Fetch`, `Watch`, and `Stop` behavior. Do not use old
`contrib/registry/*/v2` imports.

## Lifecycle and endpoints

Servers expose endpoints through the transport implementation. When the app starts, its registrar receives a `registry.ServiceInstance` containing the configured service name, version, metadata, and endpoints; shutdown deregisters that instance. Ensure advertised endpoints are reachable from consumers, not merely bound locally.

For discovery clients, use the provider's discovery implementation with the same service name and let the transport maintain watches. Do not cache a `Fetch` result indefinitely: discovery changes are the reason to use a `Watcher` or a transport client with `WithDiscovery`.

## Operational guidance

Registry credentials, namespaces, and TLS options belong to provider-specific setup. Keep them in configuration, close provider clients during shutdown, and test direct endpoint calls independently before diagnosing discovery or selector behavior.

See the core [registry package](https://github.com/go-kratos/kratos/tree/main/registry)
for the interface definitions.
