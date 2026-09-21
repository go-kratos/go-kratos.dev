---
id: encoding
title: 序列化
description: 理解 Kratos v3 codec、HTTP content negotiation 和 protobuf JSON 行为。
---

全局 codec registry 把小写 content subtype 映射到 `encoding.Codec`。Codec 提供 `Marshal`、`Unmarshal` 和稳定的 `Name`，并且必须支持并发调用。

```go
type Codec interface {
	Marshal(v any) ([]byte, error)
	Unmarshal(data []byte, v any) error
	Name() string
}
```

`RegisterCodec` 遇到 nil codec 或空名称会 panic。再次注册同名 codec 会直接替换旧值，不返回错误。应用 codec 应在进程初始化时注册；可复用 library 不应静默替换应用选择的格式。

## 内置注册

导入顶层 `transport` package 会通过 blank import 注册 form、标准 JSON、protobuf binary、protobuf JSON、XML 和 YAML codec。HTTP 和 gRPC transport package 会导入它，因此普通 transport 应用会自动得到这些注册。只使用 encoding registry 而不导入 transport 的代码必须显式导入所需 codec package。

```go
import (
	"github.com/go-kratos/kratos/v3/encoding"
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
)

jsonCodec := encoding.GetCodec("json")
protoJSONCodec := encoding.GetCodec("protojson")
```

`GetCodec` 要求小写 subtype；未注册时返回 `nil`。低层代码调用返回值前必须检查。

## 标准 JSON 与 protobuf JSON

v3 有意拆分两套 JSON 语义：

- `encoding/json` 注册名称 `json`，委托标准库实现，也会使用 `json.Marshaler` 和 `json.Unmarshaler`。
- `encoding/protojson` 注册名称 `protojson`，只接受 `proto.Message`，默认输出未设置字段，解码时默认丢弃未知字段。
- `contrib/encoding/json/v3` 为迁移提供旧版混合行为，名称同样为 `json`；二者同时注册时会替换 core `json`。

`protojson.MarshalOptions` 和 `UnmarshalOptions` 是导出的 package variable。应在并发请求开始前配置一次；codec 使用过程中修改进程全局 option 会产生不一致输出。

## HTTP 选择规则

默认 HTTP request decoder 根据请求 `Content-Type` 选择 codec。类型未注册时返回 reason 为 `CODEC` 的 Bad Request；空 body 不执行 unmarshal。Response 和 error encoder 根据 `Accept` 选择，找不到已注册类型时回退到 `json`。

对于 `google.api.HttpBody`，Kratos 会绕过普通 codec marshal，按声明的 content type 复制原始数据；未声明时使用 `application/octet-stream`。

生成的 binding 和 HTTP context binding 还会使用 form codec 处理 path、query 和 form value。其默认 field tag 是 `json`；protobuf value 使用 package 内的 protobuf-aware 转换。

## 自定义 codec

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

生产 codec 应校验目标类型、明确 buffer ownership、返回可用错误，并测试畸形与空输入。Codec name 会成为 HTTP content subtype，修改名称属于 wire contract 变化。

更底层的行为可查阅 core [`encoding`](https://github.com/go-kratos/kratos/tree/main/encoding) package 和 [HTTP codec 实现](https://github.com/go-kratos/kratos/blob/main/transport/http/codec.go)。
