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
我们抽象出了`Codec`接口，用于统一处理请求的序列化/反序列化逻辑，您也可以实现您自己的Codec以便支持更多格式。具体源代码在[encoding](https://github.com/go-kratos/kratos/tree/main/encoding)。

目前内置支持了如下格式：
* json
* protobuf
* xml
* yaml

### 接口实现

`encoding` 的 `Codec` 接口中,包含了 Marshal，Unmarshal，Name 三个方法，用户只需要实现 `Codec` 即可使用自定义的 `encoding`。

```go
// Codec 用于定义传输时用到的编码和解码接口，实现这个接口时必须注意，实现必须是线程安全的，可以并发协程调用。
type Codec interface {
	Marshal(v interface{}) ([]byte, error)
	Unmarshal(data []byte, v interface{}) error
	Name() string
}
```

### 实现示例

在实现 `Codec` 时，可以参考 kratos 的内置实现, 如 json encoding，源代码如下。

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
	if m, ok := v.(proto.Message); ok {
		return MarshalOptions.Marshal(m)
	}
	return json.Marshal(v)
}

func (codec) Unmarshal(data []byte, v interface{}) error {
	rv := reflect.ValueOf(v)
	for rv.Kind() == reflect.Ptr {
		if rv.IsNil() {
			rv.Set(reflect.New(rv.Type().Elem()))
		}
		rv = rv.Elem()
	}
	if m, ok := v.(proto.Message); ok {
		return UnmarshalOptions.Unmarshal(data, m)
	} else if m, ok := reflect.Indirect(reflect.ValueOf(v)).Interface().(proto.Message); ok {
		return UnmarshalOptions.Unmarshal(data, m)
	}
	return json.Unmarshal(data, v)
}

func (codec) Name() string {
	return Name
}
````

### 使用方式

#### 注册 Codec

```go
encoding.RegisterCodec(codec{})
```

#### 获取 Codec

```go
jsonCodec := encoding.GetCodec("json")
```

#### 序列化

```go
// 直接使用内置 Codec 时需要 import _ "github.com/go-kratos/kratos/v2/encoding/json"
jsonCode := encoding.GetCodec("json")
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
bytes, _ := jsonCode.Marshal(u)
// output {"Name":"kratos","Age":"2"}
```

#### 反序列化

```go
// 直接使用内置 Codec 时需要 import _ "github.com/go-kratos/kratos/v2/encoding/json"
jsonCode := encoding.GetCodec("json")
type user struct {
	Name string
	Age string
	state bool
}
u := &user{}
jsonCode.Unmarshal([]byte(`{"Name":"kratos","Age":"2"}`), &u)
//output &{kratos 2 false}
```
