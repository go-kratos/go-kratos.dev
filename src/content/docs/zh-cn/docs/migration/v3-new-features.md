---
id: v3-new-features
title: Kratos v3 新功能
description: 从 Kratos v2 升级后可以使用的新框架能力。
---

Kratos v3 除了破坏性 API 变更，还增加了多项能力。服务在 v3 上正常运行后，可按
实际需要分别采用；升级并不要求一次使用全部新功能。

| 能力 | v3 新增内容 | 适用场景 |
| --- | --- | --- |
| HTTP streaming | 生成 SSE 与 WebSocket server/client binding | 事件流、进度推送、客户端上传流、双向同步 |
| 类型安全的配置读取 | 泛型 `config.Get[T]` | 读取单个 primitive 或配置子树 |
| 可扩展 request 校验 | 顺序执行的 `ValidatorFunc` callback | Protovalidate、AIP field behavior 或应用校验器 |
| 标准结构化日志 | `slog` handler、filter 与 context attribute | 不依赖 Kratos 特有 logger interface 的统一结构化日志 |
| 明确的 JSON 格式 | 独立 `json` 与 `protojson` codec | 选择 Go JSON 或 protobuf JSON wire 行为 |
| 新增错误 helper | `Join`、`ErrUnsupported` 与 HTTP 429 helper | 保留多个失败并表示限流 |

## HTTP 流式 binding

v3 HTTP generator 支持全部四种 RPC 形态。服务端流映射为 SSE，客户端流和双向流
映射为 WebSocket。生成的 interface 保留类型安全的 `Send` 与 `Recv`，因此同一
service 实现可以同时服务 HTTP 与 gRPC transport。

```proto
rpc WatchTodos (WatchTodosRequest) returns (stream TodoEvent) {
  option (google.api.http) = { get: "/v1/todos/watch" };
}

rpc SyncTodos (stream SyncTodoRequest) returns (stream TodoEvent) {
  option (google.api.http) = {
    post: "/v1/todos/sync"
    body: "*"
  };
}
```

`WatchTodos` 的 HTTP binding 写入 `text/event-stream`。虽然 `SyncTodos` 的 HTTP
注解是 `post`，生成的 binding 会为 WebSocket upgrade 注册 GET route。Service
实现、生成的 client、codec、deadline 和 proxy 行为见[使用 SSE 与 WebSocket
实现 HTTP 流式调用](/zh-cn/docs/component/transport/http-streaming/)。

## 类型安全的配置读取

`config.Get[T]` 可直接读取指定 key，无需先声明 destination variable。它直接处理
`bool`、`int`、`int64`、`float64` 与 `string`，其他类型通过 `Value.Scan` 解码。

```go
timeout, err := config.Get[string](c, "server.http.timeout")
if err != nil {
	return err
}

database, err := config.Get[Database](c, "data.database")
if err != nil {
	return err
}
```

key 不存在时返回 `config.ErrNotFound`。这个函数用于补充完整配置树的
`Config.Scan`，自身不会加载 source，因此要先调用 `Load`。Source 顺序、环境变量
key、watcher 和生成配置类型见[配置](/zh-cn/docs/component/config/)。

## 可插入的 request 校验

在 v2 中，core `validate.Validator()` 只能调用 request 生成的 `Validate() error`
方法，并已被标记为弃用，建议改用独立 contrib middleware。v3 的 core middleware
仍支持该方法，同时可以接收任意数量的 `ValidatorFunc` callback。

```go
validator := validate.Validator(func(value any) error {
	message, ok := value.(proto.Message)
	if !ok {
		return nil
	}
	return protovalidate.Validate(message)
})

srv := http.NewServer(http.Middleware(validator))
```

Kratos 先调用 request 的 `Validate` 方法，再按参数顺序调用自定义 validator，并在
第一个 error 处停止。失败会转换为 reason 为 `VALIDATOR` 的 Bad Request，同时
保留 validator error 作为 cause。详见[校验](/zh-cn/docs/component/middleware/validate/)。

## slog handler 与 context attribute

切换到标准 `log/slog` 的同时，Kratos 增加了构造 text/JSON handler、过滤 record
和敏感 attribute，以及在 context 中携带 `slog.Attr` 的辅助方法。

```go
logger := log.NewLogger(log.NewHandler(
	log.WithFormat(log.JSONFormat),
	log.WithLevel(slog.LevelInfo),
	log.WithFilter(log.FilterKey("password")),
))

ctx = log.ContextWithAttrs(ctx,
	slog.String("request.id", requestID),
)
logger.InfoContext(ctx, "request completed")
```

使用带 context 的 slog 方法时，由 `log.NewHandler` 创建或经 `log.NewLogger` 包装的
handler 会加入这些 context attribute。设置与 filter 行为见
[日志](/zh-cn/docs/component/log/)。

## 分离 Go JSON 与 protobuf JSON

v3 在 core 中提供独立的 `encoding/protojson` codec。应按公开 contract 引入所需
codec，不再依赖同一个 `json` 名称根据 value type 切换行为。

```go
import (
	_ "github.com/go-kratos/kratos/v3/encoding/json"
	_ "github.com/go-kratos/kratos/v3/encoding/protojson"
)
```

`json` subtype 遵循 `encoding/json`，`protojson` subtype 遵循 protobuf JSON
语义。这会影响 protobuf field name、enum value、well-known type 和默认值输出。
修改现有 wire contract 前请阅读[编码与序列化](/zh-cn/docs/component/encoding/)。

## 错误能力补充

v3 增加 `errors.Join`，暴露 `errors.ErrUnsupported`，并新增表示 HTTP 429 的
`TooManyRequests`/`IsTooManyRequests`。

```go
combined := errors.Join(cacheErr, databaseErr)

if errors.Is(combined, databaseErr) {
	// At least one joined error matches.
}

return errors.TooManyRequests("RATE_LIMITED", "try again later")
```

`Join` 会去掉 nil，并把每个非 nil error 保留在 error tree 中，因此 `errors.Is`
与 `errors.As` 可以检查全部错误。429 helper 应使用稳定 reason 和可安全返回给
client 的 message。Transport 映射和 cause 处理见
[错误处理](/zh-cn/docs/component/errors/)。

## 按需采用

先完成编译和重新生成所必需的修改，再按 API contract 采用新功能。HTTP streaming
会改变网络协议和运维行为；JSON 选择可能改变 response byte；validation 可能拒绝
此前接受的 request。应通过 HTTP/gRPC contract test 覆盖这些选择，并一起部署
兼容的 producer 与 consumer。

必需的破坏性变更和升级顺序见[从 v2 迁移到
v3](/zh-cn/docs/migration/v2-to-v3/)。
