---
title: "中间件"
---
在 Blades 框架中，中间件是一种强大的机制，用于实现横切关注点（如日志、监控、认证、限流等）。它的设计允许在 **Runnable** 的执行流程中注入额外行为，而无需修改核心逻辑。中间件以"洋葱模型"的函数链形式工作，提供了高度灵活的流程控制和功能增强。在本文档中将指导完成一个简单的日志中间件实现示例。

## 代码示例
:::tip
在本示例运行之前请检查 APIKEY 是否设置。
:::


### 1. 创建中间件

```go
// LoggingMiddleware is a middleware that logs execution time and details of agent runs.
type LoggingMiddleware struct {
    next blades.Runnable
}

// LogMiddleware returns a Middleware that logs execution details of agent runs.
func LogMiddleware() blades.Middleware {
    return func(next blades.Runnable) blades.Runnable {
        return &LoggingMiddleware{next: next}
    }
}
// Run processes the prompt and logs execution details before and after invoking the next runnable.
func (m *LoggingMiddleware) Run(ctx context.Context, prompt *blades.Prompt, opts ...blades.ModelOption) (*blades.Message, error) {
    // Pre-processing: Log before execution
    start := time.Now()
    log.Printf("[LOGGING MIDDLEWARE] Starting agent execution at %v", start)
    
    // Execute the next runnable in the chain
    result, err := m.next.Run(ctx, prompt, opts...)
    
    // Post-processing: Log after execution
    duration := time.Since(start)
    log.Printf("[LOGGING MIDDLEWARE] Agent execution completed in %v with error: %v", duration, err)
    
    return result, err
}
```


### 2. 使用中间件
:::tip
要在 Agent 中使用中间件，只需在创建 Agent 时通过 WithMiddleware 选项传入。
:::
```go
// Create a blades agent with logging middleware
agent := blades.NewAgent(
    "Example Agent",
    blades.WithModel("gpt-4"),
    blades.WithInstructions("You are a helpful assistant."),
    blades.WithProvider(openai.NewChatProvider()),
    // Apply the logging middleware
    blades.WithMiddleware(LogMiddleware()),
)

// Create a prompt
prompt := blades.NewPrompt(
    blades.UserMessage("What is the capital of France?"),
)

// Run the agent
result, err := agent.Run(context.Background(), prompt)
if err != nil {
    log.Fatal(err)
}

log.Println("Agent response:", result.Text())

```
## 中间件链
:::tip
可以将多个中间件链接在一起，它们将按照指定的顺序执行。
:::
```go
// Chain multiple middlewares together
agent := blades.NewAgent(
    "Chained Middleware Agent",
    blades.WithModel("gpt-4"),
    blades.WithProvider(openai.NewChatProvider()),
    blades.WithMiddleware(
        LogMiddleware(),           // Outermost middleware
        Tracing(),                 // Middle middleware
        ValidationMiddleware(),    // Innermost middleware
    ),
)
```
:::tip
中间件的执行顺序遵循洋葱模型：
- 请求从外到内依次经过所有中间件的前置处理逻辑
- 到达核心处理逻辑（Agent）
- 响应从内到外依次经过所有中间件的后置处理逻辑
:::
这种设计使得中间件可以方便地添加各种功能，同时保持代码的清晰和可维护性。
