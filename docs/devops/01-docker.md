---
id: docker
title: Docker
description: Docker
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

**kratos-layout** 中默认提供了用于构建程序的 Dockerfile 文件，文件中采用多阶段构建，以获得最小体积的容器镜像。

### 脚本内容 

```Dockerfile
FROM golang:1.19 AS builder

COPY . /src
WORKDIR /src

RUN GOPROXY=https://goproxy.cn make build

FROM debian:stable-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
		ca-certificates  \
        netbase \
        && rm -rf /var/lib/apt/lists/ \
        && apt-get autoremove -y && apt-get autoclean -y

COPY --from=builder /src/bin /app

WORKDIR /app

EXPOSE 8000
EXPOSE 9000
VOLUME /data/conf

CMD ["./server", "-conf", "/data/conf"]
```

### 构建镜像
```shell
docker build -t <your-docker-image-name> .
```
### 创建容器并运行

```shell
docker run --rm -p 8000:8000 -p 9000:9000 -v </path/to/your/configs>:/data/conf <your-docker-image-name>
```