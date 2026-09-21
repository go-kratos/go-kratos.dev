---
id: wire
title: Dependency Injection
---

The project template uses Google Wire for compile-time dependency injection.
Wire reads constructors and provider sets, then generates ordinary Go code that
calls them in dependency order. Kratos itself does not require Wire at runtime.

## Provider sets by layer

Each application layer exports a small provider set:

```go
var ProviderSet = wire.NewSet(NewData, NewTodoRepo)
```

The template has sets for `data`, `biz`, `service`, and `server`. Constructors
declare dependencies in their parameters and outputs. A constructor may return
`(value, error)` when initialization can fail, and `(value, cleanup, error)`
when it owns a long-lived resource such as a database client.

Keep sets close to the constructors they expose. Return business repository
interfaces from data constructors, and avoid a provider set that silently
constructs mutable global state.

## Define the injector

`cmd/server/wire.go` is an injector declaration compiled only with the
`wireinject` build tag:

```go
//go:build wireinject

func wireApp(*conf.Server, *conf.Data, *slog.Logger) (*kratos.App, func(), error) {
	panic(wire.Build(
		server.ProviderSet,
		data.ProviderSet,
		biz.ProviderSet,
		service.ProviderSet,
		newApp,
	))
}
```

The apparent panic is a Wire declaration, not runtime code. Wire replaces it
with `wire_gen.go`, which calls `NewData`, constructs the repository, use case,
service and transports, then calls `newApp`. If setup fails, the generated code
returns the error and runs cleanup for resources already created.

## Generate the injector

Do not edit `wire_gen.go`. After adding a constructor argument or changing a
provider set, run:

```bash
make all
go test ./...
```

In the template, `make all` runs API generation, configuration generation, and
`make generate`. The last target runs `go generate ./...` and `go mod tidy`;
the Wire directive in `wire_gen.go` regenerates the injector. `make init`
installs Wire and Buf for local development.

Commit `wire.go` and `wire_gen.go` together. A clean regeneration check in CI
detects an injector that was not updated after constructor changes.

## Own cleanup in main

The injector returns a cleanup function assembled from provider cleanup
functions. Call it only after successful construction and defer it before
running the application:

```go
app, cleanup, err := wireApp(bc.Server, bc.Data, logger)
if err != nil {
	panic(err)
}
defer cleanup()

if err := app.Run(); err != nil {
	panic(err)
}
```

`App.Run` stops transports and unregisters the service. Wire cleanup then closes
data clients and other constructed resources. Constructors should make their
cleanup safe after partial initialization and return useful errors rather than
calling `panic` themselves.

## Diagnose generation errors

- **No provider found:** add the constructor's provider set or pass the value as
  an injector input.
- **Multiple providers:** remove the ambiguous provider or split injectors for
  different implementations.
- **Interface is not provided:** return the interface from the constructor or
  use `wire.Bind` when the constructor returns a concrete implementation.
- **Initialization cycle:** move the shared responsibility behind an interface
  or change ownership; Wire cannot construct a runtime dependency cycle.

Wire verifies construction, not behavior. Continue to unit-test use cases,
services, and repositories independently.
