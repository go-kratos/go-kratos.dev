---
id: ent
title: Ent
---

Kratos 不强制使用 ORM。项目模板通过 Ent 展示真实持久化层，同时把它隐藏在
`internal/biz` 的仓储接口后。将 Ent 换成 `database/sql`、GORM 或其他存储时，
无需修改传输层和 service 层。

## Ent 的位置

模板把 schema 和生成的 Ent 代码放在 `internal/data/ent`。`internal/data/data.go`
打开客户端并管理清理；`internal/data` 中的仓储文件在 Ent 持久化对象和业务领域
对象之间转换，API Protobuf 类型不会进入这一层。

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

## 定义 schema

Todo schema 组合公共 UUID 和时间 mixin，再定义存储字段。status 字段直接使用业务
枚举类型，因此转换时不需要另一套生命周期常量。

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

公共 ID mixin 生成应用侧 UUIDv7；时间 mixin 增加不可变的 `created_at` 和自动更新
的 `updated_at` 字段。索引覆盖 status 和更新时间。

## 生成 Ent 代码

`internal/data/ent/generate.go` 包含生成指令：

```go
//go:generate go run -mod=mod entgo.io/ent/cmd/ent generate ./schema
```

修改 `internal/data/ent/schema` 后运行项目工作流：

```bash
make all
go test ./...
```

`make all` 最终执行 `go generate ./...` 和 `go mod tidy`。请修改 schema 和仓储
文件，不要直接编辑生成的 Ent 文件。

## 打开与关闭客户端

模板从 `conf.Data` 读取 driver 和 DSN，调用 `ent.Open`，并向 Wire 返回 cleanup
函数。只有配置开启时才输出 SQL 调试日志。`auto_migrate` 在启动时调用
`db.Schema.Create`，适合本地开发；生产环境应把 schema 变更作为独立、经过审查
的部署步骤执行。

默认配置使用 MySQL 并导入 `go-sql-driver/mysql`。driver 名称必须与 DSN 匹配，
时间字段需要 `parseTime=True`，凭据应在运行时注入而不是提交进仓库。

## 实现仓储

业务层声明 `TodoRepo`，数据层负责实现，并在能确定业务含义时把存储错误转换为
业务错误。

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

模板通过把 status 改成 deleted 实现删除。所有读取和更新查询都过滤 active 行，
使软删除规则集中在仓储边界。列表查询应用已解析的 AIP 过滤和排序，再追加 ID
作为稳定的同值排序键，然后执行 offset 和 limit。

## 测试仓储

仓储测试应覆盖生成查询和转换代码。模板通过 `modernc.org/sqlite` 打开内存
SQLite，使用 Ent SQLite dialect 包装后调用 `client.Schema.Create`。测试覆盖 CRUD、
软删除、过滤、排序和稳定分页，无需开发者本机运行 MySQL。应用启动仍应在集成或
部署检查中使用真正的生产 driver 测试。

围绕此数据层的 DTO、领域对象、仓储和服务流程见
[完整服务开发](/zh-cn/docs/guide/service-development/)。
