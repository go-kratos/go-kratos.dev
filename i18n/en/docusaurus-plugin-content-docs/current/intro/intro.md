---
id: intro
title: Introduction
slug: /
---

Kratos is a microservice-oriented governance framework implements by golang, which offers convenient capabilities to help you quickly build a bulletproof application from scratch.


>The name is inspired by the game God of War which is based on Greek myths, tells the Kratos from mortals to become a God of War and launches the adventure of killing god.


## Goals

Kratos boosts your productivity. With the integration of excellent resources and further support, programmers can get rid of most issues might encounter in the field of distributed systems and software engineering such that they are allowed to focus on the release of businesses only. Additionally, for each programmer, Kratos is also an ideal one learning warehouse for many aspects of microservices to enrich their experiences and skills.
### Principles

* **Simple**: Appropriate design, plain and easy code.
* **General**: Cover the various utilities for business development.
* **Highly efficient**: Speeding up the efficiency of businesses upgrading.
* **Stable**: The base libs validated in the production environment which have the characters of the high testability, high coverage as well as high security and reliability.
* **Robust**: Eliminating misusing through high quality of the base libs.
* **High-performance**: Optimal performance excluding the optimization of hacking in case of *unsafe*. 
* **Expandability**: Properly designed interfaces, you can expand utilities such as base libs to meet your further requirements.
* **Fault-tolerance**: Designed against failure, enhance the understanding and exercising of SRE within Kratos to achieve more robustness.
* **Toolchain**: Includes an extensive toolchain, such as the code generation of cache, the lint tool, and so forth.

## Features
* APIs: The communication protocol is based on the HTTP/gRPC through the definition of Protobuf.
* Errors: Both the definitions of error code and the handle interfaces of code generation for tools are defined by the Enum of the Protobuf.
* Metadata: In the protocol of HTTP/gRPC, the transmission of service atomic information are formalized by the Middleware.
* Config: Multiple data sources are supported for configurations and integrations such that dynamic configurations are offered through the manner of *Atomic* operations.
* Logger: The standard log interfaces ease the integration of the third-party log libs and logs are collected through the *Fluentd*.
* Metrics: *Prometheus* integrated by default. Furthermore, with the uniform metric interfaces, you can implement your own metric system more flexible.
* Tracing: The OpenTelemetry is conformed to achieve the tracing of microservices chains.
* Encoding: The selection of the content encoding is automatically supported by Accept and Content-Type.
* Transport: The uniform plugins for Middleware are supported by HTTP/gRPC.
* Registry: The interfaces of the centralized registry is able to be connected with various other centralized registries through plug-ins.

## Architecture

<img src="/images/arch.png" alt="kratos architecture" width="650px" />

## Related

* [Docs](https://go-kratos.dev/)
* [Examples](./examples)
* [Service Layout](https://github.com/go-kratos/kratos-layout)

## Community
* [Wechat Group](https://github.com/go-kratos/kratos/issues/682)
* [Discord Group](https://discord.gg/BWzJsUJ)
* QQ Group: 716486124

## License
Kratos is MIT licensed. See the [LICENSE](./LICENSE) file for details.

## Contributors
Thanks for their outstanding contributions.
<a href="https://github.com/go-kratos/kratos/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=go-kratos/kratos" />
</a>


