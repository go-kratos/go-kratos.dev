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

* [kratos](https://github.com/go-kratos/kratos) Kratos框架核心，主要包含了基础的CLI工具，内置的HTTP/gRPC接口生成和服务生命周期管理，提供链路追踪、配置文件、日志、服务发现、监控等组件能力和相关接口定义。
* [contrib](https://github.com/go-kratos/kratos/tree/main/contrib) 基于上述核心定义的基础接口，对配置文件、日志、服务发现、监控等服务进行具体实现所形成的一系列插件，可以直接使用它们，也可以参考它们的代码，做您需要的服务的适配，从而集成进kratos项目中来。
* [aegis](https://github.com/go-kratos/aegis) 我们将服务可用性相关的算法：如限流、熔断等算法放在了这个独立的项目里，几乎没有外部依赖，它更不依赖Kratos，您可以在直接在任意项目中使用。您也可以轻松将它集成到Kratos中使用，提高服务的可用性。
* [layout](https://github.com/go-kratos/kratos-layout) 我们设计的一个默认的项目模板，它包含一个参考了DDD和简洁架构设计的项目结构、Makefile脚本和Dockerfile文件。但这个项目模板不是必需的，您可以任意修改它，或使用自己设计的项目结构，Kratos依然可以正常工作。框架本身不对项目结构做任何假设和限制，您可以按照自己的想法来使用，具有很强的可定制性。
* [gateway](https://github.com/go-kratos/gateway) 这个是我们刚刚起步，用Go开发的API Gateway，后续您可以使用它来作为您Kratos微服务的网关，用于微服务API的治理，项目正在施工中，欢迎关注。

## Community
* GitHub：[https://github.com/go-kratos](https://github.com/go-kratos)
* Documents：[https://go-kratos.dev/](https://go-kratos.dev/)
* Wechat：[go-kratos Official WeChat Group](https://github.com/go-kratos/kratos/issues/682)
* Discord：[go-kratos](https://discord.com/invite/BWzJsUJ)

## 为什么v2完全重新设计
以前关注过kratos项目的可能知道，Kratos的[v1](https://github.com/go-kratos/kratos/tree/v1.0.x)版本已经开源了很久，也是个较为完善的框架。那么为什么不直接基于v1继续迭代，而是要推倒重来，推出完全重新设计的v2呢？

经验源自踩坑。

在业务不断迭代、项目不断膨胀的情况下，我们发现，过去的框架和项目结构设计，导致代码变更成本逐渐升高，而没有进行合理的抽象，导致更难进行模块的测试，也更难对第三方基础库进行适配和迁移，这在一定程度上拉低了生产力。

因此，我们参考了大量的DDD和Clean Architecture等业界先进设计理念，重新设计了微服务的项目结构，并且这个结构随着我们的后续研究，会进一步进行迭代，让它成为微服务项目结构的最佳实践。

没错，新版本的是从kratos-layout开始的。也许刚接触这个项目结构时会觉得不适应，但随着项目迭代，代码复杂度的提高，这个定义良好的结构，将使项目保持优秀的代码可读性、可测试性，以及令人满意的开发效率和可维护性。

更重要的一点是，这一次我们想面向社区来设计和开发这个框架。让更多的开发者能够使用我们的框架来提高生产力，同时参与到我们的项目中来。

所以我们把整个框架设计成为一个插座，我们希望整个框架轻量，插件化，可定制。对于几乎每一个微服务相关的功能模块，我们都设计了标准化接口，对于第三方库设计为插件，这样就能迅速把任意基础设施集成到使用Kratos的项目里，因此，无论您的公司使用何种基础设施，有何种规范，您都可以轻松将Kratos定制成与您的开发、生产环境相匹配的样子。

不破不立，v2是一次从内到外的彻底革新，我们无法在旧版本上修修补补，而是选择重新设计和开发新版本。而目前v2版本也已经在很多生产环境使用，我们也将持续迭代和完善这个框架，同时也更欢迎各位开发者参与进来，一起让它变得更好。

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

option go_package = "github.com/go-kratos/kratos-layout/api/helloworld/v1;v1";

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
Kratos的[errors](https://github.com/go-kratos/kratos/tree/main/errors)模块提供了error的封装。框架也预定义了一系列[标准错误](https://github.com/go-kratos/kratos/blob/main/errors/types.go)供使用。


错误处理这一块的设计也经过了很久的讨论才定下来，主要设计理念如下：

1. `code` 语义近似HTTP的Status Code（例如客户端传参数错误用400）同时也作为大类错误，在HTTP接口中的HTTP Code会使用它，好处是网关层可以根据这个code触发相应策略（重试、限流、熔断等）。
2. `reason` 业务的具体错误码，为可读的字符串，能够表明，在同一个服务中应该唯一。
3. `message` 用户可读的信息，可以在客户端（App、浏览器等）进行相应的展示给用户看。
4. `metadata` 为一些附加信息，可以作为补充信息使用。

在API返回的错误信息中，以HTTP接口为例，消息结构大概是长这个样子的：
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


在Kratos中您可以使用proto文件定义您的业务错误，并通过工具生成对应的处理逻辑和方法。（如使用layout中提供的`make errors`指令。）

错误定义：
```protobuf
syntax = "proto3";

package api.blog.v1;
import "errors/errors.proto";

option go_package = "github.com/go-kratos/kratos/examples/blog/api/v1;v1";

enum ErrorReason {
  // default error code
  option (errors.default_code) = 500;
  
  // custome error code
  USER_NOT_FOUND = 0 [(errors.code) = 404];
  CONTENT_MISSING = 1 [(errors.code) = 400];;
}
```

错误创建：
```go
// 通过 errors.New() 响应错误
// Created by errors.New()
errors.New(500, "USER_NAME_EMPTY", "user name is empty")

// 通过 proto 生成的代码响应错误，并且包名应替换为自己生成代码后的 package name
api.ErrorUserNotFound("user %s not found", "kratos")

// 传递metadata
err := errors.New(500, "USER_NAME_EMPTY", "user name is empty")
err = err.WithMetadata(map[string]string{
    "foo": "bar",
})
```

错误断言：
```go
err := wrong()

// 通过 errors.Is() 断言
if errors.Is(err,errors.BadRequest("USER_NAME_EMPTY","")) {
    // do something
}

// 通过判断 *Error.Reason 和 *Error.Code
e := errors.FromError(err)
if  e.Reason == "USER_NAME_EMPTY" && e.Code == 500 {
    // do something
}

// 通过 proto 生成的代码断言错误，并且包名应替换为自己生成代码后的 package name
if api.IsUserNotFound(err) {
        // do something
})
```

## Configuration
Kratos提供了统一的接口，支持配置文件的加载和变更订阅。

通过实现[Source 和 Watcher](https://github.com/go-kratos/kratos/blob/main/config/source.go)即可实现任意配置源（本地或远程）的配置文件加载和变更订阅。

已经实现了下列插件：

* [file](https://github.com/go-kratos/kratos/blob/main/config/file/file.go) 本地文件加载，Kratos内置
* [apollo](https://github.com/go-kratos/kratos/tree/main/contrib/config/apollo)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/config/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/config/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/config/nacos)


## Registrar&Discovery
Kratos定义了统一的注册接口，通过实现[Registrar和Discovery](https://github.com/go-kratos/kratos/blob/main/registry/registry.go)，您可以很轻松地将Kratos接入到您的注册中心中。

您也可以直接使用我们已经实现好的插件：

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

我们已经实现好的插件用于适配目前一些日志库，您也可以参考它们的代码来实现自己需要的日志库的适配：

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
