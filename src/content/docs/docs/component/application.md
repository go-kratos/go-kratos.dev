---
id: application
title: Application Lifecycle
description: Construct, start, register, and gracefully stop a Kratos v3 application.
---

`kratos.App` coordinates transport servers, service registration, lifecycle hooks,
signals, and graceful shutdown. It does not create business services or storage
clients; the application receives those dependencies after Wire or handwritten
bootstrap code has constructed them.

## Construct an application

Pass every transport server to `kratos.Server`. Identity fields are used for
logging, discovery registration, and `AppInfo` returned from a context.

```go
func newApp(logger *slog.Logger, gs *grpc.Server, hs *http.Server) *kratos.App {
	return kratos.New(
		kratos.ID(instanceID),
		kratos.Name("todo"),
		kratos.Version(version),
		kratos.Metadata(map[string]string{"region": "cn-east"}),
		kratos.Logger(logger),
		kratos.StopTimeout(10*time.Second),
		kratos.Server(gs, hs),
	)
}
```

When `ID` is omitted, `New` attempts to create a UUID. `Name`, `Version`, and
`Metadata` have no meaningful framework defaults, so set them when the service
is registered or uses them in observability. `Logger` installs the supplied
`*slog.Logger` as the process default.

The available options are:

| Concern | Options |
| --- | --- |
| Identity | `ID`, `Name`, `Version`, `Metadata` |
| Runtime | `Context`, `Logger`, `Signal` |
| Servers | `Server`, `Endpoint`, `StopTimeout` |
| Registry | `Registrar`, `RegistrarTimeout` |
| Hooks | `BeforeStart`, `AfterStart`, `BeforeStop`, `AfterStop` |

`Endpoint` overrides endpoints reported by transport servers. Only use it when
the externally reachable address differs from the listener address, such as
behind a gateway. Values must be valid `*url.URL` instances understood by the
chosen registry and clients.

## Start order

`Run` builds the registry instance before starting. It then executes the
following phases:

1. Run `BeforeStart` hooks in declaration order. The first error aborts startup.
2. Start all transport servers concurrently.
3. Wait until each server's `Start` goroutine has begun, then register the
   service instance when a registrar is configured.
4. Run `AfterStart` hooks in declaration order.
5. Wait for a configured OS signal, an explicit `Stop`, or a server error.

The default signals are `SIGTERM`, `SIGQUIT`, and `SIGINT`. A server error
cancels the shared run context and begins shutdown of the other servers.

Hooks are for resources that must follow the application lifecycle. Prefer
constructors and Wire cleanup functions for ordinary dependency construction;
do not start a second copy of an HTTP or gRPC server from a hook.

## Registration and endpoints

If a registrar is present, Kratos registers one `registry.ServiceInstance`
containing the application ID, name, version, metadata, and endpoints. Without
an explicit `Endpoint` option, endpoints come from servers implementing
`transport.Endpointer`.

```go
app := kratos.New(
	kratos.Name("todo"),
	kratos.Version(version),
	kratos.Registrar(registrar),
	kratos.RegistrarTimeout(5*time.Second),
	kratos.Server(httpServer, grpcServer),
)
```

Registration happens after server startup begins. A registration error returns
from `Run`. During `Stop`, deregistration happens before the run context is
cancelled. Advertise addresses reachable by consumers; `0.0.0.0` is a listener
address, not normally a useful discovery endpoint.

## Graceful shutdown

`Stop` runs `BeforeStop`, deregisters the instance, and cancels the application
context. Each transport receives a context derived without the cancellation;
`StopTimeout` adds a deadline when configured. After all server goroutines end,
`Run` executes `AfterStop` hooks.

```go
app := kratos.New(
	kratos.StopTimeout(15*time.Second),
	kratos.BeforeStop(func(ctx context.Context) error {
		log.InfoContext(ctx, "application is stopping")
		return nil
	}),
	kratos.AfterStop(func(ctx context.Context) error {
		log.InfoContext(ctx, "application stopped")
		return nil
	}),
	kratos.Server(server),
)
```

`BeforeStop` hook errors are retained, but deregistration still runs. A
deregistration error is returned immediately. `AfterStop` runs only after the
server group finishes. Cleanup functions returned by Wire providers should be
deferred around `app.Run`, as shown by the layout entrypoint, so database and
other clients close after transports stop.

## Application information in a context

Kratos places `AppInfo` in contexts passed to hooks and transport `Start` calls.
Use `kratos.FromContext` only when code needs application identity without a
direct dependency.

```go
info, ok := kratos.FromContext(ctx)
if ok {
	logger.InfoContext(ctx, "running", "service.name", info.Name(), "service.id", info.ID())
}
```

Passing identity explicitly is easier to test for most application code. The
context helper is useful for lifecycle infrastructure and custom transports.

## Failure handling

- Treat `Run` errors as process-fatal and return a non-zero exit status.
- Give shutdown enough time for in-flight requests, then enforce a finite
  `StopTimeout` so deployment termination cannot wait forever.
- Make hooks safe to call after partial startup; an early error can leave only
  some resources active.
- Keep lifecycle hooks short and honor their context deadlines.

The project layout constructs the app in `cmd/server/main.go` and delegates
dependency cleanup to Wire.
