---
title: Kratos Study Notes - A Simple Analysis of How the Application Runs via Layout
description: A Simple Analysis of How the Application Runs via Layout
keywords:
  - Go 
  - Kratos
  - layout
  - operation process
author: shenqidebaozi
author_title: Maintainer of go-kratos
author_url: https://github.com/shenqidebaozi
author_image_url: https://avatars.githubusercontent.com/u/35397691?s=60&v=4
tags: [go, golang, engineering, operation principle, source code analysis]
date: 2021-06-03
---

## 0X01 Exploring Kratos Operation Principles via Layout (kratos v2.0.0-beta4)

### Create Project

First, install the necessary dependencies and tools:

- go
- protoc
- protoc-gen-go

```bash
# Create project template
kratos new helloworld

cd helloworld
# Pull project dependencies
go mod download
# Generate proto template
kratos proto add api/helloworld/v1/helloworld.proto
# Generate proto source code
kratos proto client api/helloworld/v1/helloworld.proto
# Generate server template
kratos proto server api/helloworld/v1/helloworld.proto -t internal/service
```

After executing the commands, a service project will be generated in the current directory. The project structure is as follows. For detailed project structure description, please refer to [layout](https://go-kratos.dev/docs/intro/layout)
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2919854308c04803bef327b4f67f31f8~tplv-k3u1fbpfcp-watermark.image)

### Run Project

```bash
# Generate all proto source code, wire, etc.
go generate ./...

# Compile into executable
go build -o ./bin/ ./...

# Run project
./bin/helloworld -conf ./configs
```

If you see the following output, it indicates the project started normally.

```shell
level=INFO module=app service_id=7114ad8a-b3bf-11eb-a1b9-f0189850d2cb service_name=  version=
level=INFO module=transport/grpc msg=[gRPC] server listening on: [::]:9000
level=INFO module=transport/http msg=[HTTP] server listening on: [::]:8000 
```

Test the interface:

```shell
curl 'http://127.0.0.1:8000/helloworld/krtaos'

Output:
{
  "message": "Hello kratos"
}
```

### How Does the Application Run?

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f714f793562459ea2a136aa4399494d~tplv-k3u1fbpfcp-watermark.image)
Through the above diagram👆, we can intuitively observe the application's call chain. Simplified, the process is as shown below👇

![未命名文件(2).png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87d64f1a4f0e41afbb49bed6e003999c~tplv-k3u1fbpfcp-watermark.image)

#### 1. Inject Dependencies and Call newApp() Method

```go
// helloword/cmd/main.go
func main() {
 flag.Parse()
 logger := log.NewStdLogger(os.Stdout)

 // Call go-kratos/kratos/v2/config, create config instance, and specify source and configuration parsing method
 c := config.New(
 config.WithSource(
  file.NewSource(flagconf),
 ),
 config.WithDecoder(func(kv *config.KeyValue, v map[string]interface{}) error {
  return yaml.Unmarshal(kv.Value, v)
 }),
 )
 if err := c.Load(); err != nil {
  panic(err)
 }

 // Scan configuration into the conf struct declared via proto
 var bc conf.Bootstrap
 if err := c.Scan(&bc); err != nil {
  panic(err)
 }

 // Inject dependencies via wire and call newApp method
 app, cleanup, err := initApp(bc.Server, bc.Data, logger)
 if err != nil {
  panic(err)
 }
 // Code omitted...
}
```

#### 2. Create Kratos Instance

In the project's main.go **newApp()** method, the **kratos.New()** method from **go-kratos/kratos/v2/app.go** is called.

```go
// helloword/cmd/main.go
func newApp(logger log.Logger, hs *http.Server, gs *grpc.Server) *kratos.App {
 return kratos.New(
  // Configure application  
  kratos.Name(Name),
  kratos.Version(Version),
  kratos.Metadata(map[string]string{}),
  kratos.Logger(logger),
  // http/grpc services passed via kratos.Server() will be converted to registry.ServiceInstance struct* via buildInstance()
  kratos.Server(
   hs,
   gs,
  ),
 )
}
```

This method returns an **App struct**, containing **Run()** and **Stop()** methods.

```go
// go-kratos/kratos/v2/app.go
type App struct {
 opts     options // Configuration
 ctx      context.Context // Context
 cancel   func() // Context cancellation method
 instance *registry.ServiceInstance // Instance declared via kratos.Server(), converted via buildInstance() to *registry.ServiceInstance struct
 log      *log.Helper // Log
}

// Run executes all OnStart hooks registered with the application's Lifecycle.
func (a *App) Run() error {
 // Code omitted...
}

// Stop gracefully stops the application.
func (a *App) Stop() error {
 // Code omitted...
}
```

#### 3. Call Run() Method

The project calls the **Run()** method of **kratos.App struct** in the main method.

```go
// helloword/cmd/main.go
// Code omitted...
// Start Kratos
if err := app.Run(); err != nil {
 panic(err)
}
```

Implementation details of the **Run()** method:

```go
// go-kratos/kratos/v2/app.go
func (a *App) Run() error {
 a.log.Infow(
  "service_id", a.opts.id,
  "service_name", a.opts.name,
  "version", a.opts.version,
 )
 g, ctx := errgroup.WithContext(a.ctx)
 // Iterate through service instances declared via kratos.Server()
 for _, srv := range a.opts.servers {
  srv := srv
                // Execute two goroutines to handle service startup and shutdown
  g.Go(func() error {
   <-ctx.Done() // Block, wait for cancel method call
   return srv.Stop() // After goroutine exits, call instance's stop method
  })
  g.Go(func() error {
   return srv.Start() // Call instance's run method
  })
 }
 // Check if kratos.Registrar() is configured for service discovery registry
 if a.opts.registrar != nil {
  // Register instance to registry
  if err := a.opts.registrar.Register(a.opts.ctx, a.instance); err != nil 
   return err
  }
 }
// Listen for process exit signals
 c := make(chan os.Signal, 1)
 signal.Notify(c, a.opts.sigs...)
        
  // Handle process exit and context exit
 g.Go(func() error {
  for {
   select {
   case <-ctx.Done():
    return ctx.Err()
   case <-c:
    // Call kratos.App's stop method
    a.Stop()
   }
  }
 })
 if err := g.Wait(); err != nil && !errors.Is(err, context.Canceled) {
  return err
 }
 return nil
}
```

#### 4. Application Exit

When starting, the Kratos instance listens for system process exit signals. Upon receiving an exit signal, kratos calls the **Stop()** method of the **App struct**.

```go
// go-kratos/kratos/v2/app.go
func (a *App) Stop() error {
 // Check if registry configuration exists
 if a.opts.registrar != nil {
  // Deregister instance from registry
  if err := a.opts.registrar.Deregister(a.opts.ctx, a.instance); err != nil {
   return err
  }
 }
 // Control goroutine exit. When a.cancel() is called, the <-ctx.Done() listener in Run() method receives the message, unblocks, and then calls the server's Stop() method to stop the service.
 if a.cancel != nil {
  a.cancel()
 }
 return nil
}
```