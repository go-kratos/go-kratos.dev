---
id: circuitbreaker
title: 熔断器
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


### 配置


### 使用方法

```go
var opts = []http.ServerOption{
	http.Middleware(
		
	),
}

srv := http.NewServer(opts...)
```