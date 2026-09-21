---
id: http
title: HTTP
---

Kratos HTTP transport uses `gorilla/mux` and generated protobuf bindings. A
generated binding converts path, query, and body fields into a protobuf request,
sets the canonical RPC operation, runs middleware, and encodes the service
result.

## Create a server

Create the server in `internal/server`, then register each generated service.
Add the server to `kratos.App` so startup and graceful shutdown share the
application lifecycle.

```go
srv := http.NewServer(
	http.Address(":8000"),
	http.Timeout(time.Second),
	http.Middleware(
		recovery.Recovery(),
		validate.Validator(),
	),
)
v1.RegisterTodoServiceHTTPServer(srv, todo)
```

The server defaults to TCP, address `:0`, a one-second request context timeout,
and strict-slash routing. `TLSConfig` enables HTTPS. `Listener` accepts an
existing listener, while `Endpoint` overrides the endpoint advertised through
service registration. Other options configure a path prefix, native HTTP
filters, decoders, response and error encoders, and 404/405 handlers.

Kratos middleware works with normalized RPC requests. `http.Filter` is native
`net/http` middleware around the router and is the right place for HTTP-only
work such as CORS or static response headers.

## Generated routes and binding

Declare routes with `google.api.http` in the protobuf service:

```protobuf
rpc GetTodo(GetTodoRequest) returns (Todo) {
	option (google.api.http) = {get: "/v1/todos/{id}"};
}
```

After `make api`, call `RegisterTodoServiceHTTPServer`. The generated handler
uses `BindVars`, `BindQuery`, and `Bind` as required by the annotation. It then
runs middleware with `/todo.v1.TodoService/GetTodo` as the operation. Do not
repeat this binding in the service implementation.

The default body decoder selects a codec from `Content-Type`; the response and
error encoders select one from `Accept` and fall back to `json`. A returned
Kratos error becomes an HTTP response with its code, reason, message, and
metadata. `google.api.HttpBody` bypasses structured encoding and carries its own
content type and bytes.

## Handwritten routes

Use a `Router` when an endpoint is not part of the protobuf API. Its handlers
receive `http.Context`, which embeds `context.Context` and provides request,
response, binding, and result helpers.

```go
router := srv.Route("/")
router.GET("/healthz", func(ctx http.Context) error {
	return ctx.JSON(200, map[string]string{"status": "ok"})
})
```

Routers support groups and GET, HEAD, POST, PUT, PATCH, DELETE, CONNECT,
OPTIONS, and TRACE helpers. Use `BindVars`, `BindQuery`, `BindForm`, or `Bind`
for input. Use `Returns`, `Result`, `JSON`, `XML`, `String`, `Blob`, or `Stream`
for output. `Handle` and `HandleFunc` on the server accept native `net/http`
handlers instead.

## Create a client

Generated HTTP clients use a Kratos `*http.Client`. The default client timeout
is two seconds. Without a TLS configuration it uses HTTP; with
`WithTLSConfig` it uses HTTPS.

```go
conn, err := http.NewClient(ctx,
	http.WithEndpoint("http://127.0.0.1:8000"),
	http.WithTimeout(2*time.Second),
	http.WithMiddleware(logging.Client(logger)),
)
if err != nil {
	return err
}
defer conn.Close()

client := v1.NewTodoServiceHTTPClient(conn)
todo, err := client.GetTodo(ctx, &v1.GetTodoRequest{Id: id})
```

Client options can replace the round tripper, request encoder, response decoder,
or error decoder. `WithUserAgent` sets a user agent. For discovery, combine
`WithDiscovery(discovery)` with an endpoint such as `discovery:///todo`;
`WithNodeFilter`, `WithSubset`, and the global selector control instance
selection. `WithBlock` waits for an initial discovery result.

## HTTP streaming

The v3 HTTP generator maps a server-streaming RPC to Server-Sent Events and a
client-streaming or bidirectional RPC to WebSocket. Generated clients expose
typed stream interfaces, so normal service code still uses generated `Send` and
`Recv` methods. SSE sends `message` events and can only receive on the client;
WebSocket supports two-way protobuf messages. Regenerate bindings after changing
streaming methods because the generated HTTP method and handler determine the
wire behavior.

Set explicit stream deadlines and stop when `Send` or `Recv` fails. The HTTP
server detaches a stream from the ordinary request deadline and cancellation
after the stream is created, so a long-lived stream must enforce its own
lifetime policy.

See [HTTP Streaming with SSE and
WebSocket](/docs/component/transport/http-streaming/) for protobuf definitions,
typed server and client examples, codec selection, closure behavior, and proxy
configuration.

## Path and codec helpers

Generated clients call `BuildPath` to expand annotated paths. Handwritten code
can do the same, using the field's JSON name:

```go
path := http.BuildPath("/v1/todos/{id}", &struct {
	ID string `json:"id"`
}{ID: "42"})
```

Call options include `ContentType`, `Accept`, `Operation`, `PathTemplate`, and
`Header`. See [Encoding](/docs/component/encoding/) for the registered codecs
and [Errors](/docs/component/errors/) for the error response contract.
