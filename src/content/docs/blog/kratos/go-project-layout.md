---
title: Go Engineering - Project Layout Best Practices
description: Go project engineering/foundation libraries, design concepts from different perspectives of the project. Go is a language oriented around package names, allowing Go project layouts to be organized through various package names.
keywords:
  - Go 
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
author: Tony
author_title: Maintainer of go-kratos
author_url: https://github.com/tonybase
author_image_url: https://avatars.githubusercontent.com/u/3871120?s=460&v=4
tags: [go, golang, engineering, project layout, best practices]
date: 2021-03-08
---

## Introduction

This article mainly discusses some thoughts on **Go project engineering** and the design concepts of **Kratos** from different perspectives of the project.

Go is a language oriented around package names, allowing Go project layouts to be organized through various package names. By following standardized design principles, communication among team members can be greatly improved.

## Project Layout

Every company should establish a unified Kit toolkit project (foundation libraries/framework) and Application project for different microservices.
The foundation library Kit is an independent project, and it is recommended to have only one at the company level. Splitting by functional directories can bring a lot of management overhead, so consolidation is recommended.

> by Package Oriented Design
> “To this end, the Kit project is not allowed to have a vendor folder. If any of packages are dependent on 3rd party packages, they must always build against the latest version of those dependences.”

### Kit Foundation Library

Treat the Kit project as the company's standard library, so there should be only one. The Kit foundation library should also have the following characteristics:

* Simple: Not over-engineered, with straightforward and simple code;
* General: Provides the functionality required for general business development;
* Efficient: Improves the efficiency of business iterations;
* Stable: High testability and coverage of the foundation library, safe and reliable with online practice;
* Robust: Reduces misuse through good foundation library design;
* High Performance: High performance, but avoids hack optimizations specifically for performance, such as introducing unsafe;
* Extensibility: Good interface design for extending implementations, or extending functionality by adding new foundation library directories;
* Fault Tolerance: Designed for failure, incorporating a deep understanding of SRE, with high robustness;
* Toolchain: Includes a large number of toolchains, such as auxiliary code generation, lint tools, etc.;

Taking Kratos as an example, a typical Kit foundation library might look like this:

```
github.com/go-kratos/kratos
├── cmd
├── docs
├── internal
├── examples
├── api
├── errors
├── config
├── encoding
├── log
├── metrics
├── metadata
├── middleware
├── transport
├── registry
├── third_party
├── app.go
├── options.go
├── go.mod
├── go.sum
```

> Note: To ensure the portability of the Kit foundation library, interface abstraction should be performed as much as possible, and the go.mod dependencies on third-party libraries should be kept as simple as possible. Then, extend the foundation library through plugins to meet the customization needs of different businesses.

### Application Project

If you are trying to learn Go, or building a PoC or a toy project for yourself, this project layout is not necessary. Start with something very simple (a main.go file is sufficient). When more people are involved in the project, more structure will be needed, including a Toolkit to facilitate generating project templates and ensuring a unified engineering directory layout as much as possible.

<img src="/images/ddd.png" alt="kratos ddd" width="500px" />

For example, generating a Go engineering project template using the Kratos tool:

```
# Create project template
kratos new helloworld

cd helloworld
# Pull project dependencies
go mod download
# Generate proto template
kratos proto add api/helloworld/helloworld.proto
# Generate client source code
kratos proto client api/helloworld/helloworld.proto
# Generate server template
kratos proto server api/helloworld/helloworld.proto -t internal/service
```

In Kratos, a typical Go project layout might look like this:

```
application
|____api
| |____helloworld
| | |____v1
| | |____errors
|____cmd
| |____helloworld
|____configs
|____internal
| |____conf
| |____data
| |____biz
| |____service
| |____server
|____test
|____pkg
|____go.mod
|____go.sum
|____LICENSE
|____README.md
```

### Application Types

The app service types in microservices are mainly divided into five categories: interface, service, job, admin, and task. The application cmd directory is responsible for the program's: startup, shutdown, configuration initialization, etc.

* interface: External BFF service that accepts requests from users, such as exposing HTTP/gRPC interfaces.
* service: Internal microservice that only accepts requests from other internal services or gateways, such as exposing gRPC interfaces only for internal services.
* admin: Different from service, more oriented towards operational services, usually with higher data permissions, isolation brings better code-level security.
* job: Streaming task processing service, with upstream generally depending on message broker.
* task: Scheduled tasks, similar to cronjobs, deployed to task hosting platforms.

## Application Directories

### /cmd

The main application for this project.
The directory name for each application should match the name of the executable you want (e.g., `/cmd/myapp`).
Do not place too much code in this directory. If you think the code can be imported and used in other projects, then it should be located in the `/pkg` directory. If the code is not reusable, or you do not want others to reuse it, place that code in the `/internal` directory.

### /internal

Private application and library code. This is code that you do not want others to import into their applications or libraries. Note that this layout pattern is enforced by the Go compiler itself. For more details, see the Go 1.4 release notes. Note that you are not limited to the top-level `internal` directory. You can have multiple internal directories at any level of the project tree.
You can choose to add some additional structure to the `internal` package to separate shared and non-shared internal code. This is not required (especially for smaller projects), but it is good to have visual clues showing the intended use of the package. Your actual application code can be placed in the `/internal/app` directory (e.g., `/internal/app/myapp`), and the code shared by these applications can be placed in the `/internal/pkg` directory (e.g., /internal/pkg/myprivlib).
Because we are accustomed to integrating related services, such as the account service, which internally includes rpc, job, admin, etc., after integrating related services, it is necessary to distinguish apps. For a single service, `/internal/myapp` can be omitted.

### /pkg

Library code that can be used by external applications (e.g., `/pkg/mypubliclib`). Other projects will import these libraries, so think twice before putting things here :-) Note that the `internal` directory is a better way to ensure private packages are not importable, as it is enforced by Go. The `/pkg` directory is still a good way to explicitly indicate that the code in this directory is safe for others to use.

> Inside the /pkg directory, you can refer to the organization of the Go standard library, categorized by functionality. /internal/pkg is generally used for public shared code across multiple applications within a project, but its scope is limited to a single project.

The blog post I'll take pkg over internal by Travis Jeffery provides a good overview of the `pkg` and `internal` directories and when it makes sense to use them.
This is also a way to group Go code in one place when the root directory contains a large number of non-Go components and directories, making it easier to run various Go tools in an organized manner.

## Service Application Directories

### /api

API protocol definition directory, services.proto protobuf files, and generated go files. We usually describe the API documentation directly in the proto file.

### /configs

Configuration file templates or default configurations.

### /test

Additional external test applications and test data. You can structure the /test directory as needed. For larger projects, it makes sense to have a data subdirectory. For example, you can use /test/data or /test/testdata (if you need to ignore the contents of the directory). Note that Go also ignores directories or files starting with "." or "_", so there is more flexibility in how you name test data directories.

## Service Internal Directories

Under the Application directory, there are api, cmd, configs, internal, pkg directories. README, CHANGELOG, OWNERS are usually placed inside.
internal is to avoid cross-directory references to internal structs like data, biz, service, server within the same business.

### data

Business data access, including cache, db, etc. encapsulation, implementing the repo interface of biz. We might confuse data with dao; data emphasizes business meaning. What it needs to do is to retrieve the domain object again. We have removed the DDD infra layer.

### biz

Business logic assembly layer, similar to the domain layer in DDD. data is similar to the repo in DDD, where the repo interface is defined, using the dependency inversion principle.

### service

Implements the service layer defined by the api, similar to the application layer in DDD, handling the conversion from DTO to biz domain entities (DTO -> DO), and coordinating interactions among various biz, but should not handle complex logic.

### server

Creation and configuration of http and grpc instances, and registration of the corresponding service.

## Not Recommended Directories

### ~~src/~~

The src directory is a common pattern in Java development projects, but in Go development projects, try to avoid using the src directory.

### ~~model/~~

In other languages, a very common module is called model, where all types are placed in model. However, this is not recommended in Go because Go's package design is based on functional responsibilities. For example, a User model should be declared in the functional module where it is used.

### ~~xxs/~~

Directories or packages with plural names. Although there is a strings package in the Go source code, singular forms are more commonly used.

## Summary

In actual Go project development, it is essential to apply flexibility. Of course, you can also completely disregard such architectural layering and package design rules. Everything depends on the project size, business complexity, the breadth and depth of personal professional skills, and time constraints.

Moreover, it is crucial to choose a Kit foundation library suitable for your team based on the actual situation, conduct thorough research, and determine whether it can meet plugin customization needs. Maintain the team's Kit foundation library and code standards, and encourage developers to actively participate and contribute.

If anyone has better architectural design concepts, welcome to discuss them in the go-kratos community. I hope this article is helpful to you~

## References

* [Package Oriented Design](https://www.ardanlabs.com/blog/2017/02/package-oriented-design.html)
* [Layered Application Guidelines](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/ee658109(v=pandp.10))
* [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
* [Go Package-Oriented Design and Architectural Layering](https://github.com/danceyoung/paper-code/blob/master/package-oriented-design/packageorienteddesign.md)
* [Go Advanced Training Camp - Geek Time](https://u.geekbang.org/subject/go)