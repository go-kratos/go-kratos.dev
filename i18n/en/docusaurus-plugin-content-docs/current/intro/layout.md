---
id: layout
title: Layout 
---
The [kratos-layout](https://github.com/go-kratos/kratos-layout) is used in command `kratos new` for new project creation. The directory structures and tool chains are included in this layout project. Which help you be more efficient in developing. This project could also considered as the best practice of building microservices by Go and Kratos.

<img src="/images/ddd.jpg" alt="kratos ddd" width="500px" />

To create a new project:

```
kratos new <project-name>
```

The following directory structures will be generated.

```
.
├── go.mod           
├── go.sum
├── LICENSE
├── README.md
├── api        // Includes .proto API files and the .go files which generated from them.
│   └── helloworld
│       ├── errors
│       │   ├── helloworld.pb.go
│       │   ├── helloworld.proto
│       │   └── helloworld_errors.pb.go
│       └── v1
│           ├── greeter.pb.go
│           ├── greeter.proto
│           ├── greeter_grpc.pb.go
│           └── greeter_http.pb.go
├── cmd    // The entry point of the kratos app
│   └── server
│       ├── main.go
│       ├── wire.go  // wire library is for dependency injection
│       └── wire_gen.go
├── configs     // The configuration files for local development.
│   └── config.yaml
└── internal    // All the codes which are private. Business logics are often exist in there, under "internal" directory for preventing from unwilling import.
    ├── conf    // The structure for configuration parsing, generated from .proto file
    │   ├── conf.pb.go
    │   └── conf.proto
    ├── data    // For accessing data sources. This layer is mainly used as the encapsulation of databases, caches etc. The implementation of repo interface which defined in biz layer should be placed here. In order to distinguish from DAO (data access object), the data layer stress on business. Its responsibility is to transform PO to DTO. We dropped the infra layer of DDD.
    │   ├── README.md
    │   ├── data.go
    │   └── greeter.go
    ├── biz     // The layer for composing business logics. It is similar to the domain layer in DDD. The interface of repo are defined in there, following the Dependence Inversion Principle.
    │   ├── README.md
    │   ├── biz.go
    │   └── greeter.go
    ├──service  // The service layer which implements API defination. It is similar to the application layer in DDD. The transformations of DTO to DO and the composing of biz are processed in this layer. We should avoid to write complex business logics here. 
    │   ├── README.md
    │   ├── greeter.go
    │   └── service.go
    └── server  // The creation of http and grpc instance
        ├── grpc.go
        ├── http.go
        └── server.go
```
