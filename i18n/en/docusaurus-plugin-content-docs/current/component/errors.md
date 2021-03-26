---
id: errors
title: Errors
---
The errors can be defined by proto files, and you could generate Go code with `protoc-gen-go-errors`. 
The generated codes will implement the Error interface and the errors can be converted to gRPC status.

```protobuf
message Status {
  // Error Code, is same as grpc-status, and could be mapped to http-status in HTTP
  int32 code = 1;
  // Error Reason, the error code (or identifer) for business logics.
  string reason = 2;
  // Error message, human-readable message, for UI display
  string message = 3;
  // Detail of error, you could put any complex structs into this field.
  repeated google.protobuf.Any details = 4;
}
```

### Installation
```bash
go get github.com/go-kratos/kratos/cmd/protoc-gen-go-errors@latest
```

### Definition

api/helloworld/errors/helloworld.proto

```protobuf
syntax = "proto3";

package api.helloworld.errors;

import "kratos/api/annotations.proto";

// specifying the package names for importing from multiple programming language
option go_package = "api/helloworld/errors;errors";
option java_multiple_files = true;
option java_package = "helloworld.errors";
option objc_class_prefix = "APIHelloworldErrors";

enum Helloworld {
    option (kratos.api.errors) = true;

    MissingName = 0;
}
```

### Generation
To generate Go codes from proto files.

```bash
kratos proto client api/helloworld/errors/helloworld.proto
```
The generated Go codes as shown below.
You could use `errors.IsMissingName(err)` for error examining.
```go
const (
	Errors_MissingName = "Helloworld_MissingName"
)

func IsMissingName(err error) bool {
	return errors.Reason(err) == Errors_MissingName
}
```

### Usage
```go
import "github.com/go-kratos/kratos/errors"
import apierr "app/api/errors"

func doSomething() error {
	return errrors.InvalidArgument("reason", "message")
}

if err := doSomething(); apierr.IsMissingName(err) {
	// TODO
}
```
