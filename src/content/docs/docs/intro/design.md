---
id: design
title: Design
description: This document describes the design philosophy of Kratos and introduces the overall situation and main components of the project.
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
This document describes the design philosophy of Kratos and introduces the overall situation and main components of the project.

## Design Philosophy
Kratos is a microservice framework implemented in Go language. To be more precise, it's more like a toolbox for building microservices in Go. Developers can choose or customize the components according to their own habits to create their own microservices. Kratos is not bound to a specific infrastructure, not limited to a certain registry, or database ORM. So that you can easily integrate any library into your project and work with Kratos.

Around this core design concept, we have designed the following project ecology：

* [kratos](https://github.com/go-kratos/kratos) Kratos framework core. It mainly includes basic CLI tools, HTTP/gRPC interface generation tools and service life cycle management. Provides components and interface definitions for link tracking, configuration, logging, service discovery, and monitoring.
* [contrib](https://github.com/go-kratos/kratos/tree/main/contrib) A series of components such as configuration, logging, service discovery, monitoring, etc. You can use them directly. Or you can refer to their code to adapt the services you need to integrate them into the kratos project.
* [aegis](https://github.com/go-kratos/aegis) We put the service availability algorithm (current limit, circuit breaker, etc.) in this independent project. It has few external dependencies, nor does it depend on Kratos. You can easily integrate it into Kratos to improve the usability of the service. Or you can use it directly in any project.
* [layout](https://github.com/go-kratos/kratos-layout) A default project template we designed. It contains a project structure, Makefile script and Dockerfile with reference to DDD and clean architecture design. But this project template is not required. You can modify it however you want, or use a project structure of your own design and Kratos will still work. The framework is highly customizable and does not make any assumptions or restrictions on the project structure itself. You can use it according to your own ideas.
* [gateway](https://github.com/go-kratos/gateway) This is the API Gateway we just started developing with Go. Later, you can use it as a gateway for your Kratos microservices for the governance of microservice APIs. The project is under construction, please pay attention.

## Community
* GitHub：[https://github.com/go-kratos](https://github.com/go-kratos)
* Documents：[https://go-kratos.dev/](https://go-kratos.dev/)
* Wechat：[go-kratos Official WeChat Group](https://github.com/go-kratos/kratos/issues/682)
* Discord：[go-kratos](https://discord.com/invite/BWzJsUJ)

## Why Kratos V2 was completely redesigned
Those who have paid attention to the kratos project before may know that the v1 version of Kratos has been open source for a long time, and it is also a relatively complete framework. So why not continue to iterate directly based on v1, but start over and launch a completely redesigned v2?

A fall into a ditch makes you wiser.

We found that with the continuous iteration of the business and the continuous expansion of the project, the past framework and project structure design led to a gradual increase in the cost of code changes. And there is no reasonable abstraction, which makes it more difficult to test modules, and it is more difficult to adapt and migrate third-party basic libraries. This reduces productivity to some extent.

Therefore, we have redesigned the project structure of microservices with reference to a large number of advanced design concepts in the industry such as DDD and Clean Architecture. And this structure will be further iterated with our follow-up research, making it the best practice for microservice project structure.

That's right, the new version starts with kratos-layout. Maybe you will feel uncomfortable when you are new to this project structure. But as the project iterates and the code complexity increases, this well-defined structure will keep the project excellent code readability, testability, and satisfactory development efficiency and maintainability.

More importantly, this time we want to design and develop this framework for the community. Get more developers to use our framework to be more productive while participating in our projects.

So we designed the entire framework as a socket, and we hoped that the entire framework would be lightweight, plug-in, and customizable. For almost every functional module related to microservices, we have designed standardized interfaces, and designed plug-ins for third-party libraries. This makes it possible to quickly integrate arbitrary infrastructure into projects using Kratos. So, no matter what infrastructure your company uses or what specifications you have, you can easily customize Kratos to match your development and production environments.

Without destruction there can be no construction. The V2 is a complete overhaul from the inside out. We were unable to tinker on the old version and chose to redesign and develop the new version. At present, the v2 version has also been used in many production environments. We will also continue to iterate and improve this framework. At the same time, all developers are welcome to participate and make it better together.

## Database/Cache/Message Queue/...

As mentioned earlier, the Kratos framework does not restrict you to use any third-party library for project development, so you can choose a library for integration according to your preference. We will also gradually develop plugins for more widely used third-party libraries.

Here is some popular libary:

Database:
* [database/sql](https://pkg.go.dev/database/sql)
* [gorm](https://github.com/go-gorm/gorm) 
* [ent](https://github.com/ent/ent)

Cache:
* [go-redis](https://github.com/go-redis/redis)
* [redigo](https://github.com/gomodule/redigo)
* [gomemcache](https://github.com/bradfitz/gomemcache)

Message Queue:
* [sarama](https://github.com/Shopify/sarama) kafka client
* [kafka-go](https://github.com/segmentio/kafka-go)

Want more？ Please visit [awesome-go](https://github.com/avelino/awesome-go)

## CLI Tool

CLI are currently mainly used to create projects from templates, maintain dependency package versions, etc. For more details please visit [Document](https://go-kratos.dev/docs/getting-started/usage)

## API

Kratos uses Protobuf for API definition. Protobuf is a language-neutral data serialization protocol developed by Google. It has the characteristics of clear structure definition, good scalability, small size, and excellent performance, and is widely used in many companies and projects.

In a project using Kratos, you will use the following IDL for your interface definition, and use the `protoc` tool to generate the corresponding `.pb.go` file, which contains the server and client code generated according to the definition. Then you can register server-side code for use within your own project, or reference client-side code to make remote calls.

Kratos only generates the code of the gRPC interface by default. If you need to generate HTTP code, please use `option (google.api.http)` in the proto file to add the definition of the HTTP part before generating it. By default, the HTTP interface will use JSON as the serialization format. If you want to use other serialization formats (form, XML, etc.), please refer to [Serialization](https://go-kratos.dev/docs/component/encoding).

```protobuf
syntax = "proto3";

package helloworld.v1;

import "google/api/annotations.proto";

option go_package = "github.com/go-docs/docs-layout/api/helloworld/v1;v1";

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply)  {
        option (google.api.http) = {
            get: "/helloworld/{name}"
        };
    }
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```
It should be noted that although the API defined by Protobuf is more reliable, the flexibility of the field structure is weaker than that of JSON. Therefore, if you have a file upload interface, or some JSON structure that cannot correspond to proto. You can define these interfaces outside of our API-System, implement as normal `http.Handler` and mount it on the route, or just use `struct` to define your fields. Here is an example of [upload](https://github.com/go-kratos/kratos/blob/main/examples/http/upload/main.go).

## Metadata

For API calls between services, if there is some meta information that needs passing with no expected appearance in the payload message, you can use the Metadata package for field setting and extraction. For more detail, please refer to the [document](https://go-kratos.dev/docs/component/metadata)

## Error Handling
Kratos' [errors](https://github.com/go-kratos/kratos/tree/main/errors) module provides an error wrapper. The framework also pre-defines a set of [standard errors](https://github.com/go-kratos/kratos/blob/main/errors/types.go) for use.

The design of error handling was settled after a long discussion. The main design concepts are as follows:

1. `code` The semantics are similar to the HTTP Status Code (for example, 400 is used for parameter errors), and it is also used as a major type of error. The advantage is that the gateway layer can trigger corresponding policies (retry, current limit, fuse, etc.) according to this code.
2. `reason` The specific error code of the service. A readable string that should be unique within the same service.
3. `message` Messages are user-readable and can be used as user prompts.
4. `metadata` Meta-information, which adds additional extensible information for errors.

Taking the HTTP interface as an example, the structure of the returned error message is as follows:
```json
{
    // Error code, which is the same as HTTP-status and can be converted to grPC-status in GRPC.
    "code": 500,
    // The error cause is defined as the service decision error code. 
    "reason": "USER_NOT_FOUND",
    // Error messages are user-readable and can be used as user prompts. 
    "message": "invalid argument error",
    // Error meta-information, which adds additional extensible information for errors.
    "metadata": {"some-key": "some-value"}
}
```

In Kratos, you can use proto files to define your business errors, and generate corresponding processing logic and methods through tools.(such as `make errors` used in layout)

Error Definition:
```protobuf
syntax = "proto3";

package api.blog.v1;
import "errors/errors.proto";

option go_package = "github.com/go-docs/docs/examples/blog/api/v1;v1";

enum ErrorReason {
  // default error code
  option (errors.default_code) = 500;
  
  // custome error code
  USER_NOT_FOUND = 0 [(errors.code) = 404];
  CONTENT_MISSING = 1 [(errors.code) = 400];;
}
```

Error Creation:
```go
// Created by errors.New()
errors.New(500, "USER_NAME_EMPTY", "user name is empty")

// Created by the code that is generated by proto
api.ErrorUserNotFound("user %s not found", "docs")

// Passing metadata
err := errors.New(500, "USER_NAME_EMPTY", "user name is empty")
err = err.WithMetadata(map[string]string{
    "foo": "bar",
})
```

Error Assertion:
```go
err := wrong()

// Asserte by errors.Is()
if errors.Is(err,errors.BadRequest("USER_NAME_EMPTY","")) {
    // do something
}

// Asserte by *Error.Reason and *Error.Code
e := errors.FromError(err)
if  e.Reason == "USER_NAME_EMPTY" && e.Code == 500 {
    // do something
}

// Asserte by the code that is generated by proto
if api.IsUserNotFound(err) {
        // do something
})
```

## Configuration

Kratos provides a unified interface that supports loading a configuration file and subscribing to its changes.Any configuration source (local or remote) can be adapted by implementing [Source and Watcher](https://github.com/go-kratos/kratos/blob/main/config/source.go)

Here is some plugins ready for use:

* [file](https://github.com/go-kratos/kratos/blob/main/config/file/file.go) built-in
* [apollo](https://github.com/go-kratos/kratos/tree/main/contrib/config/apollo)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/config/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/config/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/config/nacos)


## Registrar&Discovery
Kratos defines a unified registration interface. By implementing [Registrar and Discovery](https://github.com/go-kratos/kratos/blob/main/registry/registry.go), you can easily connect Kratos to your registry.

Here is some plugins ready for use:

* [consul](https://github.com/go-kratos/kratos/tree/main/contrib/registry/consul)
* [discovery](https://github.com/go-kratos/kratos/tree/main/contrib/registry/discovery)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/registry/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/registry/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/registry/nacos)
* [zookeeper](https://github.com/go-kratos/kratos/tree/main/contrib/registry/zookeeper)


## Log
Kratos' logging module consists of two parts:

1. [Logger](https://github.com/go-kratos/kratos/blob/main/log/log.go): Low-level logging interface. It is used to quickly adapt various log libraries to the framework. Provides only one of the simplest `Log` methods.
2. [Helper](https://github.com/go-kratos/kratos/blob/main/log/helper.go): Advanced logging interface. A series of helper functions with log levels and formatting methods are provided. It is usually recommended to use this in business logic to simplify logging code.

We have implemented plug-ins to for some current logging library. You can also refer to their code for the log library adaptation you need:

* [std](https://github.com/go-kratos/kratos/blob/main/log/std.go) Kratos built-in stdout
* [fluent](https://github.com/go-kratos/kratos/tree/main/contrib/log/fluent)
* [zap](https://github.com/go-kratos/kratos/tree/main/contrib/log/zap)

## Metrics
In terms of monitoring alarms, you can report service statistics to the monitoring platform by implementing [Metrics](https://github.com/go-kratos/kratos/blob/main/metrics/metrics.go).

Here is some plugins ready for use:

* [datadog](https://github.com/go-kratos/kratos/tree/main/contrib/metrics/datadog)
* [prometheus](https://github.com/go-kratos/kratos/tree/main/contrib/metrics/prometheus)

## Tracing
Kratos uses [OpenTelemetry](https://opentelemetry.io/) as the standard for distributed link tracing. You can configure the [tracing middleware](https://go-kratos.dev/docs/component/middleware/tracing) when the client and server are initialized to connect the service to the link tracing platform (such as [jaeger](https://www.jaegertracing.io/), etc.). In this way, the interface calling relationship, time-consuming, errors, etc. of the service are tracked.

## Load Balancing
Kratos has several built-in load [balancing algorithms](https://github.com/go-kratos/kratos/tree/main/selector), such as Weighted round robin (default), P2C, Random, etc. You can use them by configuring them during [client initialization](https://go-kratos.dev/docs/component/selector).

## Ratelimit

Kratos provides [Ratelimit](https://go-kratos.dev/docs/component/middleware/ratelimit) and [Circuitbreaker](https://go-kratos.dev/docs/component/middleware/circuitbreaker) middleware, which are used to automatically limit traffic when microservices fail abnormally, improve service robustness, and avoid avalanches. The algorithms used by these two middleware can also be found in our availability algorithm repository [Aegis](https://github.com/go-kratos/aegis). These algorithms can be used directly independently of Kratos.

## Middleware
You can unify some common logic of the microservice interface through Kratos' middleware mechanism. For the function plugin mentioned above, you can write middleware that Kratos can use by implementing `Middleware`.

You can find a series of middleware provided by us in the [middleware](https://github.com/go-kratos/kratos/tree/main/middleware) directory of the repository.

## Plugins

In addition to the plugins mentioned above, we also provide some other plugins. Please visit [Plugins](https://go-kratos.dev/docs/getting-started/plugin)

## Examples

If you still have doubts about the use of some components after reading the documentation, or want to find some inspiration for writing projects in Kratos, we provide a lot of code for reference in the [examples repository](https://github.com/go-kratos/examples) directory.
