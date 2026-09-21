---
id: config
title: Configuration
---

Kratos v3 loads configuration through `config.Source`. A source returns key-value data and may provide a watcher. The core module includes file and environment sources; remote systems are supplied as separate contrib modules.

## Create and load configuration

```go
import (
	"github.com/go-kratos/kratos/v3/config"
	"github.com/go-kratos/kratos/v3/config/env"
	"github.com/go-kratos/kratos/v3/config/file"
)

c := config.New(config.WithSource(
	file.NewSource("configs"),
	env.NewSource("KRATOS"),
))
defer c.Close()

if err := c.Load(); err != nil {
	return err
}
var bootstrap Bootstrap
if err := c.Scan(&bootstrap); err != nil {
	return err
}
```

Call `Close` when the application stops to release source watchers. Treat a `Load` or `Scan` error as startup failure unless the service deliberately supports a fallback configuration.

## Sources and precedence

`file.NewSource("configs")` reads supported configuration files below the directory. `env.NewSource("KRATOS")` reads variables with that prefix. Sources passed later to `config.WithSource` override colliding values from earlier sources, making environment variables appropriate for deployment-specific overrides.

The environment source strips the matching prefix and one optional underscore,
then uses the remainder as the key; it does not turn underscores into dots. For
example, `KRATOS_DATABASE_SOURCE` becomes the root key `DATABASE_SOURCE`. A file
value such as `${DATABASE_SOURCE:default}` is resolved from that merged key.
This is how the project template injects its database DSN.

Keep non-secret defaults in versioned files and deliver credentials through deployment configuration. Do not log the complete decoded configuration because it may contain credentials.

## Decode values

`Scan` decodes the whole configuration tree into a struct, protobuf message, or another compatible Go value. Use generic `config.Get` to decode a subtree by key.

```go
type databaseConfig struct {
	Source string `json:"source"`
}
database, err := config.Get[databaseConfig](c, "data.database")
if err != nil {
	return err
}
```

Use explicit types for durations, addresses, and feature flags in the generated or handwritten configuration model; validate required values before constructing servers and clients.

## Watch updates

Use `Watch(key, observer)` only when the application can safely apply an update while requests are active. The observer receives a key-value update; it must validate and synchronize any replacement state itself.

```go
if err := c.Watch("data.database", func(key string, value config.Value) {
	// Decode, validate, and atomically replace only dynamic settings.
}); err != nil {
	return err
}
```

Changing a listener address, database driver, or other startup-only setting normally requires a controlled restart rather than an in-process reload.

## Project layout

The project template keeps runtime files in `configs/`, loads file and `KRATOS` environment sources, and generates its configuration Go types from `internal/conf` through `make config`. After changing the configuration protobuf definitions, run `make config`, then `make all` when API or Wire outputs also need regeneration.

Contrib adapters, including Consul, Etcd, Nacos, Apollo, Kubernetes, and Polaris, use independent v3 module paths. Consult each adapter's package documentation for its client setup and watch semantics.
