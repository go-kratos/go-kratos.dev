---
title: "Gemini"
---
:::note
Blades AI Agent 框架的 Google Gemini 模型提供程序，支持 GenAI 和 Vertex AI 部署。
:::
## 安装
```bash
go get github.com/go-kratos/blades/contrib/gemini
```
## 特性
:::tip
- **统一客户端**: 用于 GenAI SDK 的单个 `NewClient` 函数
- **思考模型**: 支持具有可配置推理预算的思考模型
- **工具调用**: 通过迭代工作流自动执行工具
- **流式传输**: 具有工具调用处理的实时响应流式传输
- **多模态**: 支持文本、图像和其他模态
:::
## 用法
### 基本示例
```go
import (
	"context"
	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/gemini"
	"google.golang.org/genai"
)

// Create client with GenAI configuration
clientConfig := &genai.ClientConfig{
	APIKey:  "your-api-key",
	Backend: genai.BackendGoogleAI,
}

client, err := gemini.NewClient(context.Background(), clientConfig)
if err != nil {
	panic(err)
}

// Generate response
req := &blades.ModelRequest{
	Model: "gemini-2.0-flash-exp",
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
for _, msg := range resp.Messages {
	for _, part := range msg.Parts {
		if textPart, ok := part.(blades.TextPart); ok {
			fmt.Println(textPart.Text)
		}
	}
}
```
### Vertex AI
```go
import (
	"cloud.google.com/go/auth"
	"google.golang.org/genai"
)

// Create client with Vertex AI
creds, err := auth.Detect(context.Background(), &auth.DetectOptions{
	// Configure auth options
})
if err != nil {
	panic(err)
}

clientConfig := &genai.ClientConfig{
	Backend:  genai.BackendVertexAI,
	Project:  "my-project-id",
	Location: "us-central1",
	Credentials: creds.TokenProvider(),
}

client, err := gemini.NewClient(context.Background(), clientConfig)
// Use same request/response pattern as above
```
## 思考模型
:::note
使用思考模型启用 Gemini 的推理能力：
:::
```go
import "github.com/go-kratos/blades"

// Configure thinking budget
thinkingBudget := int32(10000) // 10K tokens for reasoning
includeThoughts := true

resp, err := client.Generate(context.Background(), req,
	blades.WithThinkingBudget(&thinkingBudget),
	blades.WithIncludeThoughts(&includeThoughts),
)

// The response will include thinking blocks showing the model's reasoning process
for _, msg := range resp.Messages {
	for _, part := range msg.Parts {
		if textPart, ok := part.(blades.TextPart); ok {
			fmt.Println(textPart.Text)
		}
	}
}
```
## 模型选项
```go
resp, err := client.Generate(context.Background(), req,
	blades.WithMaxOutputTokens(4096),
	blades.WithTemperature(0.7),
	blades.WithTopP(0.9),
	blades.WithMaxIterations(5), // Tool calling iterations
)
```
## 工具调用
:::note
定义工具并让 Gemini 自动执行它们：
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
	Model: "gemini-2.0-flash-exp",
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

// Gemini will automatically:
// 1. Call the tool if needed
// 2. Process the tool result
// 3. Return the final response
```
## 流式传输
:::note
实时流式传输响应：
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
## 错误处理
:::note
该提供程序返回针对常见问题的特定错误：
:::
```go
import "github.com/go-kratos/blades/contrib/gemini"

resp, err := client.Generate(ctx, req)
if err != nil {
	switch err {
	case gemini.ErrEmptyResponse:
		// Handle empty response
	case gemini.ErrToolNotFound:
		// Handle missing tool
	case gemini.ErrTooManyIterations:
		// Handle iteration limit
	default:
		// Handle other errors
	}
}
```
## 模型
:::tip
可用模型：
- `gemini-2.0-flash-exp` - 最新的实验模型
- `gemini-2.0-flash-thinking-exp-01-21` - 具有扩展推理的思考模型
- `gemini-1.5-pro` - 上一代专业模型
- `gemini-1.5-flash` - 上一代快速模型
:::
