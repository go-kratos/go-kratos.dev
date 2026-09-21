---
id: errors
title: 错误处理
description: Kratos v3 的应用错误、状态映射和错误原因。
---

`github.com/go-kratos/kratos/v3/errors` 使用 HTTP 状态码、稳定原因码、面向用户的消息和可选 metadata 表示应用错误。HTTP 和 gRPC transport 通过 `GRPCStatus` 转换该错误；gRPC detail 使用 `google.rpc.ErrorInfo`。

## 创建错误

```go
import "github.com/go-kratos/kratos/v3/errors"

notFound := errors.NotFound("USER_NOT_FOUND", "user does not exist")
invalid := errors.BadRequest("INVALID_ID", "user ID is invalid")
failed := errors.New(500, "DATABASE", "request failed")
formatted := errors.Newf(500, "DATABASE", "query %s failed", query)
```

状态 helper 覆盖 400、401、403、404、409、429、499、500、503 和 504。原因码应稳定以供程序判断，消息应可安全地返回给客户端。

## 添加上下文

`WithCause` 与 `WithMetadata` 返回克隆后的错误，根因仍保留在 Go 错误链中。

```go
err := errors.InternalServer("DATABASE", "request failed").
	WithCause(databaseErr).
	WithMetadata(map[string]string{"request_id": requestID})
```

不要将凭据或内部细节写入消息和 metadata。

## 判断错误

`Code`、`Reason` 与 `FromError` 都支持被包装的错误。`errors.Is` 根据 Kratos 错误的 code 和 reason 比较。

```go
if errors.Is(err, errors.NotFound("USER_NOT_FOUND", "")) {
	// Handle the missing user.
}

statusCode := errors.Code(err)
reason := errors.Reason(err)
statusError := errors.FromError(err)
```

`FromError` 将非 Kratos 错误转换为内部服务错误，或将 gRPC status 映射为 HTTP 表示。

## 按层传播错误

repository 和外部 client 的错误属于实现细节。通过 `WithCause` 保留根因，在 biz 或 service 边界返回稳定的 Kratos 错误。transport 会转换这个公开错误，HTTP handler 或 gRPC method 无需手工编码。

```go
user, err := repo.Find(ctx, id)
if err != nil {
	if stderrors.Is(err, sql.ErrNoRows) {
		return nil, errors.NotFound("USER_NOT_FOUND", "user does not exist")
	}
	return nil, errors.InternalServer("DATABASE", "request failed").WithCause(err)
}
```

普通 Go 根因使用 `stderrors.Is` 与 `stderrors.As`；公开错误 contract 驱动判断时使用 Kratos 的 `errors.Is`、`Code`、`Reason`。不要比较消息字符串。

## 合并与克隆错误

`errors.Join` 用于调用方必须保留多个失败时合并错误。为包级错误定义添加 metadata 前可使用 `Clone`。通常应在能作出公开决策的边界创建或补充错误。

## API reason enum

项目模板定义 Protobuf `ErrorReason` enum，并用生成的字符串值构造错误。当前
`make api` 通过 `protoc-gen-go` 生成 enum，没有配置 `protoc-gen-go-errors`。
选择单独错误生成器的项目，需要把它加入自己的 Buf 生成配置并提交生成产物。

升级已有 binding 时请参阅
[从 v2 迁移到 v3](/zh-cn/docs/migration/v2-to-v3/)。
