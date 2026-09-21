---
id: validate
title: Validate
---

`validate.Validator()` validates a request before calling the handler. If the request implements `Validate() error`, Kratos calls it and turns a failure into a Bad Request error with reason `VALIDATOR`.

```go
srv := http.NewServer(http.Middleware(validate.Validator()))
```

Additional functions can be supplied as `validate.Validator(func(value any) error { ... })`. This lets an application validate protobuf messages with its chosen validator, including Buf protovalidate or Google AIP field behavior validation. v3 does not require a specific code generator.

## Combine validation rules

The middleware first calls a request's `Validate() error`, then invokes the supplied `ValidatorFunc` values in order. It returns on the first failure, wrapping that cause in a Bad Request error. Keep validation deterministic and side-effect free: it runs before the service handler and may execute concurrently for many requests.

```go
validator := validate.Validator(func(value any) error {
	message, ok := value.(proto.Message)
	if !ok {
		return nil
	}
	return protovalidate.Validate(message)
})
```

Return a useful validation error but do not leak sensitive input. Business rules that require repositories, permissions, or transactions belong in the use case rather than request validation.
