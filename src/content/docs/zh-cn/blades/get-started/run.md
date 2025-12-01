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
2. **`options`(Options, 可选)**:用于配置Agent实例的选项。支持的配置选项包括：
   - **`WithModel(model ModelProvider)`**:设置模型提供者，如 OpenAI、Claude 和 Gemini 等。
   - **`WithTools(tools ...tools.Tool)`**: 为 Agent 添加可用的工具
   - **`WithInstruction(instructions string)`**: 设置 Agent 的系统指令/角色设定
   - **`WithInputSchema(schema *jsonschema.Schema)`**: 设置输入的格式
   - **`WithOutputSchema(schema *jsonschema.Schema)`**: 设置输出的格式

该方法使用示例如下：

```go
// Configure OpenAI API key and base URL using environment variables:
model := openai.NewModel("gpt-5", openai.Config{
	APIKey: os.Getenv("OPENAI_API_KEY"),
})
agent, err := blades.NewAgent(
    "Weather Agent",
    blades.WithModel(model),
    blades.WithInstruction("You are a helpful assistant that provides weather information."),
    blades.WithTools(weatherTool),
)
if err != nil {
    log.Fatal(err)
}
// Run the agent
input := blades.UserMessage("what is the weather like in Shanghai today?")
runner := blades.NewRunner(agent)
output, err := runner.Run(context.Background(), input)
if err != nil {
    log.Fatal(err)
}
log.Println(output.Text())
```

### Run

runner.Run 是 Blades 框架中 Agent 的核心执行方法，用于运行一次完整的 AI 交互流程。该方法会根据提供的提示词（Prompt）与配置的模型进行交互，并返回模型的响应结果。该方法参数如下：

1. **`ctx (context.Context)`**: 上下文参数，用于控制请求的生命周期，可用于设置超时、取消等操作。
2. **`input (Message)`**: 提示词对象，包含用户输入的信息，可以通过 blades.UserMessage("user prompt") 进行创建。
