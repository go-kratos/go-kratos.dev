---
title: "中间件"
---
在 Blades 框架中，中间件是一种强大的机制，用于实现横切关注点（如日志、监控、认证、限流等）。它的设计允许在 **Agent** 的执行流程中注入额外行为，而无需修改核心逻辑。中间件以"洋葱模型"的函数链形式工作，提供了高度灵活的流程控制和功能增强。在本文档中将指导完成一个简单的日志中间件实现示例。

## 中间件
中间件定义如下：
```go
type Handler interface {
	Handle(context.Context, *Invocation) Generator[*Message, error]
}
type Middleware func(Handler) Handler
```

Middleware 是一个函数，它接受一个 **Handler** 作为参数，并返回一个 **Handler**。创建Middleware示例如下所示：
```go
func Logging() blades.Middleware {
	return func(next blades.Handler) blades.Handler {
		// `blades.Handler` is a interface，we need use `blades.HandleFunc` to implement it.
		return blades.HandleFunc(func(ctx context.Context, req *blades.Invocation) blades.Generator[*blades.Message, error] {
			log.Println("----🚀--- Incoming request ----🚀---")
			log.Println("Request:", req.Message)
			return next.Handle(ctx, req)
		})
	}
}
```
:::note
在创建时，`Handler`为函数类型 **HandleFunc** 的方法接口，因此需要使用返回对应的实现方法。
:::

## 代码示例
:::tip
在本示例运行之前请检查 APIKEY 是否设置。
:::

### 1. 创建中间件

```go
type Logging struct {
	next blades.Handler
}

// NewLogging creates a new Logging middleware.
func NewLogging(next blades.Handler) blades.Handler {
	return &Logging{next}
}

func (m *Logging) onError(start time.Time, agent blades.AgentContext, invocation *blades.Invocation, err error) {
	log.Printf("logging: model(%s) prompt(%s) failed after %s: %v", agent.Model(), invocation.Message.String(), time.Since(start), err)
}

func (m *Logging) onSuccess(start time.Time, agent blades.AgentContext, invocation *blades.Invocation, output *blades.Message) {
	log.Printf("logging: model(%s) prompt(%s) succeeded after %s: %s", agent.Model(), invocation.Message.String(), time.Since(start), output.String())
}

func (m *Logging) Handle(ctx context.Context, invocation *blades.Invocation) blades.Generator[*blades.Message, error] {
	return func(yield func(*blades.Message, error) bool) {
		start := time.Now()
		agent, ok := blades.FromAgentContext(ctx)
		if !ok {
			yield(nil, blades.ErrNoAgentContext)
			return
		}
		streaming := m.next.Handle(ctx, invocation)
		for msg, err := range streaming {
			if err != nil {
				m.onError(start, agent, invocation, err)
			} else {
				m.onSuccess(start, agent, invocation, msg)
			}
			if !yield(msg, err) {
				break
			}
		}
	}
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
    blades.WithModel("gpt-5"),
    blades.WithInstructions("You are a helpful assistant."),
    blades.WithProvider(openai.NewChatProvider()),
    blades.WithMiddleware(Logging()), // Use the logging middleware
)
// Create a prompt
input := blades.UserMessage("What is the capital of France?")
// Run the agent
output, err := agent.Run(context.Background(), input)
if err != nil {
    log.Fatal(err)
}

log.Println(output.Text())
```

## 中间件链
:::tip
可以将多个中间件链接在一起，它们将按照指定的顺序执行。
:::
```go
// Create multiple middlewares
agent := blades.NewAgent(
    "Chained Middleware Agent",
    blades.WithModel("gpt-5"),
    blades.WithProvider(openai.NewChatProvider()),
    // Chain multiple middlewares
    blades.WithMiddleware(
        Logging(),
        Tracing(),
        Metrics(),
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
