---
title: Go Engineering - Dependency Injection
description: At first glance, wire seems counter-intuitive, leading many developers to not understand why to use it or how to use it (including myself in the past). This article aims to help everyone understand the usage of wire.
keywords:
  - Go 
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
author: Windfarer
author_title: Maintainer of go-kratos
author_url: https://github.com/Windfarer
author_image_url: https://avatars.githubusercontent.com/u/7036121?v=4
tags: [go, golang, engineering, wire, best practices]
date: 2021-07-14
---
In the default project template [kratos-layout](https://github.com/go-kratos/kratos-layout) of the microservices framework [kratos v2](https://github.com/go-kratos/kratos), we use [google/wire](https://github.com/google/wire) for dependency injection and recommend that developers use this tool when maintaining projects.

At first glance, wire seems counter-intuitive, leading many developers to not understand why to use it or how to use it (including myself in the past). This article aims to help everyone understand the usage of wire.

## What

[wire](https://github.com/google/wire) is an open-source dependency injection code generation tool for the Go language. It can generate corresponding dependency injection Go code based on your code.

Unlike other dependency injection tools that rely on reflection, wire can report dependency injection issues during the compilation phase (more precisely, during code generation), rather than waiting until runtime, making debugging easier.

## Why

### Understanding Dependency Injection

What is dependency injection? Why use dependency injection?
~~Dependency injection is a Java legacy~~ (Just kidding)

[Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) (abbreviated as DI) can be understood as a code construction pattern (a way of writing code) that makes your code easier to maintain.

For many software design patterns and architectural concepts, we often struggle to understand why they require complex gymnastics and strange implementation methods. They usually just provide an example and say that writing this way is elegant and good. Since the derivation process of how this pattern evolved is omitted, we only see the result, making it difficult to understand. Next, let's try to deduce the entire process to see how and why code evolves into the dependency injection pattern, in order to better understand the significance of using dependency injection.

#### What is a Dependency?

Here, dependency is a noun, not referring to software package dependencies (like the stuff stuffed in node_modules), but rather the external modules (objects/instances) that a particular module (object/instance) in the software relies on.

#### Where is it Injected?

The dependent module is injected into (i.e., passed as a parameter to) the module when the module is created.

#### What Does Non-DI Look Like? What Does DI Look Like?

The following uses Go pseudo-code as an example; just grasp the essence.

Suppose you are working on a web application with a simple interface. The initial project code might look like this:

```go
# The following is pseudo-code, ignoring many details unrelated to the topic

type App struct {
}

# Assume this method will match and handle requests like GET /biu/<id>
func (a *App) GetData(id string) string {
    # todo: write your data query
    return "some data"
}

func NewApp() *App {
    return &App{}
}

app := App()
app.Run()
```

Your task is to connect to a MySQL database and retrieve data by id from it.
To connect to MySQL, assume we already have a `NewMySQLClient` method that returns a client to you. When initialized, pass an address to get a database connection, and assume it has an `Exec` method for you to execute parameters.

##### Without DI, Passing Dependency Instances via Global Variables

One way is to initialize the client globally outside and then have the App call it directly.

```go

var mysqlUrl = "mysql://blabla"
var db = NewMySQLClient(mysqlUrl)


type App struct {

}

func (a *App) GetData(id string) string {
    data := db.Exec("select data from biu where id = ? limit 1", id)
    return data
}


func NewApp() *App {
    return &App{}
}
func main() {
    app := App()
    app.Run()
}
```

This is not using dependency injection. The app depends on the global variable db, which is a poor practice. The db object is floating in the global scope, exposed to other modules in the package, which is risky. (Imagine what would happen if other code in this package secretly replaces your db variable during runtime.)

##### Without DI, Creating Dependency Instances in the App's Initialization Method

Another approach is like this:

```go
type App struct {
    db *MySQLClient
}

func (a *App) GetData(id string) string {
    data := a.db.Exec("select data from biu where id = ? limit 1", id)
    return data
}


func NewApp() *App {
    return &App{db: NewMySQLClient(mysqlUrl)}
}
func main() {
    app := NewApp("mysql://blabla")
    app.Run()
}
```

This method is slightly better. The db is embedded in the app, so no unrelated code outside the app can touch it, making it safer. But this is still not dependency injection, as the dependency is created internally. Next, you will see the problems it causes.

##### Boss: We Need to Store Data Elsewhere (Requiring Implementation Changes)

Your boss heard from somewhere that Redis is extremely fast and wants to change the data source to Redis. At this point, you're a bit frustrated, but since you need to make a living, you reluctantly change the code.

```go
type App struct {
    ds *RedisClient
}

func (a *App) GetData(id string) string {
    data := a.ds.Do("GET", "biu_"+id)
    return data
}


func NewApp() *App {
    return &App{ds: NewRedisClient(redisAddr)}
}

func main() {
    app := NewApp("redis://ooo")
    app.Run()
}
```

Basically, three modifications were made above:

1. The App initialization method was changed to initialize RedisClient.
2. The data retrieval in get_data was changed to use the run method, and the query statement was also changed.
3. The parameter passed during App instantiation was changed to the Redis address.

##### Boss: How About We Change the Storage Again? / We Need to Add Tests and Require Mocking

The boss always has broad ideas. After a couple of days, he wants to switch to Postgres for storage; or he asks you to write some test code for the App, specifically testing the logic inside the interface. Usually, we are reluctant to start another database alongside, so we need to mock the data source part to directly return data for the request handler to use, enabling targeted testing.

What to do in this situation? Change the internal code again? That's not scientific.

##### Programming to Interfaces

A crucial idea is to **program to interfaces**, not to implementations.

What does programming to implementations mean? For example, the modified parts in the above example: calling mysqlclient's exec_sql to execute a SQL statement was changed to calling redisclient's do to execute a get command. Because each client's interface design is different, every time the implementation changes, the code must be modified.

The idea of programming to interfaces is completely different. We shouldn't immediately write code based on what the boss wants. First, we must anticipate that the data source implementation is likely to change, so we should prepare (design) from the start.

###### Designing Interfaces

In Python, there is a concept called duck-typing: if it quacks like a duck, walks like a duck, and swims like a duck, then it is a duck. Here, quacking, walking, and swimming are the duck interfaces we agree upon, and if you fully implement these interfaces, we can treat you like a duck.

In our example above, whether it's a MySQL implementation or a Redis implementation, they both have a common function: using an id to query a piece of data. This is the common interface.

We can define an interface called DataSource, which must have a method called GetById that takes an id and returns a string.

```go
type DataSource interface {
    GetById(id string) string
}
```

Then we can encapsulate each data source separately, implementing the interface according to the interface definition. This way, the request handling part in our App can stably call the GetById method, and as long as the underlying data implementation implements the DataSource interface, it can be replaced flexibly without changing the internal code of the App.

```go
// Encapsulate Redis
type redis struct {
    r *RedisClient
}

func NewRedis(addr string) *redis {
    return &redis{r: NewRedisClient(addr)}
}

func (r *redis) GetById(id string) string {
    return r.r.Do("GET", "biu_"+id)
}


// Encapsulate MySQL
type mysql struct {
    m *MySQLClient
}

func NewMySQL(addr string) *mysql {
    return &mysql{m: NewMySQLClient(addr)}
}

func (m *mysql) GetById(id string) string {
    return r.m.Exec("select data from biu where id = ? limit 1", id)
}


type App struct {
    ds DataSource
}

func NewApp(addr string) *App {
    // When MySQL is needed
    return &App{ds: NewMySQLClient(addr)}

    // When Redis is needed
    return &App{ds: NewRedisClient(addr)}
}

```

Since both data sources implement the DataSource interface, one can be directly created and placed into the App. Want to use which one? Looks pretty good, right?

##### Wait, Something Seems Missing

Using addr as a parameter seems a bit simplistic. Usually, initializing a database connection may involve a bunch of parameters configured in a yaml file, which need to be parsed into a struct and then passed to the corresponding New method.

The configuration file might look like this:

```yaml
redis:
    addr: 127.0.0.1:6379
    read_timeout: 0.2s
    write_timeout: 0.2s
```

The parsed struct might look like this:

```go
type RedisConfig struct {
 Network      string             `json:"network,omitempty"`
 Addr         string             `json:"addr,omitempty"`
 ReadTimeout  *duration.Duration `json:"read_timeout,omitempty"`
 WriteTimeout *duration.Duration `json:"write_timeout,omitempty"`
}
```

As a result, your `NewApp` method might end up like this:

```go
func NewApp() *App {
    var conf *RedisConfig
    yamlFile, err := ioutil.ReadFile("redis_conf.yaml")
    if err != nil {
        panic(err)
    }
    err = yaml.Unmarshal(yamlFile, &conf)
    if err != nil {
        panic(err)
    }
    return &App{ds: NewRedisClient(conf)}
}
```

NewApp says, "Stop, you youngsters are不讲武德 (not following martial ethics). My responsibility is to create an App instance. I only need a DataSource registered into it. I don't want to care about how this DataSource comes about. Why should this chunk of conf processing code be placed here? I don't want to care whether your configuration file is obtained via a network request or read from a local disk. I just want to assemble the App and throw it out to get off work directly."

##### Dependency Injection Finally Makes Its Entrance

Remember what was said earlier about dependency injection? The dependent module is injected into (i.e., passed as a parameter to) the initialization function when the module is created. This pattern exactly allows NewApp to get off work early. We initialize NewRedis or NewMySQL outside and directly throw the resulting DataSource to NewApp.

That is:

```go
func NewApp(ds DataSource) *App {
    return &App{ds: ds}
}
```

Throw that chunk of code that reads the configuration file and initializes Redis into the method that initializes the DataSource.

```go
func NewRedis() DataSource {
    var conf *RedisConfig
    yamlFile, err := ioutil.ReadFile("redis_conf.yaml")
    if err != nil {
        panic(err)
    }
    err = yaml.Unmarshal(yamlFile, &conf)
    if err != nil {
        panic(err)
    }
    return &redis{r: NewRedisClient(conf)}
}
```

Going a step further, the NewRedis method doesn't even need to care about how the file is read. Its responsibility is only to initialize a DataSource through conf. Therefore, you can continue to extract the code that reads the config outward, making NewRedis take a conf and output a DataSource.

```go
func GetRedisConf() *RedisConfig
func NewRedis(conf *RedisConfig) DataSource
```

Because the entire assembly process was scattered in the main function before, we extract it into an independent initApp method. Finally, your App initialization logic becomes like this:

```go
func initApp() *App {
    c := GetRedisConf()
    r := NewRedis(c)
    app := NewApp(r)
    return app
}

func main() {
    app := initApp()
    app.Run()
}
```

Then, by implementing the DataSource interface, you can change the previous method of reading the configuration file and the method of creating the DataSource to arbitrarily modify your underlying implementation (the implementation of reading the configuration file and which DataSource to use for querying data) without having to change a lot of code each time. This makes your code hierarchy clearer and easier to maintain.

This is dependency injection.

##### Problems with Manual Dependency Injection

The chunk of code above that initializes each instance and then plugs them into the respective initialization methods according to their needs, ultimately constructing the app, is the process of injecting dependencies.

```go
c := GetRedisConf()
r := NewRedis(c)
app := NewApp(r)
```

Currently, there is only one DataSource, so writing the injection process manually is still acceptable. But once you have more things to maintain, for example, if your NewApp is like `NewApp(r *Redis, es *ES, us *UserSerivce, db *MySQL) *App` and among them, UserService is like `UserService(pg *Postgres, mm *Memcached)`, forming multi-level dependencies that need to be injected, writing it manually becomes very troublesome.

This is where dependency injection tools like wire come into play—their function is to **help you inject dependencies** by generating code, while the actual dependency instances need to be created (initialized) by yourself.

## How

The main problem with wire is that ~~you can't learn it by reading the documentation~~. Anyway, when I first read the documentation, I was completely confused—what is this? What is it supposed to do? But through our previous derivation process, we should roughly understand why to use dependency injection and what role wire plays in it—**helping you inject dependencies** by generating code, while the actual dependency instances need to be created (initialized) by yourself.

Next, it becomes clearer.

First, you need to implement a `wire.go` file, defining the Injector inside.

```go
// +build wireinject

func initApp() (*App) {
 panic(wire.Build(GetRedisConf, NewRedis, SomeProviderSet, NewApp))
}
```

Then implement the Providers separately.

After executing the `wire` command,
it will scan the entire project and help you generate a `wire_gen.go` file. If there is anything you haven't implemented properly, it will report an error.

~~Did you get it?~~

### Reunderstanding

Wait, don't give up yet. Let's use ~~magical Chinese programming~~ to explain how to do it.

#### Who Participates in Compilation?

The `initApp` method above, officially called Injector, due to the comment `// +build wireinject` on the first line of the file, this wire.go file will only be read by wire. The Go compiler will ignore it during code compilation; the actual file read is the generated wire_gen.go file.

The Providers are part of your code and will definitely participate in the compilation process.

#### What the Heck is an Injector?

The Injector is the final result you want—the initialization function of the final App object, which is the `initApp` method in the previous example.

Think of it as going to McDonald's, entering and seeing the ordering machine, tapping a bunch of items, and finally printing out a receipt.

```go
// +build wireinject

func 来一袋垃圾食品() 一袋垃圾食品 {
    panic(wire.Build(来一份巨无霸套餐, 来一份双层鳕鱼堡套餐, 来一盒麦乐鸡, 垃圾食品打包))
}
```

This is your order. It does not participate in compilation; the code that actually participates in compilation is generated by wire for you.

#### What the Heck is a Provider?

Providers are the methods that create each dependency, such as NewRedis and NewApp in the previous example.

You can think of them as what the McDonald's staff and kitchen need to do:
The McDonald's kitchen needs to provide the cooking services for these food items—implement these instance initialization methods.

```go
func 来一盒麦乐鸡() 一盒麦乐鸡 {}
func 垃圾食品打包(一份巨无霸套餐, 一份双层鳕鱼堡套餐, 一盒麦乐鸡) 一袋垃圾食品 {}
```

In wire, there is also the concept of a ProviderSet, which is packaging a group of Providers. Usually, when you order, you are lazy and don't want to order your Big Mac meal like this: I want a Coke, a pack of fries, and a Big Mac burger; you want to just tap once and get a Big Mac meal. This meal is the ProviderSet, a predefined set of recipes. Otherwise, your order list (the Build in the injector) would become super long, which is troublesome for you and tiring for the staff to look at.

Using one of the meals as an example:

```go
// First define the meal contents
var 巨无霸套餐 = wire.NewSet(来一杯可乐，来一包薯条，来一个巨无霸汉堡)

// Then implement the preparation methods for each food item
func 来一杯可乐() 一杯可乐 {}
func 来一包薯条() 一包薯条 {}
func 来一个巨无霸汉堡() 一个巨无霸汉堡 {}
```

#### What Does the Wire Tool Do?

Important thing said three times: **help you inject dependencies** by generating code.

In the McDonald's example, wire is the staff member who, according to your order, calls the corresponding colleagues to prepare each food item/meal and finally packs it for you as required. This intermediate