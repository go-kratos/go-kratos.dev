---
id: start
title: Quick Start
---

## Version
The version of kratos must be v2.0.0 or above.

## Environment Requirements
These environments and tools must be installed properly.
- [go](https://golang.org/dl/)
- [protoc](https://github.com/protocolbuffers/protobuf)
- [protoc-gen-go](https://github.com/protocolbuffers/protobuf-go)

The `GO111MODULE` should be enabled.
```bash
go env -w GO111MODULE=on
```

If you faced with network problem (especially you are in China Mainland), please [setup GOPROXY](https://goproxy.cn/)

## Install Kratos tool

> You can do it either way.

#### 1. go install installation

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v2@latest
```

#### 2. Source code compilation and installation

```bash
git clone https://github.com/go-kratos/kratos
cd kratos
make install
```

## Project Creation

```bash
# create project's layout
kratos new helloworld

cd helloworld
# pull dependencies
go mod download
```
## Compilation and Running
```bash
# generate all codes of proto and wire etc.
go generate ./...

# run the application
kratos run
```

## Try it out
```bash
curl 'http://127.0.0.1:8000/helloworld/kratos'

The response should be
{
  "message": "Hello kratos"
}
```

## Project Layout
Kratos CLI always pull the layout project from GitHub for project creation. The layout project is:

* [Kratos Layout](https://github.com/go-kratos/kratos-layout)
