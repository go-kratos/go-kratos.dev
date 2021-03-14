---
id: faq
title: FAQ
description: Kratos FAQ 使用文档
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

### 在使用`kratos proto`命令时报`google/protobuf/descriptor.proto: File not found.`的错误
通常是因为您的protoc工具没有正确安装导致的。具体安装方式可以参考文档[protoc-installation](https://grpc.io/docs/protoc-installation/)，请尽量采用包管理器方式进行安装，以确保安装的完整性。如果您一定要自行下载zip包安装预编译的版本或自行编译安装，请参考zip包中`readme.txt`文件的说明进行操作，确保`include`下的所有东西（通常是`google`目录，里面是一系列`.proto`后缀的文件）都已经正确放置在您的include路径下，如`/usr/local/include/`目录中，以确保protoc在编译过程中能成功找到。
