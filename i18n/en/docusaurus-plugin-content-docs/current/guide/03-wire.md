---
id: wire
title: Dependency Injection
---

**Wire** is a compile-time dependency injection tool.

It is recommended that doing explicit initialization rather than using global variables.

Generating the initialization codes by *Wire* can reduce the coupling among components and increase the maintainability of the project.

### Installation

```bash
go get github.com/google/wire/cmd/wire
```

### Terms

There are two basic terms in wire, *Provider* and *Injector*.

Provider is a *Go Func*, it can also receive the values from other *Provider*s for dependency injection.

```go
// provides a config file
func NewConfig() *conf.Data {...}

// provides the data component (the initialization of database, cache and etc.) which depends on the data config.
func NewData(c *conf.Data) (*Data, error) {...}

// provides persistence components (implementation of CRUD persistence) which depends on the data component.
func NewUserRepo(d *data.Data) (*UserRepo, error) {...}
```

### Usage

In Kratos project, there are four major modules, *server, service, biz and data*. They will be initialized by *Wire*.

<img src="/images/wire.png" alt="kratos ddd" width="650px" />

A *ProviderSet* should be provided in every module so that wire could scan them and generate the DI codes.

First, you should define ProviderSet in the entry of every module.
The 
```go
-data
--data.go    // var ProviderSet = wire.NewSet(NewData, NewGreeterRepo)
--greeter.go // func NewGreeterRepo(data *Data, logger log.Logger) biz.GreeterRepo {...}
```
Then put these *ProviderSet* in the *wire.go* for DI configuration.

### Component Initialization
`wire.go` is required for DI. The kratos application is for lifecycle management.

```go
// the entry point of the application
cmd
-main.go
-wire.go
-wire_gen.go

// main.go creates the kratos application for lifecycle management.
func newApp(logger log.Logger, hs *http.Server, gs *grpc.Server, greeter *service.GreeterService) *kratos.App {
    pb.RegisterGreeterServer(gs, greeter)
    pb.RegisterGreeterHTTPServer(hs, greeter)
    return kratos.New(
        kratos.Name(Name),
        kratos.Version(Version),
        kratos.Logger(logger),
        kratos.Server(
            hs,
            gs,
        ),
    )
}

// wire.go initialization
func initApp(*conf.Server, *conf.Data, log.Logger) (*kratos.App, error) {
    //  builds ProviderSet in every modules, for the generation of wire_gen.go
    panic(wire.Build(server.ProviderSet, data.ProviderSet, biz.ProviderSet, service.ProviderSet, newApp))
}
```
run `go generate` command in main directory to generate DI codes.
```
go generate ./...
```

## References

* https://blog.golang.org/wire
* https://github.com/google/wire
* https://medium.com/@dche423/master-wire-cn-d57de86caa1b
