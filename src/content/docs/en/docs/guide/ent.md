---
id: ent
title: Ent
---

Any ORM or library is supported in Kratos project for data accessing. Please refer to the [examples](https://github.com/go-kratos/examples/tree/main) for integration.

**Ent** is an easy-to-use ORM which developed by *Facebook*. Here is a brief guide to use this library.

### Install Ent

```bash
go install entgo.io/ent/cmd/ent@latest
```

### Create Schema

```bash
ent new User
```

This command will generate schema in `project/ent/schema/` directory.

```go
// <project>/ent/schema/user.go

package schema

import "entgo.io/ent"

// User holds the schema definition for the User entity.
type User struct {
    ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
    return nil
}

// Edges of the User.
func (User) Edges() []ent.Edge {
    return nil
}
```

Add two fields `name、age` to `User` table.

```go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
)

// Fields of the User.
func (User) Fields() []ent.Field {
    return []ent.Field{
        field.Int("age").
            Positive(),
        field.String("name").
            Default("unknown"),
    }
}
```

Run `go generate`:
```
go generate ./ent
# ent generate ./ent/schema
```

### Create DB Connection Client

First, create a new `ent.Client`. We use SQLite3 here for demonstration.

```go
package main

import (
    "context"
    "log"

    "<project>/ent"

    _ "github.com/mattn/go-sqlite3"
)

func main() {
    client, err := ent.Open("sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
    if err != nil {
        log.Fatalf("failed opening connection to sqlite: %v", err)
    }
    defer client.Close()
    // Run the auto migration tool.
    if err := client.Schema.Create(context.Background()); err != nil {
        log.Fatalf("failed creating schema resources: %v", err)
    }
}
```

To create a `User` in table.

```go
func CreateUser(ctx context.Context, client *ent.Client) (*ent.User, error) {
    u, err := client.User.
        Create().
        SetAge(30).
        SetName("a8m").
        Save(ctx)
    if err != nil {
        return nil, fmt.Errorf("failed creating user: %v", err)
    }
    log.Println("user was created: ", u)
    return u, nil
}
```

### References

* https://entgo.io/docs/getting-started/
* https://github.com/go-kratos/examples/tree/main/blog/internal/data

