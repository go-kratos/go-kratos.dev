---
id: ent
title: Ent
---

Kratos does not require an ORM. The project template uses Ent to demonstrate a
real persistence layer while keeping its API behind repository interfaces in
`internal/biz`. You can replace Ent with `database/sql`, GORM, or another store
without changing the transport or service layers.

## Where Ent belongs

The template keeps schema and generated Ent code under `internal/data/ent`.
`internal/data/data.go` opens the client and owns its cleanup. Repository files
in `internal/data` translate between Ent persistent objects and business domain
objects; API protobuf types do not enter this layer.

```text
internal/data/
├── data.go              database client, migration, cleanup
├── todo.go              biz.TodoRepo implementation
├── todo_test.go         repository tests with SQLite
└── ent/
    ├── generate.go      go:generate directive
    ├── schema/           handwritten schema definitions
    └── ...               generated query builders and models
```

## Define a schema

The Todo schema composes shared UUID and timestamp mixins, then defines the
stored fields. Its status field uses the business enum type so conversion does
not require a second set of lifecycle constants.

```go
func (Todo) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TimeMixin{},
	}
}

func (Todo) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").Default(""),
		field.String("content").Default(""),
		field.Bool("completed").Default(false),
		field.Int32("status").
			GoType(biz.TodoStatus(0)).
			Default(int32(biz.TodoStatusActive)),
	}
}
```

The shared ID mixin creates application-generated UUIDv7 values. The time mixin
adds immutable `created_at` and automatically updated `updated_at` fields.
Indexes cover status and update time.

## Generate Ent code

`internal/data/ent/generate.go` contains the generator directive:

```go
//go:generate go run -mod=mod entgo.io/ent/cmd/ent generate ./schema
```

After editing `internal/data/ent/schema`, run the project workflow:

```bash
make all
go test ./...
```

`make all` eventually runs `go generate ./...` and `go mod tidy`. Edit schema
and repository files, not generated Ent files.

## Open and close the client

The template reads the driver and DSN from `conf.Data`, calls `ent.Open`, and
returns a cleanup function for Wire. It enables SQL debug output only when
configured. `auto_migrate` calls `db.Schema.Create` at startup for local
development; production schema changes should run as a separate reviewed
deployment step.

The default configuration uses MySQL and imports `go-sql-driver/mysql`. Keep the
driver name and DSN consistent, enable `parseTime=True` for time fields, and
inject credentials at runtime rather than committing them.

## Implement a repository

The business layer declares `TodoRepo`; the data layer implements it and maps
storage-specific failures to business errors where the meaning is known.

```go
func (r *todoRepo) FindByID(ctx context.Context, id uuid.UUID) (*biz.Todo, error) {
	po, err := r.data.db.Todo.Query().
		Where(todo.IDEQ(id), todo.StatusEQ(biz.TodoStatusActive)).
		Only(ctx)
	if err != nil {
		if ent.IsNotFound(err) {
			return nil, biz.ErrTodoNotFound
		}
		return nil, err
	}
	return toBiz(po), nil
}
```

The template implements deletion by changing status to deleted. Every read and
update query filters for active rows, so the soft-delete rule is enforced at
the repository boundary. List queries apply parsed AIP filters and ordering,
then append ID as a deterministic tie breaker before offset and limit.

## Test repositories

Repository tests should exercise generated queries and conversion code. The
template opens an in-memory SQLite database with `modernc.org/sqlite`, wraps it
with the Ent SQLite dialect, and calls `client.Schema.Create`. Tests cover CRUD,
soft delete, filtering, ordering, and stable pagination without requiring a
developer MySQL instance. Application startup is still tested against the real
production driver in integration or deployment checks.

See [Complete Service Development](/docs/guide/service-development/) for the
DTO, domain object, repository, and service flow around this data layer.
