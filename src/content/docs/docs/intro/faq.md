---
id: faq
title: FAQ
---

## protoc cannot find a protobuf file

Install the tools through `make init`, then run generation through the project's
Buf configuration. The template declares the `api` and `internal` modules plus
`buf.build/googleapis/googleapis` in `buf.yaml`; run `buf dep update` after
changing remote dependencies. Configure the editor to use the same Buf workspace
instead of maintaining a separate include path.

## The `kratos` command is not found

Install the v3 CLI and make its Go binary directory available on `PATH`:

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
go env GOBIN GOPATH
kratos --help
```

## Generated bindings do not compile after an upgrade

Update imports, select the appropriate v3 JSON codec, and regenerate code before debugging generated files:

```bash
make all
go test ./...
```

Generated protobuf and Wire files are outputs. See [Migrate from v2 to v3](/docs/migration/v2-to-v3/) for the required migration order.

## Control protobuf JSON output

Use the v3 protobuf JSON codec when a transport needs protobuf JSON semantics:

```go
import _ "github.com/go-kratos/kratos/v3/encoding/protojson"
```

Configure protobuf JSON behavior in the codec or response encoder used by the application. Do not rely on the removed v2 `encoding/json` protobuf behavior; see [Encoding](/docs/component/encoding/).

## The layout cannot connect to the database

The current template uses MySQL at runtime. Create the database and set
`KRATOS_DATABASE_SOURCE` to a DSN reachable from the process. Keep `parseTime=True`
because the Ent model contains time fields. SQLite is included for repository
tests and is not the default runtime driver. In a container, replace
`127.0.0.1` with the database service hostname.

## Environment values do not replace nested configuration

The layout uses placeholders such as `${DATABASE_SOURCE:default}` inside
`configs/config.yaml`. `env.NewSource("KRATOS")` loads
`KRATOS_DATABASE_SOURCE`, strips `KRATOS_`, and creates the root key
`DATABASE_SOURCE`; the resolver then uses that merged key for the placeholder.
The source does not translate underscores into a nested key path. Follow this
prefix-and-placeholder convention, or choose an explicit key convention and
decoder in your application.

## `kratos run` does not regenerate or restart the service

The v3 command locates a `cmd` package and executes `go run`. It is not a file
watcher and does not run protobuf, Ent, configuration, or Wire generation.
Run the project's `make all` after changing generator inputs, and restart the
command after source changes.

## An HTTP route returns 404

Confirm that the proto has the intended `google.api.http` annotation, run
`make api`, and register the generated HTTP service on the server. A gRPC
registration does not register HTTP routes. For handwritten routes, use the
same `*http.Server` instance passed to `kratos.App` and check group or server
path prefixes.

## A middleware does not run for streaming gRPC

`grpc.Middleware` and `grpc.WithMiddleware` apply to unary calls. Use
`grpc.StreamMiddleware` on the server and `grpc.WithStreamMiddleware` on the
client for streams. HTTP generated streams still run the ordinary HTTP
middleware chain around the stream handler.
