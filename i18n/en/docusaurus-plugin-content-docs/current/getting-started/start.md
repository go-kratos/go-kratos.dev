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

## Installation

```bash
# install kratos CLI tool
go get -u github.com/go-kratos/kratos/cmd/kratos/v2@latest
```
## Project Creation
```bash
# create project's layout
kratos new helloworld

cd helloworld
# pull dependencies
go mod download
# generate proto template
kratos proto add api/helloworld/helloworld.proto
# generate proto code
kratos proto client api/helloworld/helloworld.proto
# generate server template
kratos proto server api/helloworld/helloworld.proto -t internal/service
```
## Compilation and Running
```bash
# generate all codes of proto and wire etc.
go generate ./...

# compile the executable binary file
go build -o ./bin/ ./...

# run the application
./bin/helloworld -conf ./configs
```

## Try it out
```bash
curl 'http://127.0.0.1:8000/helloworld/krtaos'

The response should be
{
  "message": "Hello kratos"
}
```

## Project Layout
Kratos CLI always pull the layout project from GitHub for project creation. The layout project is:

* [Kratos Layout](https://github.com/go-kratos/kratos-layout)
