---
id: http-streaming
title: HTTP Streaming with SSE and WebSocket
description: Define, implement, and call HTTP streaming RPCs in Kratos v3.
---

Kratos v3 can generate HTTP bindings for streaming RPCs. A server-streaming RPC
uses Server-Sent Events (SSE); a client-streaming or bidirectional RPC uses
WebSocket. The same service implementation can still be registered with both
the generated HTTP and gRPC servers.

| Protobuf RPC | HTTP transport | Generated client operations |
| --- | --- | --- |
| Unary | Normal HTTP request and response | One request and one reply |
| Server streaming | SSE | `Recv` |
| Client streaming | WebSocket | `Send`, `CloseAndRecv` |
| Bidirectional streaming | WebSocket | `Send`, `Recv`, `CloseSend` |

## Define streaming RPCs

The current project template contains both a server-streaming `WatchTodos` RPC
and a bidirectional `SyncTodos` RPC:

```proto
rpc WatchTodos (WatchTodosRequest) returns (stream TodoEvent) {
  option (google.api.http) = {
    get: "/v1/todos/watch"
  };
}

rpc SyncTodos (stream SyncTodoRequest) returns (stream TodoEvent) {
  option (google.api.http) = {
    post: "/v1/todos/sync"
    body: "*"
  };
}
```

Run the project's API generation command after changing the service contract:

```bash
make api
```

For server streaming, the generated handler keeps the HTTP method from the
annotation and writes an SSE response. For client streaming and bidirectional
streaming, the generated HTTP route is `GET` because WebSocket starts with an
HTTP GET upgrade handshake. In the example above, the `post` annotation still
describes the RPC's HTTP rule, while the generated WebSocket route is
`GET /v1/todos/sync`.

## Implement the service

Generated stream interfaces provide typed `Send` and `Recv` methods. The
server-streaming method receives its request before the stream; a
client-streaming method receives requests from the stream.

```go
func (s *TodoService) WatchTodos(
	req *v1.WatchTodosRequest,
	stream v1.TodoService_WatchTodosServer,
) error {
	for _, todo := range todos {
		if err := stream.Send(&v1.TodoEvent{
			Action: "snapshot",
			Todo:   todo,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (s *TodoService) SyncTodos(stream v1.TodoService_SyncTodosServer) error {
	for {
		req, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			return err
		}
		if err := stream.Send(applyChange(req)); err != nil {
			return err
		}
	}
}
```

The generated HTTP server calls these same methods. It constructs an SSE or
WebSocket stream, runs server middleware around the service method, and closes
the transport with the returned error.

## Call a server stream

The generated HTTP client opens the SSE response and returns a typed stream.
Read until `io.EOF`, or cancel the context when the caller no longer needs
events.

```go
stream, err := client.WatchTodos(ctx, &v1.WatchTodosRequest{
	PageSize: 20,
})
if err != nil {
	return err
}
defer stream.CloseSend()

for {
	event, err := stream.Recv()
	if errors.Is(err, io.EOF) {
		break
	}
	if err != nil {
		return err
	}
	handle(event)
}
```

An SSE response has content type `text/event-stream`. Successful messages use
the `message` event name. If the service returns an error after streaming has
started, Kratos sends an `error` event containing the encoded Kratos error and
then ends the response.

Browser clients can use `EventSource` when all request inputs fit in the URL:

```js
const stream = new EventSource("/v1/todos/watch?page_size=20");

stream.addEventListener("message", (event) => {
  const todoEvent = JSON.parse(event.data);
  console.log(todoEvent);
});

stream.addEventListener("error", () => {
  stream.close();
});
```

For a direct protocol check, disable buffering in the client:

```bash
curl -N -H 'Accept: text/event-stream' \
  'http://127.0.0.1:8000/v1/todos/watch?page_size=20'
```

## Call a bidirectional stream

The generated bidirectional client opens its WebSocket connection on the first
`Send`, `Recv`, or `CloseSend`. Sending first is required when path or query
values come from the first request message.

```go
stream, err := client.SyncTodos(ctx)
if err != nil {
	return err
}
defer stream.CloseSend()

if err := stream.Send(&v1.SyncTodoRequest{
	Action: "create",
	Todo:   &v1.Todo{Title: "read the docs"},
}); err != nil {
	return err
}

event, err := stream.Recv()
if err != nil {
	return err
}
handle(event)
```

Generated clients select `application/protojson` for WebSocket messages. A raw
WebSocket client must use the same protobuf JSON representation and handle the
Kratos end and error control frames. Prefer the generated Go client when both
ends are Go services.

## Request binding and codecs

Before opening an SSE stream, the generated handler binds the request body,
query, and path variables in the same way as a unary handler. For a WebSocket
stream, every received frame becomes a request message; path and query values
are then bound onto that message. If an HTTP rule maps a named message field as
its body, the frame carries only that field and the generator configures
`WithStreamBodyField`.

Stream codecs are selected from `Accept` and `Content-Type`. The generated
client sets the headers needed by its binding. Low-level clients should set
them explicitly; when no registered subtype matches, streaming falls back to
`protojson`, then to `json` if `protojson` is unavailable.

## Lifecycle, deadlines, and errors

HTTP streams are detached from the server's ordinary per-request timeout so a
long-lived connection is not stopped by a unary request budget. The stream
context preserves values added by middleware, but it does not inherit the
ordinary request's deadline or cancellation. End the loop when `Send` or `Recv`
fails, and use the stream's `SetReadDeadline` and `SetWriteDeadline` methods when
the application needs idle or write limits. The zero time disables the
corresponding deadline.

Normal closure is reported to the generated client as `io.EOF`. Service errors
are transported before closure: SSE uses an `error` event, while WebSocket uses
an error control frame. Design reconnect, resume tokens, event ordering, and
delivery guarantees in the application protocol; the transport does not add a
durable event log or automatic replay.

Proxies and gateways must allow WebSocket upgrades and should disable response
buffering for SSE. Their idle timeouts must exceed the stream's expected quiet
period, or the application should send meaningful heartbeat messages.
