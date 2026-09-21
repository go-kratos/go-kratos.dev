---
id: examples
title: Examples and Source Code
description: Find complete Kratos v3 services and focused component examples.
---

Use [kratos-layout](https://github.com/go-kratos/kratos-layout) for a complete
service and the [Kratos source](https://github.com/go-kratos/kratos) package
tests for focused component examples. Contrib integrations carry their examples
and tests inside their own modules.

## Complete service

The layout contains:

- a Todo protobuf contract with unary and streaming RPCs;
- generated HTTP/gRPC bindings and OpenAPI output;
- `service`, `biz`, and `data` layers wired at compile time;
- Ent-backed MySQL runtime storage and SQLite repository tests;
- AIP filtering, ordering, pagination, field masks, and required-field checks;
- application bootstrap with `slog`, configuration, recovery, validation, and
  OpenTelemetry trace attribute extraction.

Follow [Build a Service from the Layout](/docs/guide/service-development/) for
the actual request flow. Read its `go.mod` and source instead of relying on an
older README description.

## Component examples

Core package tests are the closest executable specification for option defaults
and edge cases. Useful locations include `config/*_test.go`,
`transport/http/*_test.go`, `transport/grpc/*_test.go`,
`middleware/*/*_test.go`, and `selector/*_test.go`. Read the implementation
beside each test to distinguish public guarantees from test setup details.

The separate [go-kratos/examples](https://github.com/go-kratos/examples)
repository contains integration-oriented projects. Before copying one:

1. Check `go.mod` for `/v3` core and contrib module paths.
2. Inspect its version and generator configuration.
3. Run generation only through commands committed by that project.
4. Run `go test ./...` and `go vet ./...` before adapting it.
5. Add one integration at a time so failures have a clear owner.

## Apply an example to your service

A compiling example shows that its imports and types agree at the selected
versions. It does not establish production policy such as TLS trust, registry
credentials, telemetry sampling, database migrations, or shutdown budgets.
Those choices must be configured and tested in the consuming service.

Avoid combining v2 prose with v3 imports or mixing unrelated contrib versions.
Core and contrib are separate modules even though their source lives in the
same repository.
