---
id: encoding
title: Encoding
description: Understand Kratos v3 codecs, HTTP content negotiation, and protobuf JSON behavior.
---

The global codec registry maps a lowercase content subtype to an
`encoding.Codec`. A codec supplies `Marshal`, `Unmarshal`, and a stable `Name`,
and must be safe for concurrent calls.

```go
type Codec interface {
	Marshal(v any) ([]byte, error)
	Unmarshal(data []byte, v any) error
	Name() string
}
```

`RegisterCodec` panics for a nil codec or empty name. Registering the same name
again replaces the previous value without an error. Register application codecs
during process initialization and do not let reusable libraries silently
replace a format selected by the application.

## Built-in registrations

Importing the top-level `transport` package registers form, standard JSON,
protobuf binary, protobuf JSON, XML, and YAML codecs through blank imports.
HTTP and gRPC transport packages import that package, so ordinary transport
applications receive those registrations automatically. Code using the
encoding registry without a transport must import the required codec packages.

```go
import (
	"github.com/go-kratos/kratos/v3/encoding"
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
)

jsonCodec := encoding.GetCodec("json")
protoJSONCodec := encoding.GetCodec("protojson")
```

`GetCodec` expects a lowercase subtype and returns `nil` when none is
registered. Do not call a result without checking it in low-level code.

## Standard JSON and protobuf JSON

v3 deliberately separates the two JSON semantics:

- `encoding/json` registers name `json` and delegates to the standard library,
  including `json.Marshaler` and `json.Unmarshaler`.
- `encoding/protojson` registers name `protojson`, accepts only
  `proto.Message`, emits unpopulated fields by default, and discards unknown
  fields while decoding by default.
- `contrib/encoding/json/v3` provides the old mixed behavior under name `json`
  for migration. It replaces core `json` if both register that name.

`protojson.MarshalOptions` and `UnmarshalOptions` are exported package
variables. Configure them once before concurrent requests begin; changing
process-global options while codecs are in use causes inconsistent output.

## HTTP selection

The default HTTP request decoder selects a codec from the request
`Content-Type`. An unregistered type produces a Bad Request with reason
`CODEC`; an empty body is accepted without unmarshalling. The response and
error encoders select from `Accept` and fall back to `json` when no registered
type matches.

For `google.api.HttpBody`, Kratos bypasses normal codec marshalling and copies
the raw data with its declared content type, defaulting to
`application/octet-stream`.

Generated bindings and HTTP context binding also use the form codec for path,
query, and form values. Its default field tag is `json`; protobuf values use
the package's protobuf-aware value conversion.

## Custom codec

```go
type textCodec struct{}

func (textCodec) Name() string { return "plain" }
func (textCodec) Marshal(v any) ([]byte, error) {
	return []byte(fmt.Sprint(v)), nil
}
func (textCodec) Unmarshal(data []byte, v any) error {
	return fmt.Errorf("plain decoding is not implemented for %T", v)
}

encoding.RegisterCodec(textCodec{})
```

A production codec should validate destination types, preserve buffer
ownership, return useful errors, and have tests for malformed and empty input.
Its name becomes the HTTP content subtype, so changing it is a wire-contract
change.

For lower-level behavior, see the core
[`encoding`](https://github.com/go-kratos/kratos/tree/main/encoding) package and
the [HTTP codec implementation](https://github.com/go-kratos/kratos/blob/main/transport/http/codec.go).
