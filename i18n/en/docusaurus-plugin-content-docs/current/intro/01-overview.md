---
id: overview
title: Overview
slug: /
---

Kratos is a framework upon the lightweight microservices implemented by Golang, which offers convenient capabilities to help you quickly build a bulletproof application from scratch.

>Its name is originated from one popular game, the God of War. It illustrates the fantastic story of Kratos turning from an ordinary person into a God of War and his significant accomplishments full of successful risky journeys to beat various gods.


## Goals

We aim to provide a comprehensive microservices development technique. Based on the integration of related frameworks and tools, it achieves the goals that the management of microservies is transparent to the upper level businesses development such that developers can focus on the business of developing and releasing applications. Additionally, for each developer, Kratos is also an ideal resource for learning many aspects of microservices thus enriching their experiences and skills.

### Principles

* **Simple**: Appropriate design, plain and easy to code.
* **General**: Covers the various utilities for business development.
* **Highly efficient**: Speeding up the efficiency of businesses upgrading.
* **Stable**: The base libs validated in the production environment which have the characteristics of high testability, high coverage as well as high security and reliability.
* **Robust**: Eliminating misuse by using high quality base libs.
* **High-performance**: Optimal performance to prevent hacking without use of unsafe. 
* **Expandability**: Properly designed interfaces, you can expand utilities such as base libs to meet your further requirements.
* **Fault-tolerance**: Designed against failure, enhance the understanding and exercising of SRE within Kratos to achieve more robustness.
* **Toolchain**:  Includes an extensive toolchain, such as the generation of the cache layer, the lint tool, and so forth.

## Features
* APIs: Messages defined by Protobuf are using HTTP/gRPC for transport.
* Errors: Both the definitions of error code and the handle interfaces of code generation for tools are defined by the Enum of the Protobuf.
* Metadata:	In the HTTP/gRPC protocol, use the uniform metadata transfer method.
* Config: Multiple data sources are supported for configurations and dynamic configurations (use *atomic* operations).
* Logger: The standard log interfaces ease the integration of the third-party log libs and logs are collected through the *Fluentd*.
* Metrics: *Prometheus* integrated by default. Furthermore, with the uniform metric interfaces, you can implement your own metric system more flexibly.
* Tracing: The OpenTelemetry is conformed to achieve the tracing of microservices chains.
* Encoding: The selection of the content encoding is automatically supported by Accept and Content-Type.
* Transport: The uniform plugins for Middleware are supported by HTTP/gRPC.
* Registry: The interfaces of the centralized registry are able to be connected with various other centralized registries through plug-ins.

## Architecture

<img src="/images/arch.png" alt="kratos architecture" width="650px" />

## Related

* [Docs](https://go-kratos.dev/)
* [Examples](https://github.com/go-kratos/examples)
* [Service Layout](https://github.com/go-kratos/kratos-layout)

## Community
* [Wechat Group](https://github.com/go-kratos/kratos/issues/682)
* [Discord Group](https://discord.gg/BWzJsUJ)
* QQ Group: 716486124

## License
Kratos is MIT licensed. See the [LICENSE](https://github.com/go-kratos/kratos/blob/main/LICENSE) file for details.

## Contributors
Thanks for their outstanding contributions.
<a href="https://github.com/go-kratos/kratos/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=go-kratos/kratos" />
</a>


