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
We've abstracted the `Codec` interface to unify the serialization/deserialization logic for processing requests, and you can implement your own Codec to support more formats. The specific source code is in [encoding](https://github.com/go-kratos/kratos/tree/main/encoding)。

These formats are battery-included.
* form
* json
* protobuf
* xml
* yaml

### Interface

You should implement the following Codec interface for your custom codec.

```go
// Codec interface is for serialization and deserialization, notice that these methods must be thread-safe.
type Codec interface {
	Marshal(v interface{}) ([]byte, error)
	Unmarshal(data []byte, v interface{}) error
	Name() string
}
```

### Example of Codec Implementation

You may refer to the included implementations in kratos, such as `json` when you implementing custom `Codec`.

```go
// https://github.com/go-kratos/kratos/blob/main/encoding/json/json.go
package json

import (
	"encoding/json"
	"reflect"

	"github.com/go-kratos/kratos/v2/encoding"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

// Name is the name registered for the json codec.
const Name = "json"

var (
	// MarshalOptions is a configurable JSON format marshaller.
	MarshalOptions = protojson.MarshalOptions{
		EmitUnpopulated: true,
	}
	// UnmarshalOptions is a configurable JSON format parser.
	UnmarshalOptions = protojson.UnmarshalOptions{
		DiscardUnknown: true,
	}
)

func init() {
	encoding.RegisterCodec(codec{})
}

// codec is a Codec implementation with json.
type codec struct{}

func (codec) Marshal(v interface{}) ([]byte, error) {
	switch m := v.(type) {
	case json.Marshaler:
		return m.MarshalJSON()
	case proto.Message:
		return MarshalOptions.Marshal(m)
	default:
		return json.Marshal(m)
	}
}

func (codec) Unmarshal(data []byte, v interface{}) error {
	switch m := v.(type) {
	case json.Unmarshaler:
		return m.UnmarshalJSON(data)
	case proto.Message:
		return UnmarshalOptions.Unmarshal(data, m)
	default:
		rv := reflect.ValueOf(v)
		for rv := rv; rv.Kind() == reflect.Ptr; {
			if rv.IsNil() {
				rv.Set(reflect.New(rv.Type().Elem()))
			}
			rv = rv.Elem()
		}
		if m, ok := reflect.Indirect(rv).Interface().(proto.Message); ok {
			return UnmarshalOptions.Unmarshal(data, m)
		}
		return json.Unmarshal(data, m)
	}
}

func (codec) Name() string {
	return Name
}
```

### Usage

#### Register Custom Codec

```go
encoding.RegisterCodec(codec{})
```

#### Get the Codec

```go
jsonCodec := encoding.GetCodec("json")
```

#### Serialization

```go
// You should manually import this package if you use it directly: import _ "github.com/go-kratos/kratos/v2/encoding/json"
jsonCodec := encoding.GetCodec("json")
type user struct {
	Name string
	Age string
	state bool
}
u := &user{
	Name:  "kratos",
	Age:   "2",
	state: false,
}
bytes, _ := jsonCodec.Marshal(u)
fmt.Println(string(bytes))
// output {"Name":"kratos","Age":"2"}
```

#### Deserialization

```go
// You should manually import this package if you use it directly:import _ "github.com/go-kratos/kratos/v2/encoding/json"
jsonCodec := encoding.GetCodec("json")
type user struct {
	Name string
	Age string
	state bool
}
u := &user{}
jsonCodec.Unmarshal([]byte(`{"Name":"kratos","Age":"2"}`), &u)
fmt.Println(*u)
//output &{kratos 2 false}
```
