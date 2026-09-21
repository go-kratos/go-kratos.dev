---
id: usage
title: CLI Reference
description: Use the Kratos v3 CLI and the generated project's own build workflow.
---

The v3 CLI is a separate Go module. Install it and inspect the exact command set
provided by that version:

```bash
go install github.com/go-kratos/kratos/cmd/kratos/v3@latest
kratos --help
kratos --version
```

The root commands are `new`, `proto`,
`upgrade`, `changelog`, and `run`. There is no `kratos change` or generic
runtime plugin command.

## Create a project

```bash
kratos new helloworld
kratos new --repo https://github.com/your-org/layout.git --branch main helloworld
```

`new` copies a Git repository template. Its relevant flags are `--repo`,
`--branch`, `--timeout`, and `--nomod`. The default repository is maintained
independently from the CLI, so inspect the new project's `go.mod`, Makefile, and
generator files before developing against it.

## Scaffold protobuf code

```bash
kratos proto add api/helloworld/v1/greeter.proto
kratos proto client api/helloworld/v1/greeter.proto
kratos proto server api/helloworld/v1/greeter.proto --target-dir internal/service
```

`proto add` creates a proto template using the module path read from `go.mod`.
The path must be hierarchical. `proto client` invokes the configured protoc
workflow for a file; `proto server` generates a service implementation
scaffold. These commands do not replace the layout's full `make api`/`make all`
workflow, which generates every configured output.

## Run during development

```bash
kratos run
kratos run --work ./cmd/server
```

`run` locates a directory below `cmd`, then executes `go run` for that command.
It does not watch files or regenerate code. `--work` changes the child process
working directory. Use the project's compiled artifact in deployment.

## Upgrade tools

```bash
kratos upgrade
```

`upgrade` installs the latest CLI, Kratos HTTP/error generators, Go protobuf
generators, and the OpenAPI generator. It is not a complete application
major-version migration: review module paths, public API changes, generated
code, and application tests separately. Follow the [v2 to v3 guide](/docs/migration/v2-to-v3/)
for an existing v2 service.

## Generate a changelog

```bash
kratos changelog dev
kratos changelog v3.0.0
```

`changelog` reads release or commit information from a GitHub repository. Use
`--repo-url` to select another repository. It requires network and repository
history; review generated prose before publishing it.

## Prefer project-owned commands

Once a template exists, its Makefile and generation configs are the build
contract:

```bash
make init
make api
make config
make all
go test ./...
make build
```

Use `make api` after public protobuf changes, `make config` after configuration
proto changes, and `make all` after constructors, provider sets, or Ent schema
changes. Commit generated outputs with their sources.

Use `kratos <command> --help` to inspect the exact behavior of the installed
version.
