---
id: plugin
title: Integrations and Contrib Modules
description: Extend Kratos v3 through explicit interfaces and independent contrib modules.
---

Kratos has no runtime plugin loader. Extensions are ordinary Go modules wired
into core interfaces or middleware constructors at compile time. This keeps
dependencies visible in `go.mod` and makes initialization and cleanup the
application's responsibility.

## Extension points

| Need | Core contract | Available contrib modules |
| --- | --- | --- |
| Remote config | `config.Source` and `config.Watcher` | Apollo, Consul, etcd, Kubernetes, Nacos, Polaris |
| Registration/discovery | `registry.Registrar`, `Discovery`, `Watcher` | Consul, discovery, etcd, Eureka, Kubernetes, Nacos, Polaris, ServiceComb, ZooKeeper |
| Authentication | `middleware.Middleware` | JWT |
| Observability | `middleware.Middleware`, `slog.Handler`/extractor | OpenTelemetry log, metrics, tracing |
| Encoding | `encoding.Codec` | v2-compatible JSON, MessagePack |
| Error tracking | middleware/integration API | Sentry |
| Transport | `transport.Server` and generated contracts | MCP transport module |

Providers do not have identical options or operational guarantees. Follow the
selected module's README and code.

## Add an integration

Use the module's `/v3` path, pin a reviewed version, and initialize it in the
composition root. Pass only a core interface into packages that need it. For
example, application bootstrap can pass a provider as `kratos.Registrar`, while
an outbound HTTP/gRPC client receives it through `WithDiscovery`.

Keep provider credentials and endpoints in configuration. If the provider owns
connections or watchers, return a cleanup function from its constructor and
let Wire or the application close it after transports stop.

## Test the boundary

Business packages should depend on domain repository interfaces rather than
registry, config-provider, or telemetry SDK types. Unit tests can use small fake
implementations of `registry.Discovery` or `config.Source`; integration tests
cover provider-specific authentication, watches, reconnection, and shutdown.

Core and contrib have independent `go.mod` files. A core `v3.0.0` dependency
does not automatically select a matching contrib version. Review the contrib
module's own version and transitive dependencies when upgrading.
