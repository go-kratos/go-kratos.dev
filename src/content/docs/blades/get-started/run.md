---
title: "Building Generative Agents"
---

# Building Generative Agents

This section explains how to run an Agent using Blades' synchronous mode: after calling runner.Run(...), it blocks and waits until the model generates a complete response and returns the Message all at once.

**Applicable Scenarios**
- You want to receive the complete answer in one go (suitable for: API responses, batch processing, single-turn Q&A)
- Streaming output is not required (e.g., terminal streaming, Websocket, SSE, etc.)

### Creating an Agent (Synchronous Call)

In Blades, to create an agent, use the **NewAgent** method, which is used to create a new Agent instance. **Agent** is the core component in the Blades framework, responsible for coordinating resources such as models, tools, prompts, etc., to execute various AI tasks.

An example usage of this method is as follows:

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