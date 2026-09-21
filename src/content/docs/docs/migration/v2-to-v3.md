---
id: v2-to-v3
title: Migrate from v2 to v3
description: Differences between Kratos v2 and v3 and a safe upgrade sequence.
---

Kratos v3 changes the module major version, adopts `log/slog`, moves optional
dependencies out of core, and removes the public HTTP binding package. Plan the
upgrade as a code migration followed by regeneration and integration testing;
changing `/v2` to `/v3` is only the first step.

This guide compares the last v2 release, v2.9.2, with Kratos v3 and incorporates
the framework's [official migration notes](https://github.com/go-kratos/kratos/blob/main/docs/migration/v2-to-v3.md).

## Difference summary

| Area | v2 | v3 | Upgrade action |
| --- | --- | --- | --- |
| Go module | `github.com/go-kratos/kratos/v2` | `github.com/go-kratos/kratos/v3` | Change core imports and dependency |
| Go baseline | Go 1.22 in v2.9.2 | Go 1.25 in v3.0.0 | Upgrade build, CI, and runtime toolchains |
| CLI/generators | `/v2` command modules | `/v3` command modules | Reinstall tools and regenerate output |
| Logging | Kratos `Logger`, `Helper`, `Valuer` | Standard `*slog.Logger` and slog handlers | Rewrite logger construction and call sites |
| JSON | One `json` codec mixed Go/protobuf semantics | Separate `json` and `protojson` codecs | Choose wire behavior explicitly |
| JWT | Core `middleware/auth/jwt` | Independent contrib JWT module | Change import and add module |
| Metrics/tracing | Core middleware with OpenTelemetry dependencies | Independent OpenTelemetry contrib module | Change imports and own provider lifecycle |
| Circuit breaker | Aegis-backed core implementation/options | Internal default and `WithBreakerFactory` | Adapt custom breaker injection |
| HTTP binding | Exported `transport/http/binding` | Context binding plus `BuildPath` | Regenerate and replace handwritten use |

## 1. Upgrade the toolchain

Install a Go version supported by v3 before changing modules. Update local
development, CI images, Docker builders, linters, and code-generation jobs
together. A binary built with an older Go version cannot consume a module whose
`go` directive requires 1.25.

Reinstall the v3 CLI and generators rather than leaving v2 binaries earlier on
`PATH`:

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
go install github.com/go-kratos/kratos/cmd/protoc-gen-go-http/v3@latest
go install github.com/go-kratos/kratos/cmd/protoc-gen-go-errors/v3@latest
kratos --version
```

Projects using Buf remote/local plugin declarations should update the module
paths there too. Prefer the project's pinned generator commands for repeatable
output.

## 2. Update core and contrib modules

Change all core imports and add v3:

```go
// v2
import "github.com/go-kratos/kratos/v2"

// v3
import "github.com/go-kratos/kratos/v3"
```

```bash
go get github.com/go-kratos/kratos/v3@latest
go mod tidy
go list -m all
```

Contrib integrations are separate modules. Update each one to its own `/v3`
path and inspect its version rather than assuming the core version controls it.
Search source, generator files, tools modules, test fixtures, Dockerfiles, and
CI for `/v2` before regeneration.

## 3. Migrate logging to slog

v3 application and middleware options accept `*slog.Logger`. Replace v2
`log.Logger`, `log.Helper`, `log.Valuer`, `log.NewStdLogger`, and helper-specific
trace/service fields.

```go
logger := log.NewLogger(
	slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}),
	log.WithFilter(log.FilterKey("password")),
).With(
	slog.String("service.name", "orders"),
	slog.String("service.version", version),
)

app := kratos.New(
	kratos.Name("orders"),
	kratos.Logger(logger),
)
```

Use `logger.InfoContext` or `log.InfoContext` for request-scoped logging.
Replace third-party Kratos logger adapters with a `slog.Handler` supplied by
that logging library or with an application-owned adapter. OpenTelemetry log
support is `github.com/go-kratos/kratos/contrib/otel/v3/log`.

## 4. Select JSON behavior

v3 registers two core names:

- `encoding/json` is standard Go JSON under subtype `json`.
- `encoding/protojson` is protobuf JSON under subtype `protojson`.
- `contrib/encoding/json/v3` keeps the v2-compatible mixed behavior under
  subtype `json` during migration.

For new v3 code, choose the representation expected by clients:

```go
import (
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
)
```

Do not register core `json` and the compatibility `json` codec together unless
replacement is deliberate. Codec registration is global and the later
registration wins. Add contract tests for protobuf field names, default values,
enums, timestamps, and unknown-field handling before changing wire behavior.

## 5. Move optional middleware to contrib

JWT moved from core:

```go
// v2
import "github.com/go-kratos/kratos/v2/middleware/auth/jwt"

// v3
import "github.com/go-kratos/kratos/contrib/middleware/jwt/v3"
```

```bash
go get github.com/go-kratos/kratos/contrib/middleware/jwt/v3@latest
```

Core `middleware/metrics` and `middleware/tracing` also moved to
`github.com/go-kratos/kratos/contrib/otel/v3/metrics` and `/tracing`.
Applications now own OpenTelemetry provider, exporter, resource, sampling, and
shutdown configuration explicitly. Update middleware imports and confirm that
providers flush after transport shutdown.

## 6. Adapt custom circuit breakers

Default `circuitbreaker.Client()` usage remains valid. v3 removes Aegis from
core and exposes the minimal breaker contract through the middleware package.

```go
middleware := circuitbreaker.Client(
	circuitbreaker.WithBreakerFactory(func() circuitbreaker.CircuitBreaker {
		return newBreaker()
	}),
)
```

Replace v2 `WithGroup`/`WithCircuitBreaker` customization with
`WithBreakerFactory`. Return an independent breaker for each operation. If the
implementation still uses Aegis, declare Aegis directly in the application.

## 7. Replace HTTP binding imports

The exported `transport/http/binding` directory was removed. Regenerated v3
HTTP files already use the current API. In handwritten code:

- replace `binding.EncodeURL` with `http.BuildPath`;
- use `http.Context.Bind`, `BindVars`, `BindQuery`, or `BindForm` in handlers;
- use `encoding/form` only for low-level query/form conversion.

```go
path := http.BuildPath("/v1/users/{id}", &struct {
	ID string `json:"id"`
}{ID: "42"})
```

Search for direct binding imports before deleting v2. Generated files should be
recreated, not manually edited.

## New v3 capabilities

After the required migration, v3 also provides generated HTTP streaming over
SSE and WebSocket, generic `config.Get[T]`, custom validation callbacks, slog
handlers and context attributes, separate Go JSON/protobuf JSON codecs, and new
error helpers. These are optional service features rather than upgrade steps.
See [New Features in Kratos v3](/docs/migration/v3-new-features/) for their
interfaces, examples, and adoption considerations.

## Regenerate in dependency order

After source imports and generator paths are updated:

```bash
make api
make config
go generate ./...
go mod tidy
go test ./...
go vet ./...
```

Use the equivalent commands owned by your project. Review generated diffs for
unexpected route, JSON, error, and service-interface changes. Re-run Wire after
logger constructor or provider signatures change.

## Deployment checklist

- [ ] Development, CI, builder, and runtime images use a v3-compatible Go version.
- [ ] Core, CLI, generator, and contrib paths no longer point to `/v2`.
- [ ] Logger construction and middleware use `*slog.Logger`.
- [ ] JSON behavior has contract tests and no duplicate `json` registration.
- [ ] JWT and OpenTelemetry modules, providers, and cleanup are explicit.
- [ ] Custom circuit breaker factory returns isolated instances.
- [ ] Handwritten HTTP binding imports are replaced.
- [ ] Protobuf, HTTP/gRPC, error, config, Ent, and Wire outputs are regenerated.
- [ ] Unit, integration, HTTP/gRPC contract, startup, and graceful-stop tests pass.
- [ ] Service discovery metadata/endpoints and telemetry are checked in a staging environment.

Roll out with normal service compatibility controls. When v2 and v3 instances
coexist, preserve protobuf fields, HTTP paths, error reasons, discovery naming,
and JSON semantics until all callers have migrated.
