---
id: errors
title: Errors
---

`github.com/go-kratos/kratos/v3/errors` represents an application error with an HTTP status code, stable reason, user-facing message, and optional metadata. HTTP and gRPC transports convert this type through `GRPCStatus`; gRPC details use `google.rpc.ErrorInfo`.

## Create Errors

```go
import "github.com/go-kratos/kratos/v3/errors"

notFound := errors.NotFound("USER_NOT_FOUND", "user does not exist")
invalid := errors.BadRequest("INVALID_ID", "user ID is invalid")
failed := errors.New(500, "DATABASE", "request failed")
formatted := errors.Newf(500, "DATABASE", "query %s failed", query)
```

Status helpers cover 400, 401, 403, 404, 409, 429, 499, 500, 503, and 504. Use a stable reason for program logic and a message that is safe to send to clients.

## Add Context

`WithCause` and `WithMetadata` return a cloned error. The cause remains in the Go error chain.

```go
err := errors.InternalServer("DATABASE", "request failed").
	WithCause(databaseErr).
	WithMetadata(map[string]string{"request_id": requestID})
```

Do not put credentials or internal details in messages or metadata.

## Inspect Errors

`Code`, `Reason`, and `FromError` support wrapped errors. `errors.Is` compares a Kratos error by code and reason.

```go
if errors.Is(err, errors.NotFound("USER_NOT_FOUND", "")) {
	// Handle the missing user.
}

statusCode := errors.Code(err)
reason := errors.Reason(err)
statusError := errors.FromError(err)
```

`FromError` converts a non-Kratos error to an internal-server error, or maps a gRPC status to its HTTP representation.

## Propagate errors by layer

Repository and external-client errors are implementation details. Wrap them with `WithCause`, then return a stable Kratos error from the business or service boundary. The transport converts that public error without requiring HTTP handlers or gRPC methods to manually encode it.

```go
user, err := repo.Find(ctx, id)
if err != nil {
	if stderrors.Is(err, sql.ErrNoRows) {
		return nil, errors.NotFound("USER_NOT_FOUND", "user does not exist")
	}
	return nil, errors.InternalServer("DATABASE", "request failed").WithCause(err)
}
```

Use `stderrors.Is` and `stderrors.As` for ordinary Go causes; use Kratos `errors.Is`, `Code`, and `Reason` when the public error contract drives a decision. Avoid comparing message strings.

## Join and clone errors

`errors.Join` combines errors when a caller must retain more than one failure. `Clone` is useful before adding metadata to an error shared by a package-level definition. Usually create or enrich errors close to the boundary that can make an informed public decision.

## API reason enums

The project template defines an `ErrorReason` protobuf enum and uses its
generated string values when constructing errors. Its current `make api` target
generates the enum with `protoc-gen-go`; it does not configure
`protoc-gen-go-errors`. Projects that choose the separate error generator must
add it to their own Buf generation configuration and commit its output.

See [Migrate from v2 to v3](/docs/migration/v2-to-v3/) when upgrading existing
bindings.
