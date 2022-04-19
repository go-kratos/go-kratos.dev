---
id: validate
title: Validate
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

Validate middleware uses proto-gen-validate generated code for parameter validation. You could write parameter validation rules in proto files and generate codes, in order to automatically parameter validation.

### Installation

First you should install [proto-gen-validate](https://github.com/envoyproxy/protoc-gen-validate)
```bash
go install github.com/envoyproxy/protoc-gen-validate@latest
```

If any error appears in generation process or there are `// no validation rules for xxxx` in the generated codes, you could try `git clone github.com/envoyproxy/protoc-gen-validate` then run `make build`


### Example
Here are some examples of parameter validation for several common situations, you may also refer to more examples in [proto-gen-validate](https://github.com/envoyproxy/protoc-gen-validate)

### Numerics

```protobuf
// id must be greater than 0
int64 id = 1 [(validate.rules).int64 = {gt: 0}];
// age must be in the range (0, 120]
int32 age = 2 [(validate.rules).int64 = {gt:0, lte: 120}];
// code must be either 1, 2, or 3
uint32 code = 3 [(validate.rules).uint32 = {in: [1,2,3]}];
// score cannot be 0 nor 0.99
float score = 1 [(validate.rules).float = {not_in: [0, 99.99]}];
```

#### Bools
```protobuf
// state must be set to true
bool state = 5 [(validate.rules).bool.const = true];
// x cannot be set to true
bool state = 5 [(validate.rules).bool.const = false];
```

#### Strings
```protobuf
// x must be set to "/hello"
string path = 6 [(validate.rules).string.const = "/hello"];
// phone must be exactly 11 characters long
string phone = 7 [(validate.rules).string.len = 11];
// explain must be at least 10 characters long
string explain = 8 [(validate.rules).string.min_len =  10];
// name must be between 1 and 10 characters, inclusive
string name = 9 [(validate.rules).string = {min_len: 1, max_len: 10}];
// card must be a non-empty, case-insensitive hexadecimal string
string card = 10 [(validate.rules).string.pattern = "(?i)^[0-9a-f]+$"];
// x must be a valid email address (via RFC 1034)
string email = 11 [(validate.rules).string.email = true];
```

#### Messages
```protobuf
// info cannot be unset
Info info = 11 [(validate.rules).message.required = true];
message Info {
    string address = 1;
}
```

### Code Generation

1.Directly use the `protoc` command to generate

```bash
protoc --proto_path=. \
           --proto_path=./third_party \
           --go_out=paths=source_relative:. \
           --validate_out=paths=source_relative,lang=go:. \
           xxxx.proto
```
2.Add the  `validate` command in Makefile

```makefile
.PHONY: validate
# generate validate proto
validate:
	protoc --proto_path=. \
           --proto_path=./third_party \
           --go_out=paths=source_relative:. \
           --validate_out=paths=source_relative,lang=go:. \
           $(API_PROTO_FILES)
```

Execute command

```bash
make validate
```

### Middleware

We can inject the validate middleware into HTTP or gRPC, and the validate middleware automatically validates the parameters according to the rules written in the proto when request entering.

#### HTTP
```go
httpSrv := http.NewServer(
	http.Address(":8000"),
	http.Middleware(
		validate.Validator(),
	))
```
#### gRPC
```go
grpcSrv := grpc.NewServer(
	grpc.Address(":9000"),
	grpc.Middleware(
		validate.Validator(),
	))
```

### References

* https://github.com/go-kratos/examples/tree/main/validate
