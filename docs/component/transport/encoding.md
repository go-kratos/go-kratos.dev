---
id: encoding
title: Encoding
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
我们抽象出了`Codec`接口，用于统一处理请求的序列化/反序列化逻辑，您也可以实现您自己的Codec以便支持更多格式。具体源代码在[encoding](https://github.com/go-kratos/kratos/tree/main/encoding)

目前内置支持了如下格式：
* json
* protobuf
* xml
* yaml
