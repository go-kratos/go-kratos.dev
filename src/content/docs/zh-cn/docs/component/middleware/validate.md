---
id: validate
title: 校验
---

`validate.Validator()` 会在调用 handler 前校验请求。请求实现 `Validate() error` 时，Kratos 会调用它，并将失败转换为 reason 为 `VALIDATOR` 的 Bad Request 错误。

```go
srv := http.NewServer(http.Middleware(validate.Validator()))
```

还可传入 `validate.Validator(func(value any) error { ... })` 这类附加校验函数。因此应用可以选择自己的 protobuf 校验器，包括 Buf protovalidate 或 Google AIP field behavior 校验。v3 不强制使用特定的代码生成器。

## 组合校验规则

middleware 先调用 request 的 `Validate() error`，再按顺序调用传入的
`ValidatorFunc`。遇到第一个失败就返回，并把原因包装进 Bad Request 错误。校验应
确定且无副作用：它发生在 service handler 前，并会为大量请求并发执行。

```go
validator := validate.Validator(func(value any) error {
	message, ok := value.(proto.Message)
	if !ok {
		return nil
	}
	return protovalidate.Validate(message)
})
```

返回有用的校验错误，但不要泄露敏感输入。需要 repository、权限或事务的业务规则属于 use case，而不是 request 校验。
