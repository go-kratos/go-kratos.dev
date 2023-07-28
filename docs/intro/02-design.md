---
id: design
title: 设计理念
description: 本篇文档阐述Kratos的设计理念，介绍Kratos项目的整体情况和主要组件
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
本篇文档阐述Kratos的设计理念，介绍Kratos项目的整体情况和主要组件。

## 设计哲学

Kratos是一个Go语言实现的微服务框架，说得更准确一点，它更类似于一个使用Go构建微服务的工具箱，开发者可以按照自己的习惯选用或定制其中的组件，来打造自己的微服务。也正是由于这样的原因，Kratos并不绑定于特定的基础设施，不限定于某种注册中心，或数据库ORM等，所以您可以十分轻松地将任意库集成进项目里，与Kratos共同运作。

围绕这样的核心设计理念，我们设计了如下的项目生态：

* [kratos](https://github.com/go-kratos/kratos) Kratos框架核心，主要包含了基础的CLI工具，内置的HTTP/gRPC接口生成和服务生命周期管理，提供链路追踪、配置文件、日志、服务发现、监控等组件能力和相关接口定义。
* [contrib](https://github.com/go-kratos/kratos/tree/main/contrib) 基于上述核心定义的基础接口，对配置文件、日志、服务发现、监控等服务进行具体实现所形成的一系列插件，可以直接使用它们，也可以参考它们的代码，做您需要的服务的适配，从而集成进kratos项目中来。
* [aegis](https://github.com/go-kratos/aegis) 我们将服务可用性相关的算法：如限流、熔断等算法放在了这个独立的项目里，几乎没有外部依赖，它更不依赖Kratos，您可以在直接在任意项目中使用。您也可以轻松将它集成到Kratos中使用，提高服务的可用性。
* [layout](https://github.com/go-kratos/kratos-layout) 我们设计的一个默认的项目模板，它包含一个参考了DDD和简洁架构设计的项目结构、Makefile脚本和Dockerfile文件。但这个项目模板不是必需的，您可以任意修改它，或使用自己设计的项目结构，Kratos依然可以正常工作。框架本身不对项目结构做任何假设和限制，您可以按照自己的想法来使用，具有很强的可定制性。
* [gateway](https://github.com/go-kratos/gateway) 这个是我们刚刚起步，用Go开发的API Gateway，后续您可以使用它来作为您Kratos微服务的网关，用于微服务API的治理，项目正在施工中，欢迎关注。

## 仓库、文档和社区

* GitHub仓库：[https://github.com/go-kratos](https://github.com/go-kratos)
* 文档：[https://go-kratos.dev/](https://go-kratos.dev/)
* 微信群：[go-kratos 官方微信群](https://github.com/go-kratos/kratos/issues/682)
* Discord：[go-kratos](https://discord.com/invite/BWzJsUJ)

## 为什么v2完全重新设计

以前关注过 `kratos` 项目的可能知道，Kratos的[v1](https://github.com/go-kratos/kratos/tree/v1.0.x)版本已经开源了很久，也是个较为完善的框架。那么为什么不直接基于v1继续迭代，而是要推倒重来，推出完全重新设计的v2呢？

经验源自踩坑。

在业务不断迭代、项目不断膨胀的情况下，我们发现，过去的框架和项目结构设计，导致代码变更成本逐渐升高，而没有进行合理的抽象，导致更难进行模块的测试，也更难对第三方基础库进行适配和迁移，这在一定程度上拉低了生产力。

因此，我们参考了大量的DDD和Clean Architecture等业界先进设计理念，重新设计了微服务的项目结构，并且这个结构随着我们的后续研究，会进一步进行迭代，让它成为微服务项目结构的最佳实践。

没错，新版本的是从kratos-layout开始的。也许刚接触这个项目结构时会觉得不适应，但随着项目迭代，代码复杂度的提高，这个定义良好的结构，将使项目保持优秀的代码可读性、可测试性，以及令人满意的开发效率和可维护性。

更重要的一点是，这一次我们想面向社区来设计和开发这个框架。让更多的开发者能够使用我们的框架来提高生产力，同时参与到我们的项目中来。

所以我们把整个框架设计成为一个插座，我们希望整个框架轻量，插件化，可定制。对于几乎每一个微服务相关的功能模块，我们都设计了标准化接口，对于第三方库设计为插件，这样就能迅速把任意基础设施集成到使用Kratos的项目里，因此，无论您的公司使用何种基础设施，有何种规范，您都可以轻松将Kratos定制成与您的开发、生产环境相匹配的样子。

不破不立，v2是一次从内到外的彻底革新，我们无法在旧版本上修修补补，而是选择重新设计和开发新版本。而目前v2版本也已经在很多生产环境使用，我们也将持续迭代和完善这个框架，同时也更欢迎各位开发者参与进来，一起让它变得更好。

## 数据库/缓存/消息队列/

正如前文提到的，Kratos框架不限制您使用任何第三方库来进行项目开发，因此您可以根据喜好来选择库进行集成。我们也会逐步针对更多被广泛使用的第三方库开发插件。

这里给出一些被广泛使用的库供参考：

数据库：

* [database/sql](https://pkg.go.dev/database/sql) 官方库
* [gorm](https://github.com/go-gorm/gorm)
* [ent](https://github.com/ent/ent)

缓存：

* [go-redis](https://github.com/go-redis/redis)
* [redigo](https://github.com/gomodule/redigo)
* [gomemcache](https://github.com/bradfitz/gomemcache)

消息队列：

* [sarama](https://github.com/Shopify/sarama) kafka客户端
* [kafka-go](https://github.com/segmentio/kafka-go)

其它更多的优秀go库，可以在[awesome-go](https://github.com/avelino/awesome-go)这个仓库中找找。

## CLI工具

kratos命令目前主要用于从模板创建项目，维护依赖包版本等。具体请参考[文档](https://go-kratos.dev/docs/getting-started/usage)

## Protobuf定义API

Kratos使用Protobuf进行API定义。Protobuf是由Google开发的一种语言中立的数据序列化协议。它有结构定义清晰、可扩展性好、体积小、性能优秀等特点，在众多公司和项目被广泛使用。

在使用Kratos的项目中，您将使用如下的IDL进行您的接口定义，并且通过`protoc`工具生成相应的`.pb.go`文件，其中包含根据定义生成的服务端和客户端代码。随后您就可以在自己的项目内部注册服务端代码使用，或引用客户端代码进行远程调用。

Kratos默认仅生成gRPC接口的代码，如果需要生成HTTP代码，请在proto文件中使用`option (google.api.http)`来添加HTTP部分的定义后再进行生成。默认情况下，HTTP接口将使用JSON作为序列化格式，如果想使用其它序列化格式（form，XML等），请参考文档[序列化](https://go-kratos.dev/docs/component/encoding)进行相应的配置即可。

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

需要注意，虽然Protobuf定义的API的可靠性更强，但字段结构灵活性相对JSON要弱一些，因此如果您有诸如文件上传接口，或者某些无法对应到proto的JSON结构需要使用，我们还提供了“逃生门”，在我们的Protobuf体系之外定义这些接口，实现为普通的http.Handler并且挂载到路由上，或者用struct来定义您的字段。可以参考我们的[upload例子](https://github.com/go-kratos/examples/blob/main/http/upload/main.go)进行实现。

## 元信息传递

服务之间的API调用，如果有某些元信息需要传递过去，而不是写在payload消息中，可以使用Metadata包进行字段设置和提取，具体细节参考[元信息传递文档](https://go-kratos.dev/docs/component/metadata)

## 错误处理

Kratos的[errors](https://github.com/go-kratos/kratos/tree/main/errors)模块提供了error的封装。框架也预定义了一系列[标准错误](https://github.com/go-kratos/kratos/blob/main/errors/types.go)供使用。

错误处理这一块的设计也经过了很久的讨论才定下来，主要设计理念如下：

1. `code` 语义近似HTTP的Status Code（例如客户端传参数错误用400）同时也作为大类错误，在HTTP接口中的HTTP Code会使用它，好处是网关层可以根据这个code触发相应策略（重试、限流、熔断等）。
2. `reason` 业务的具体错误码，为可读的字符串，能够表明，在同一个服务中应该唯一。
3. `message` 用户可读的信息，可以在客户端（App、浏览器等）进行相应的展示给用户看。
4. `metadata` 为一些附加信息，可以作为补充信息使用。

在API返回的错误信息中，以HTTP接口为例，消息结构大概是长这个样子的：

```json
{
    // 错误码，跟 http-status 一致，并且在 grpc 中可以转换成 grpc-status
    "code": 500,
    // 错误原因，定义为业务判定错误码
    "reason": "USER_NOT_FOUND",
    // 错误信息，为用户可读的信息，可作为用户提示内容
    "message": "invalid argument error",
    // 错误元信息，为错误添加附加可扩展信息
    "metadata": {"some-key": "some-value"}
}
```

在Kratos中您可以使用proto文件定义您的业务错误，并通过工具生成对应的处理逻辑和方法。（如使用layout中提供的`make errors`指令。）

错误定义：

```protobuf
syntax = "proto3";

package api.blog.v1;
import "errors/errors.proto";

option go_package = "github.com/go-kratos/examples/blog/api/v1;v1";

enum ErrorReason {
  // 设置缺省错误码
  option (errors.default_code) = 500;
  
  // 为某个枚举单独设置错误码
  USER_NOT_FOUND = 0 [(errors.code) = 404];
  CONTENT_MISSING = 1 [(errors.code) = 400];;
}
```

错误创建：

```go
// 通过 errors.New() 响应错误
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
}
```

## 配置文件

Kratos提供了统一的接口，支持配置文件的加载和变更订阅。

通过实现[Source 和 Watcher](https://github.com/go-kratos/kratos/blob/main/config/source.go)即可实现任意配置源（本地或远程）的配置文件加载和变更订阅。

已经实现了下列插件：

* [file](https://github.com/go-kratos/kratos/blob/main/config/file/file.go) 本地文件加载，Kratos内置
* [apollo](https://github.com/go-kratos/kratos/tree/main/contrib/config/apollo)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/config/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/config/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/config/nacos)

## 服务注册&服务发现

Kratos定义了统一的注册接口，通过实现[Registrar和Discovery](https://github.com/go-kratos/kratos/blob/main/registry/registry.go)，您可以很轻松地将Kratos接入到您的注册中心中。

您也可以直接使用我们已经实现好的插件：

* [consul](https://github.com/go-kratos/kratos/tree/main/contrib/registry/consul)
* [discovery](https://github.com/go-kratos/kratos/tree/main/contrib/registry/discovery)
* [etcd](https://github.com/go-kratos/kratos/tree/main/contrib/registry/etcd)
* [kubernetes](https://github.com/go-kratos/kratos/tree/main/contrib/registry/kubernetes)
* [nacos](https://github.com/go-kratos/kratos/tree/main/contrib/registry/nacos)
* [zookeeper](https://github.com/go-kratos/kratos/tree/main/contrib/registry/zookeeper)

## 日志

Kratos的日志模块由两部分组成：

1. [Logger](https://github.com/go-kratos/kratos/blob/main/log/log.go)：底层日志接口，用于快速适配各种日志库到框架中来，仅提供一个最简单的Log方法。
2. [Helper](https://github.com/go-kratos/kratos/blob/main/log/helper.go)：高级日志接口，提供了一系列带有日志等级和格式化方法的帮助函数，通常业务逻辑中建议使用这个，能够简化日志代码。

我们已经实现好的插件用于适配目前一些日志库，您也可以参考它们的代码来实现自己需要的日志库的适配：

* [std](https://github.com/go-kratos/kratos/blob/main/log/std.go) 标准输出，Kratos内置
* [fluent](https://github.com/go-kratos/kratos/tree/main/contrib/log/fluent)
* [zap](https://github.com/go-kratos/kratos/tree/main/contrib/log/zap)

## 监控

监控告警方面，您可以通过实现[metrics相关接口](https://github.com/go-kratos/kratos/blob/main/metrics/metrics.go)将服务的统计数据上报给监控平台。

也可以直接使用我们已经实现好的插件：

* [datadog](https://github.com/go-kratos/kratos/tree/main/contrib/metrics/datadog)
* [prometheus](https://github.com/go-kratos/kratos/tree/main/contrib/metrics/prometheus)

## 链路追踪

Kratos使用[OpenTelemetry](https://opentelemetry.io/)作为分布式链路追踪所使用的标准，您可以通过对client和server[配置tracing](https://go-kratos.dev/docs/component/middleware/tracing)来将服务接入到链路追踪平台（如[jaeger](https://www.jaegertracing.io/)等），从而对服务的接口调用关系，耗时，错误等进行追踪。

## 负载均衡

Kratos内置了若干种[负载均衡算法](https://github.com/go-kratos/kratos/tree/main/selector)，如Weighted round robin（默认）、P2C，Random等，您可以通过[在client初始化时配置](https://go-kratos.dev/docs/component/selector)来使用他们。

## 限流熔断

Kratos提供了[限流ratelimit](https://go-kratos.dev/docs/component/middleware/ratelimit)和[熔断circuitbreaker](https://go-kratos.dev/docs/component/middleware/circuitbreaker)中间件，用于微服务出现异常故障时自动对流量进行限制，提升服务的健壮性，避免雪崩。这两个中间件使用的算法，也可以在我们的可用性算法仓库[aegis](https://github.com/go-kratos/aegis)中找到，独立于Kratos直接使用。

## 中间件

您可以通过Kratos的middleware机制，统一微服务接口的某些共同逻辑。上面提到的功能插件，您可以通过实现[Middleware](https://github.com/go-kratos/kratos/blob/main/middleware/middleware.go)编写Kratos能够使用的中间件。

同时在仓库的[middleware](https://github.com/go-kratos/kratos/tree/main/middleware)目录下，我们也提供了一系列中间件供您使用。

## 插件

除了上述提到的插件外，我们还提供了一些其它插件，完整的插件列表请参考文档[社区插件](https://go-kratos.dev/docs/getting-started/plugin)

## 示例代码

如果您看过文档后，对某些功能的使用仍有疑惑，或者是希望寻找一些用Kratos写项目的灵感，在[examples仓库](https://github.com/go-kratos/examples)的目录下我们提供了很多代码供参考。

您也可以通过文档中的[示例代码清单](https://go-kratos.dev/docs/getting-started/examples)页面来查阅有哪些示例。
