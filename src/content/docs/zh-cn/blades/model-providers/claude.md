---
title: "Claude"
---
:::note
Blades AI Agent 框架的 Anthropic Claude 模型提供器，支持 Direct API、AWS Bedrock 和 Google Vertex AI。
:::
## 安装
```bash
go get github.com/go-kratos/blades/contrib/claude
```
## 特性
:::note
- **统一客户端**：通过单一 NewClient 函数支持多种部署渠道
- **扩展推理（Extended Thinking）**：支持 Beta 推理模型，并可配置 token 预算
- **工具调用**：自动执行工具并支持迭代工作流
- **流式响应**：支持实时流式响应，包含工具调用处理
- **多渠道支持**：支持 Direct API、AWS Bedrock 和 Google Vertex AI
:::
## 使用方法
### Direct API（Anthropic）
```go
import (
	"context"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/claude"
)

// Create client with API key
client := claude.NewClient(
	option.WithAPIKey("sk-ant-..."),
)

// Generate response
req := &blades.ModelRequest{
	Model: "claude-3-5-sonnet-20241022",
	Messages: []*blades.Message{
		{
			Role: blades.RoleUser,
			Parts: []blades.Part{
				blades.TextPart{Text: "What is the capital of France?"},
			},
		},
	},
}

resp, err := client.Generate(context.Background(), req)
if err != nil {
	panic(err)
}

// Access response
import (
	"github.com/anthropics/anthropic-sdk-go/option/bedrock"
	"github.com/go-kratos/blades/contrib/claude"
)

// Create client with AWS Bedrock
client := claude.NewClient(
	bedrock.WithLoadDefaultConfig(context.Background()),
)

// Use same request/response pattern as above
```
### AWS Bedrock
```go
import (
	"github.com/anthropics/anthropic-sdk-go/option/bedrock"
	"github.com/go-kratos/blades/contrib/claude"
)

// Create client with AWS Bedrock
client := claude.NewClient(
	bedrock.WithLoadDefaultConfig(context.Background()),
)

// Use same request/response pattern as above
```
### Google Vertex AI
```go
import (
	"github.com/anthropics/anthropic-sdk-go/option/vertex"
	"github.com/go-kratos/blades/contrib/claude"
)

// Create client with Google Vertex AI
client := claude.NewClient(
	vertex.WithGoogleAuth(
		context.Background(),
		"us-central1",      // region
		"my-project-id",    // projectID
	),
)

// Use same request/response pattern as above
```
### 扩展推理（Extended Thinking）
:::note
通过标准 API 启用 Claude 的推理能力：
:::
```go
import "github.com/go-kratos/blades"

// Configure thinking budget
thinkingBudget := int32(10000) // 10K tokens for reasoning

resp, err := client.Generate(context.Background(), req,
	blades.WithThinkingBudget(&thinkingBudget),
)

// The response will include thinking blocks showing Claude's reasoning process
// Access thinking content from the response messages
for _, msg := range resp.Messages {
	for _, part := range msg.Parts {
		if textPart, ok := part.(blades.TextPart); ok {
			fmt.Println(textPart.Text)
		}
	}
}
```
### 模型选项

```go
resp, err := client.Generate(context.Background(), req,
	blades.WithMaxOutputTokens(4096),
	blades.WithTemperature(0.7),
	blades.WithTopP(0.9),
	blades.WithMaxIterations(5), // Tool calling iterations
)
```
### 工具调用
:::note
定义工具并让 Claude 自动执行：
:::
```go
// Define a tool
weatherTool := &blades.Tool{
	Name:        "get_weather",
	Description: "Get current weather for a location",
	Handle: func(ctx context.Context, arguments string) (string, error) {
		// Parse arguments and fetch weather
		return `{"temperature": 72, "condition": "sunny"}`, nil
	},
}

// Add tools to request
req := &blades.ModelRequest{
	Model: "claude-3-5-sonnet-20241022",
	Tools: []*blades.Tool{weatherTool},
	Messages: []*blades.Message{
		{
			Role: blades.RoleUser,
			Parts: []blades.Part{
				blades.TextPart{Text: "What's the weather in San Francisco?"},
			},
		},
	},
}

// Generate with automatic tool execution
resp, err := client.Generate(context.Background(), req)

// Claude will automatically:
// 1. Call the tool if needed
// 2. Process the tool result
// 3. Return the final response
```
### 流式响应
:::note
实时流式输出响应内容：
:::
```go
stream, err := client.NewStream(context.Background(), req)
if err != nil {
	panic(err)
}

for stream.Next() {
	resp, err := stream.Current()
	if err != nil {
		panic(err)
	}

	for _, msg := range resp.Messages {
		for _, part := range msg.Parts {
			if textPart, ok := part.(blades.TextPart); ok {
				fmt.Print(textPart.Text) // Print as it streams
			}
		}
	}
}

if err := stream.Err(); err != nil {
	panic(err)
}
```
### 错误处理
:::note
该提供器针对常见问题返回特定错误：
:::
```go
import "github.com/go-kratos/blades/contrib/claude"

resp, err := client.Generate(ctx, req)
if err != nil {
	switch err {
	case claude.ErrEmptyResponse:
		// Handle empty response
	case claude.ErrToolNotFound:
		// Handle missing tool
	case claude.ErrTooManyIterations:
		// Handle iteration limit
	default:
		// Handle other errors
	}
}
```
### 支持的模型
:::note
可用模型包括：
- **claude-3-5-sonnet-20241022** - 最智能的模型
- **claude-3-5-haiku-20241022** - 最快的模型
- **claude-3-opus-20240229** - 上一代模型
- **claude-sonnet-4-20250514** - 支持扩展推理的模型（需配合 WithThinkingBudget 使用）
:::