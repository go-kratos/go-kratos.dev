---
title: "构建生成式智能体"
---

# 同步调用

本节介绍如何使用 Blades 的同步模式运行一个 Agent：调用 runner.Run(...) 后阻塞等待，直到模型生成完整回复并一次性返回 Message。

**适用场景**
- 你希望一次拿到完整答案（适合：API 响应、批处理、单轮问答）
- 不需要流式输出（如终端流式打印、Websocket、SSE 等）

### 创建智能体

在 Blades 中，想要创建一个智能体，使用 **NewAgent** 方法，该方法用于创建一个新的Agent实例。**Agent** 是 Blades 框架中的核心组件，负责协调模型、工具、提示词等资源来执行各种AI任务。

该方法使用示例如下：

```go
// Configure OpenAI API key and base URL using environment variables:
model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
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
