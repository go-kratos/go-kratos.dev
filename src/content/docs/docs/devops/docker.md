---
id: docker
title: Docker
---

The project template builds the service in a Go image and copies only the
compiled binary into a small runtime image. The builder must satisfy the Go
version in `go.mod`; the v3 template requires Go 1.25 or newer within the
supported toolchain range.

## Template image

The template Dockerfile follows this structure:

```dockerfile
FROM golang:1.25 AS builder

COPY . /src
WORKDIR /src
RUN make build

FROM debian:stable-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates netbase \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /src/bin /app
WORKDIR /app
EXPOSE 8000 9000
VOLUME /data/conf
CMD ["./server", "-conf", "/data/conf"]
```

`make build` runs `go build` with the version derived from Git and writes the
command binary to `bin`. Use your organization's approved Go module proxy; the
template's proxy setting is only a build environment choice.

## Build and run locally

Build from the repository root, then mount configuration read-only:

```bash
docker build -t todo-service .
docker run --rm \
	-p 8000:8000 \
	-p 9000:9000 \
	-v "$PWD/configs:/data/conf:ro" \
	-e KRATOS_DATABASE_SOURCE='app:secret@tcp(host.docker.internal:3306)/todo?parseTime=True' \
	todo-service
```

The template's `KRATOS` environment source loads `KRATOS_DATABASE_SOURCE` as
the root key `DATABASE_SOURCE`, which expands the matching placeholder. Inside a container,
`127.0.0.1` refers to that container, so use the Compose service name,
Kubernetes Service name, or another reachable database host. Keep database
credentials in the deployment secret system rather than the image or committed
configuration.

## Production image choices

- Pin builder and runtime images according to the supply-chain policy and scan
  the resulting image.
- Run as a non-root user when the runtime filesystem and mounted configuration
  permissions allow it.
- Keep CA certificates when clients use TLS. Add timezone data only when the
  application actually needs local timezone files.
- Build for the target platform explicitly in multi-architecture pipelines and
  do not copy the Go module cache into the runtime stage.
- Set an explicit working directory and use the exec-form `CMD` so Unix signals
  reach the service process directly.

## Configuration and migrations

Mount the whole configuration directory or a single file accepted by `-conf`.
Environment placeholders in `configs/config.yaml` let the deployment override
secrets and addresses. Keep Ent `debug` and `auto_migrate` disabled in
production; run reviewed schema migrations before rolling out the service.

The HTTP and gRPC listeners must bind to `0.0.0.0` in a container. Publishing or
declaring a port does not change the address configured inside the service.

## Shutdown and health

Docker and orchestrators send a termination signal before enforcing their grace
period. Kratos handles SIGTERM, SIGQUIT, and SIGINT by default, deregisters the
service, and stops its transports. Set `kratos.StopTimeout` shorter than the
platform termination grace period so forced termination remains the last step.

The gRPC transport registers the standard health service by default. Add an
HTTP readiness route only if the deployment needs one, and make readiness
reflect whether the service can accept traffic. During shutdown, remove the
instance from discovery and fail readiness before the platform kills the
process.
