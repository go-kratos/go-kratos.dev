---
id: errors
title: Errors
---
You can define errors in protos and generate enums with protoc-gen-go.


Error in errors pacakge implements GRPCStatus() interface.
```json
{
    // Error code, this is consistent with grpc-status and will be convert to http-status in HTTP
    "code": 3,
    // Error message, is a human-readable message.
    "message": "invalid argument error",
    // Error details
    "details": [
        {
            "@type": "type.googleapis.com/google.rpc.ErrorInfo",
            // Error Reason, is the Error code in business logic.
            "reason": "custom_error",
            // Error domain, is the business domain.
            "domain": "helloworld"
        }
    ]
}
```

### Installation
```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go
```

### Error Defination

api/helloworld/v1/helloworld.proto

```protobuf
syntax = "proto3";

package api.helloworld.v1;

// language-specified package name
option go_package = "api/helloworld/v1;v1";
option java_multiple_files = true;
option java_package = "helloworld.v1";
option objc_class_prefix = "APIHelloworldV1";

enum ErrorReason {
  // Do not use this default value.
  ERROR_REASON_UNSPECIFIED = 0;
  // The request is calling a disabled service for a consumer.
  SERVICE_DISABLED = 1;
}
```

### Error Generation

To generate code with protoc.

```bash
protoc --go_out=. --go_opt=paths=source_relative api/helloworld/v1/error_reason.proto
```

### Usage
```go
import "github.com/go-kratos/kratos/errors"
import "<app>/api/helloworld/v1"

func doSomething() error {
	return errors.BadRequest("hellworld", v1.SERVICE_DISABLED.String(), "service has been disabled")
}

if err := doSomething(); errors.IsBadRequest(err) {
	// TODO
}

if err := doSomething(); errors.Reason(err) == v1.SERVICE_DISABLED.String() {
	// TODO
}
```
