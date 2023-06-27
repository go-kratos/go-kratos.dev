---
id: ent
title: Ent 数据库框架使用
description: Ent 是 Facebook 开源的一个简单易用的 Database 实体框架
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---

**Ent** 是 *Facebook* 开源的一个简单易用的 Database 实体框架。

它使构建和维护具有大型数据模型的应用程序变得容易，并坚持以下原则:

* 轻松地将数据库模式建模为图形结构。
* 将模式定义为可编程的Go代码。
* 基于代码生成的静态类型。
* 数据库查询和图遍历很容易编写。
* 简单地扩展和使用Go模板自定义。

### 安装工具

```bash
go install entgo.io/ent/cmd/ent@latest
```

### 创建实体 Schema

```bash
ent new User
```

将会在 *project/ent/schema/* 目录下为用户生成模式:

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

为 `User` 添加 `name、age` 两个数据库字段:

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

从项目的ent目录运行go generate，如下所示:

```
go generate ./ent
# ent generate ./ent/schema
```

### 创建数据库连接客户端

首先，创建一个新的ent.Client。对于本例，我们将使用SQLite3。

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

然后进行创建一个 `User` 将会写入到数据库中：

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

* [https://entgo.io/docs/getting-started/](https://entgo.io/docs/getting-started/)
* [https://github.com/go-kratos/examples/tree/main/blog/internal/data](https://github.com/go-kratos/examples/tree/main/blog/internal/data)
