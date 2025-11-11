---
title: "构建生成式智能体"
---
# 同步调用
使用Blades同步调用让Agent一次返回完整回答。

    行为：同步调用Run发送请求后阻塞等待，直到模型生成完整回复，一次性返回结果。
    返回值：一个完整的Message对象
## 代码示例
前置条件
1. 安装Blades：`go get github.com/go-kratos/blades`
2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`

### 创建智能体
在 Blades 中，想要创建一个智能体，使用 **NewAgent** 方法，该方法用于创建一个新的Agent实例。**Agent** 是 Blades 框架中的核心组件，负责协调模型、工具、提示词等资源来执行各种AI任务。
NewAgent 有两个参数，如下：
1. **`name`(string, 必需)**:表示Agent的名称，用于识别不同的 Agent 实例。
2. **`opts`(Options, 可选)**:用于配置Agent实例的选项。支持的配置选项包括：
    - **`WithProvider(provider ModelProvider)`**:设置模型提供者，如 OpenAI、Claude 和 Gemini 等。
    - **`WithModel(models string)`**:设置默认模型名称。（如 "deepseek-chat"）
    - **`WithTools(tools ...tools.Tool)`**: 为 Agent 添加可用的工具
    - **`WithInstructions(instructions string)`**: 设置 Agent 的系统指令/角色设定
    - **`WithInputSchema(schema *jsonschema.Schema)`**: 设置输入的格式
    - **`WithOutputSchema(schema *jsonschema.Schema)`**: 设置输出的格式

该方法使用示例如下：
```go
agent := blades.NewAgent(
    "Weather Agent",
    blades.WithModel("deepseek-chat"),
    blades.WithInstructions("You are a helpful assistant that provides weather information."),
    blades.WithProvider(openai.NewChatProvider()),
    blades.WithTools(weatherTool),
)
// Run the agent
runner := blades.NewRunner(agent)
input := blades.UserMessage("what is the weather like in Shanghai today?")
output, err := runner.Run(context.Background(), input)
if err != nil {
    log.Fatal(err)
}
log.Println(output.Text())
```
### Run
runner.Run 是 Blades 框架中 Agent 的核心执行方法，用于运行一次完整的 AI 交互流程。该方法会根据提供的提示词（Prompt）与配置的模型进行交互，并返回模型的响应结果。该方法参数如下：
1. **`ctx (context.Context)`**:上下文参数，用于控制请求的生命周期，可用于设置超时、取消等操作。
2. **`prompt (Prompt)`**:提示词对象，包含用户输入的信息，可以通过 blades.NewPrompt() 或 blades.NewPromptTemplate() 创建。
3. **`opts (...ModelOption)`**:可变的模型选项参数，用于在运行时覆盖 Agent 的默认配置。

该方法使用示例如下：
```go
package main

import (
	"context"
	"log"
	"strings"
	"text/template"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

// buildPrompt builds a prompt using text/template with the given parameters.
func buildPrompt(params map[string]any) (string, error) {
	var (
		text = "Respond concisely and accurately for a {{.audience}} audience."
		buf  strings.Builder
	)
	t, err := template.New("message").Parse(text)
	if err != nil {
		return "", err
	}
	if err := t.Execute(&buf, params); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func main() {
	agent, err := blades.NewAgent(
		"Template Agent",
		blades.WithModel("gpt-5"),
		blades.WithProvider(openai.NewChatProvider()),
		blades.WithInstructions("Please summarize {{.topic}} in three key points."),
	)
	if err != nil {
		log.Fatal(err)
	}
	// Define templates and params
	state := map[string]any{
		"topic":    "The Future of Artificial Intelligence",
		"audience": "General reader",
	}
	// Build prompt using the template builder
	// Note: Use exported methods when calling from another package.
	prompt, err := buildPrompt(state)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage(prompt)
	// Run the agent with the templated prompt
	session := blades.NewSession(state)
	runner := blades.NewRunner(agent, blades.WithSession(session))
	output, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```
