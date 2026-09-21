---
id: v3-new-features
title: New Features in Kratos v3
description: New framework capabilities available after upgrading from Kratos v2.
---

Kratos v3 adds several capabilities beyond its breaking API changes. You can
adopt these features independently after the service runs on v3; an upgrade
does not require using all of them at once.

| Capability | What v3 adds | Where to use it |
| --- | --- | --- |
| HTTP streaming | Generated SSE and WebSocket server/client bindings | Event feeds, progress updates, client upload streams, two-way synchronization |
| Typed configuration reads | Generic `config.Get[T]` | Reading one primitive or configuration subtree |
| Extensible request validation | Ordered `ValidatorFunc` callbacks | Protovalidate, AIP field behavior, or application validators |
| Standard structured logging | `slog` handlers, filters, and context attributes | Consistent structured logs without a Kratos-specific logger interface |
| Explicit JSON formats | Separate `json` and `protojson` codecs | Choosing Go JSON or protobuf JSON wire behavior |
| Additional error helpers | `Join`, `ErrUnsupported`, and HTTP 429 helpers | Preserving multiple failures and representing throttling |

## HTTP streaming bindings

The v3 HTTP generator supports all four RPC shapes. It maps a server stream to
SSE, and maps a client stream or bidirectional stream to WebSocket. Generated
interfaces retain typed `Send` and `Recv` methods, so one service implementation
can serve both HTTP and gRPC transports.

```proto
rpc WatchTodos (WatchTodosRequest) returns (stream TodoEvent) {
  option (google.api.http) = { get: "/v1/todos/watch" };
}

rpc SyncTodos (stream SyncTodoRequest) returns (stream TodoEvent) {
  option (google.api.http) = {
    post: "/v1/todos/sync"
    body: "*"
  };
}
```

The HTTP binding for `WatchTodos` writes `text/event-stream`. The binding for
`SyncTodos` registers a GET route for the WebSocket upgrade, even though the
RPC's HTTP annotation says `post`. See [HTTP Streaming with SSE and
WebSocket](/docs/component/transport/http-streaming/) for service
implementations, generated clients, codecs, deadlines, and proxy behavior.

## Typed configuration reads

`config.Get[T]` reads a named key without declaring a destination variable
first. It directly handles `bool`, `int`, `int64`, `float64`, and `string`; other
types are decoded through `Value.Scan`.

```go
timeout, err := config.Get[string](c, "server.http.timeout")
if err != nil {
	return err
}

database, err := config.Get[Database](c, "data.database")
if err != nil {
	return err
}
```

A missing key returns `config.ErrNotFound`. This complements whole-tree
`Config.Scan`; it does not load sources by itself, so call `Load` first. See
[Configuration](/docs/component/config/) for source order, environment keys,
watchers, and generated configuration types.

## Pluggable request validation

In v2, core `validate.Validator()` only called a request's generated
`Validate() error` method and was deprecated in favor of a separate contrib
middleware. In v3, the core middleware still supports that method and also
accepts any number of `ValidatorFunc` callbacks.

```go
validator := validate.Validator(func(value any) error {
	message, ok := value.(proto.Message)
	if !ok {
		return nil
	}
	return protovalidate.Validate(message)
})

srv := http.NewServer(http.Middleware(validator))
```

Kratos calls the request's `Validate` method first, then custom validators in
argument order, and stops at the first error. A failure becomes a Bad Request
with reason `VALIDATOR` and retains the validator error as its cause. See
[Validate](/docs/component/middleware/validate/).

## slog handlers and context attributes

The switch to standard `log/slog` also adds Kratos helpers for building a text
or JSON handler, filtering records and sensitive attributes, and carrying
`slog.Attr` values in a context.

```go
logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.JSONFormat),
	log.WithLevel(slog.LevelInfo),
	log.WithFilter(log.FilterKey("password")),
))

ctx = log.ContextWithAttrs(ctx,
	slog.String("request.id", requestID),
)
logger.InfoContext(ctx, "request completed")
```

Handlers created by `log.NewHandler` or wrapped by `log.NewLogger` include the
context attributes when a context-aware slog method is used. See
[Logging](/docs/component/log/) for setup and filtering behavior.

## Separate Go JSON and protobuf JSON

V3 provides a dedicated `encoding/protojson` codec in core. Import the codec
that matches the public contract rather than relying on one `json` name to
switch behavior by value type.

```go
import (
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
)
```

The `json` subtype follows `encoding/json`; the `protojson` subtype follows
protobuf JSON semantics. This affects protobuf field names, enum values,
well-known types, and default-value output. See [Encoding and
serialization](/docs/component/encoding/) before changing an existing wire
contract.

## Error additions

V3 adds `errors.Join`, exposes `errors.ErrUnsupported`, and adds
`TooManyRequests`/`IsTooManyRequests` for HTTP status 429.

```go
combined := errors.Join(cacheErr, databaseErr)

if errors.Is(combined, databaseErr) {
	// At least one joined error matches.
}

return errors.TooManyRequests("RATE_LIMITED", "try again later")
```

`Join` drops nil values and preserves each non-nil error in an error tree, so
`errors.Is` and `errors.As` can inspect all of them. Use a stable reason and a
client-safe message for the 429 helper. See [Errors](/docs/component/errors/)
for transport mapping and cause handling.

## Adopt features deliberately

Start with the changes required to compile and regenerate the service, then add
features where the API contract needs them. HTTP streaming changes the network
protocol and operational behavior; JSON selection can change response bytes;
validation can reject requests that were previously accepted. Cover those
decisions with HTTP/gRPC contract tests and deploy compatible producers and
consumers together.

For the required breaking changes and upgrade order, follow [Migrate from v2 to
v3](/docs/migration/v2-to-v3/).
