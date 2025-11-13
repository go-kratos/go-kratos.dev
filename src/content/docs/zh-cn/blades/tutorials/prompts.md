---
title: "提示词"
---
在 Blades 框架中，Prompt 是与大型语言模型（LLM）交互的核心组件。它表示用户与助手之间交换的消息序列，支持多种类型的消息（系统消息、用户消息、助手消息）以及模板化功能，使开发者能够构建动态和上下文感知的 AI 应用程序。

### Message类型
Blades 支持多种消息类型，每种都有特定的角色：
- RoleUser: 表示最终用户的输入
- RoleSystem: 提供系统级别的指令和上下文
- RoleAssistant: 表示模型的输出
- RoleTool: 表示由工具生成的消息

## 用户提示词
最基本的 Prompt 创建方式是直接指定消息内容：
```go
input := blades.UserMessage("What is the capital of France?")
```

### 系统指令提示词
可以通过 Agent 进行定义系统指令信息：
```go
agent, err := blades.NewAgent(
	"Basic Agent",
	blades.WithModel("gpt-5"),
	blades.WithProvider(openai.NewChatProvider()),
	blades.WithInstructions("You are a helpful assistant that provides detailed and accurate information."),
)
```

#### 带有 Session 上下文的模板
```go
agent, err := blades.NewAgent(
	"Instructions Agent",
	blades.WithModel("gpt-5"),
	blades.WithProvider(openai.NewChatProvider()),
	blades.WithInstructions("Respond as a {{.style}}."),
)
if err != nil {
	log.Fatal(err)
}
// Create a new session
session := blades.NewSession(map[string]any{
	"style": "robot",
})
input := blades.UserMessage("Tell me a joke.")
// Run the agent with the prompt and session context
runner := blades.NewRunner(agent, blades.WithSession(session))
ctx := context.Background()
message, err := runner.Run(ctx, input)
if err != nil {
	panic(err)
}
log.Println(session.State())
log.Println(message.Text())
```

### 最佳实践
- 明确系统指令: 在系统消息中提供清晰、具体的指令，有助于模型更好地理解任务要求。
- 合理使用模板: 利用模板功能可以提高代码复用性和可维护性，特别是在需要动态生成 Prompt 的场景中。
- 管理上下文长度: 注意控制 Prompt 的长度，避免超出模型的最大上下文限制。
- 错误处理: 始终检查模板渲染和 Prompt 构建过程中的错误，确保应用程序的健壮性。
