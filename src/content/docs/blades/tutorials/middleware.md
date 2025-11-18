---
title: "Middleware"
---
In the Blades framework, middleware is a powerful mechanism for implementing cross-cutting concerns (such as logging, monitoring, authentication, rate limiting, etc.). Its design allows injecting additional behavior into the **Agent**'s execution flow without modifying the core logic. Middleware works in the form of a function chain following the "onion model," providing highly flexible flow control and functional enhancement. This document will guide you through a simple example of implementing a logging middleware.

## Middleware
Middleware is defined as follows:
```go
type Handler interface {
	Handle(context.Context, *Invocation) Generator[*Message, error]
}
type Middleware func(Handler) Handler
```

Middleware is a function that takes a **Handler** as a parameter and returns a **Handler**. An example of creating middleware is shown below:
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
When creating, `Handler` is a method interface for the function type **HandleFunc**, so it is necessary to return the corresponding implementation method.
:::

## Code Example
:::tip
Before running this example, please check if the APIKEY is set.
:::

### 1. Create Middleware

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


### 2. Use Middleware
:::tip
To use middleware in an Agent, simply pass it via the WithMiddleware option when creating the Agent.
:::
```go
// Create a blades agent with logging middleware
model := openai.NewModel("gpt-5", openai.Config{
	APIKey: os.Getenv("OPENAI_API_KEY"),
})
agent := blades.NewAgent(
    "Example Agent",
    blades.WithModel(model),
    blades.WithInstructions("You are a helpful assistant."),
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

## Middleware Chain
:::tip
Multiple middlewares can be chained together, and they will execute in the specified order.
:::
```go
// Create multiple middlewares
model := openai.NewModel("gpt-5", openai.Config{
	APIKey: os.Getenv("OPENAI_API_KEY"),
})
agent := blades.NewAgent(
    "Chained Middleware Agent",
    blades.WithModel(model),
    // Chain multiple middlewares
    blades.WithMiddleware(
        Logging(),
        Tracing(),
        Metrics(),
    ),
)
```
:::tip
The execution order of middleware follows the onion model:
- The request passes through the pre-processing logic of all middlewares from the outside to the inside
- Reaches the core processing logic (Agent)
- The response passes through the post-processing logic of all middlewares from the inside to the outside
:::
This design allows middleware to conveniently add various functionalities while maintaining code clarity and maintainability.
