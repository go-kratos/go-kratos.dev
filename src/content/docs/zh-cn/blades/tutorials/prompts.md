---
title: "提示语"
---
在 Blades 框架中，Prompt 是与大型语言模型（LLM）交互的核心组件。它表示用户与助手之间交换的消息序列，支持多种类型的消息（系统消息、用户消息、助手消息）以及模板化功能，使开发者能够构建动态和上下文感知的 AI 应用程序。

## Prompt 结构
Prompt 是一个包含多个消息的消息序列容器。
```go
type Prompt struct {
    Messages []*Message `json:"messages"`
}
```
### Message类型
Blades 支持多种消息类型，每种都有特定的角色：
- RoleUser: 表示最终用户的输入
- RoleSystem: 提供系统级别的指令和上下文
- RoleAssistant: 表示模型的输出
- RoleTool: 表示由工具生成的消息
## 基本用法
最基本的 Prompt 创建方式是直接指定消息内容：
```go
prompt := blades.NewPrompt(
    blades.UserMessage("What is the capital of France?"),
)
```
### 带有系统指令的Prompt
可以通过添加系统消息来为模型提供上下文和指令：
```go
prompt := blades.NewPrompt(
    blades.SystemMessage("You are a helpful assistant that provides detailed and accurate information."),
    blades.UserMessage("What is the capital of France?"),
)
```
### Prompt 模板化
Blades 提供了强大的模板功能，允许动态生成 Prompt 内容。使用 PromptTemplate 构建器可以创建带有变量的模板化 Prompt：
```go
params := map[string]any{
    "topic":    "The Future of Artificial Intelligence",
    "audience": "General reader",
}

prompt, err := blades.NewPromptTemplate().
    System("Please summarize {{.topic}} in three key points.", params).
    User("Respond concisely and accurately for a {{.audience}} audience.", params).
    Build()
if err != nil {
    log.Fatal(err)
}
```
#### 带有 Session 上下文的模板
```go
// Create a new session
session := blades.NewSession("conversation_123", map[string]any{
    "style": "robot",
})

ctx := blades.NewSessionContext(context.Background(), session)

// 在模板中使用 session 变量
prompt, err := blades.NewPromptTemplate().
    System("Respond as a {{.style}}.", nil).
    User("Tell me a joke.", nil).
    BuildContext(ctx)
```
## 进阶功能
Blades的Prompt还支持多种功能，如多部分消息和流式处理等。
### 多部分消息
Blades 支持包含多种内容类型的消息，包括文本、文件引用和二进制数据：
```go
message := blades.UserMessage(
    blades.TextPart{Text: "Analyze this image:"},
    blades.FilePart{
        Name:     "chart.png",
        URI:      "file:///path/to/chart.png",
        MIMEType: "image/png",
    },
)
```
### 流式处理
Prompt 可以与流式处理结合使用，实现实时响应：
```go
stream, err := agent.RunStream(context.Background(), prompt)
if err != nil {
    log.Fatal(err)
}
defer stream.Close()

for stream.Next() {
    message, err := stream.Current()
    if err != nil {
        log.Printf("Error: %v", err)
        continue
    }
    fmt.Print(message.Text())
}
```
### 最佳实践
- 明确系统指令: 在系统消息中提供清晰、具体的指令，有助于模型更好地理解任务要求。
- 合理使用模板: 利用模板功能可以提高代码复用性和可维护性，特别是在需要动态生成 Prompt 的场景中。
- 管理上下文长度: 注意控制 Prompt 的长度，避免超出模型的最大上下文限制。
- 错误处理: 始终检查模板渲染和 Prompt 构建过程中的错误，确保应用程序的健壮性。
## 基础示例
```go
package main

import (
    "context"
    "log"

    "github.com/go-kratos/blades"
    "github.com/go-kratos/blades/contrib/openai"
)

func main() {
    agent := blades.NewAgent(
        "Basic Agent",
        blades.WithModel("gpt-5"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions("You are a helpful assistant that provides detailed and accurate information."),
    )
    
    prompt := blades.NewPrompt(
        blades.UserMessage("What is the capital of France?"),
    )
    
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }
    
    log.Println(result.Text())
}
```
## 模板化示例
```go
package main

import (
    "context"
    "log"

    "github.com/go-kratos/blades"
    "github.com/go-kratos/blades/contrib/openai"
)

func main() {
    agent := blades.NewAgent(
        "Template Agent",
        blades.WithModel("gpt-5"),
        blades.WithProvider(openai.NewChatProvider()),
    )

    // Define templates and params
    params := map[string]any{
        "topic":    "The Future of Artificial Intelligence",
        "audience": "General reader",
    }

    // Build prompt using the template builder
    prompt, err := blades.NewPromptTemplate().
        System("Please summarize {{.topic}} in three key points.", params).
        User("Respond concisely and accurately for a {{.audience}} audience.", params).
        Build()
    if err != nil {
        log.Fatal(err)
    }

    log.Println("Generated Prompt:", prompt.String())

    // Run the agent with the templated prompt
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }
    
    log.Println(result.Text())
}
```
