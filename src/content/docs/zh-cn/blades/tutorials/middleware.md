---
title: "中间件"
---
在 Blades 框架中，中间件是一种强大的机制，用于实现横切关注点（如日志、监控、认证、限流等）。它的设计允许在 **Runnable** 的执行流程中注入额外行为，而无需修改核心逻辑。中间件以"洋葱模型"的函数链形式工作，提供了高度灵活的流程控制和功能增强。在本文档中将指导完成一个简单的日志中间件实现示例。

## Handler
Handler 是一个处理 graph 状态的函数，它接收上下文和当前状态，并返回新的状态和可能的错误。
:::note
**Handler**不应该修改传入的状态，而应该返回一个新的状态实例。
:::
```go
type Handler interface {
	Handle(context.Context, *Invocation) Generator[*Message, error]
}
```
## 中间件
中间件定义如下：
```go
type Middleware func(Handler) Handler
```
Middleware 是一个函数，它接受一个 **Handler** 作为参数，并返回一个 **Handler**。创建Middleware示例如下所示：
```go
func createLogMiddleware() blades.Middleware {
	// blades.Middleware is a function type , you can omit the wrapper.
	return func(next blades.Handler) blades.Handler {
		// `blades.Handler` is a interface，we need use `blades.HandleFunc` to implement it.
		return blades.HandleFunc(func(ctx context.Context, req *blades.Invocation) blades.Generator[*blades.Message, error] {
			log.Println("----🚀--- Incoming request ----🚀---")
			log.Println("Request:", req)
			gen := next.Handle(ctx, req)
			log.Println("Response:", gen)
			return gen
		})
	}
}
```
:::note
在创建时，`Handler`为函数类型**HandleFunc**的方法接口，因此需要使用返回对应的实现方法。
:::
## 中间件链
中间件链 将多个中间件组合成一个中间件，这个新中间件在被调用的时候会一次应用所有传入的中间件。中间件链的定义如下：
```go
func ChainMiddlewares(mws ...Middleware) Middleware {
	return func(next Handler) Handler {
		h := next
		for i := len(mws) - 1; i >= 0; i-- { // apply in reverse to make mws[0] outermost
			h = mws[i](h)
		}
		return h
	}
}
```
在blades中，创建中间件链如下所示：
```go
```
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
