---
title: "Middleware"
---
In the Blades framework, middleware is a powerful mechanism for implementing cross-cutting concerns (such as logging, monitoring, authentication, rate limiting, etc.). Its design allows injecting additional behavior into the execution flow of a **Runnable** without modifying the core logic. Middleware operates in a function chain following the "onion model," providing highly flexible flow control and feature enhancement. This document will guide you through a simple example of implementing a logging middleware.

## Code Example
Before running this example, please check if the APIKEY is set.

### 1. Create Middleware

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


### 2. Using Middleware
To use middleware in an Agent, simply pass it via the WithMiddleware option when creating the Agent.
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
## Middleware Chain
You can chain multiple middlewares together, and they will execute in the specified order.
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
The execution order of middleware follows the onion model:
- The request passes through the pre-processing logic of all middlewares from outermost to innermost
- Reaches the core processing logic (Agent)
- The response passes through the post-processing logic of all middlewares from innermost to outermost
:::
This design allows middleware to conveniently add various functionalities while maintaining code clarity and maintainability.
