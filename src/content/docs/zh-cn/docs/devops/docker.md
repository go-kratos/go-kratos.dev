---
id: docker
title: Docker
---

项目模板在 Go 镜像中构建服务，再把编译后的二进制复制到较小的运行镜像。Builder
必须满足 `go.mod` 中的 Go 版本；v3 模板要求在支持范围内使用 Go 1.25 或更高
工具链。

## 模板镜像

模板 Dockerfile 采用以下结构：

```dockerfile
FROM golang:1.25 AS builder

COPY . /src
WORKDIR /src
RUN make build

FROM debian:stable-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates netbase \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /src/bin /app
WORKDIR /app
EXPOSE 8000 9000
VOLUME /data/conf
CMD ["./server", "-conf", "/data/conf"]
```

`make build` 运行 `go build`，从 Git 取得版本并把命令二进制写入 `bin`。Go 模块
代理应使用组织批准的地址；模板里的代理设置只是构建环境选择。

## 本地构建与运行

在仓库根目录构建，再以只读方式挂载配置：

```bash
docker build -t todo-service .
docker run --rm \
	-p 8000:8000 \
	-p 9000:9000 \
	-v "$PWD/configs:/data/conf:ro" \
	-e KRATOS_DATABASE_SOURCE='app:secret@tcp(host.docker.internal:3306)/todo?parseTime=True' \
	todo-service
```

模板的 `KRATOS` 环境 source 会把 `KRATOS_DATABASE_SOURCE` 加载为根 key
`DATABASE_SOURCE`，再展开同名占位符。容器内的 `127.0.0.1` 指向容器自身，因此应
使用 Compose service 名、Kubernetes Service 名或其他可访问的数据库主机。数据库
凭据应保存在部署平台的 secret 系统中，不能写入镜像或提交的配置。

## 生产镜像选择

- 按供应链策略固定 builder 和 runtime 镜像，并扫描最终镜像。
- 运行文件系统和挂载配置权限允许时，使用非 root 用户运行。
- 客户端使用 TLS 时保留 CA 证书；只有应用确实需要本地时区文件时才添加时区数据。
- 多架构流水线应明确目标平台，不要把 Go 模块缓存复制进 runtime stage。
- 设置明确工作目录并使用 exec 形式 `CMD`，使 Unix 信号直接到达服务进程。

## 配置与迁移

可以挂载整个配置目录，也可以挂载 `-conf` 接受的单个文件。`configs/config.yaml`
中的环境占位符可让部署覆盖 secret 和地址。生产环境应关闭 Ent `debug` 和
`auto_migrate`，在发布服务前执行经过审查的 schema migration。

容器中的 HTTP 和 gRPC listener 必须绑定 `0.0.0.0`。发布或声明端口不会改变
服务内部配置的监听地址。

## 停止与健康检查

Docker 和编排平台会先发送终止信号，再执行强制结束。Kratos 默认处理 SIGTERM、
SIGQUIT 和 SIGINT，注销服务并停止传输。`kratos.StopTimeout` 应短于平台的终止
宽限期，使强制结束只作为最后手段。

gRPC 传输默认注册标准 health 服务。只有部署确实需要时才添加 HTTP readiness
路由，并让 readiness 反映服务是否能接收流量。关闭时应先从服务发现移除实例并
让 readiness 失败，再由平台结束进程。
