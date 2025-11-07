---
title: "Tools"
---
:::note
Blades provides convenient support for custom tools. This guide will walk you through developing a weather query tool.
:::

## Code Example
:::note
Before running this code, please ensure you have properly configured your API key.
:::
```go
package examples

import (
	"context"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/tools"
	"github.com/openai/openai-go/v2/option"
)
```
### 1. Create Tool
```go
// WeatherReq represents a request for weather information.
type WeatherReq struct {
	Location string `json:"location" jsonschema:"Get the current weather for a given city"`
}

// WeatherRes represents a response containing weather information.
type WeatherRes struct {
	Forecast string `json:"forecast" jsonschema:"The weather forecast"`
}

func createTool() *tools.Tool {
	weatherTool, err := tools.NewTool[WeatherReq, WeatherRes](
		"get_weather",
		"Get the current weather for a given city",
		tools.HandleFunc[WeatherReq, WeatherRes](func(ctx context.Context, req WeatherReq) (WeatherRes, error) {
			log.Println("use weather tool,😈Fetching weather for:", req.Location)
			// you can call a weather API here
			return WeatherRes{Forecast: "Sunny, 25°C"}, nil
		}),
	)
	if err != nil {
		log.Fatal(err)
	}
	return weatherTool
}

```
### 2. Create Agent
```go
func createAgent() *blades.Agent {
	agent := blades.NewAgent(
		"Weather Agent",
		blades.WithModel("deepseek-chat"),
		blades.WithInstructions("You are a helpful assistant that provides weather information."),
		blades.WithProvider(openai.NewChatProvider()),
		blades.WithTools(createTool()),
	)
	return agent
}
```

### 3. Run Agent
```go
package examples

import (
	"context"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/tools"
	"github.com/openai/openai-go/v2/option"
)

func createPrompt() *blades.Prompt {
	return blades.NewPrompt(
		blades.UserMessage("What's the weather like in Shanghai?"),
	)
}

func UseTool() {
	tool := createTool()
	agent := createAgent(tool)
	prompt := createPrompt()
	result, err := agent.Run(context.Background(), prompt)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Agent Response:", result)
}

```
:::tip
After successfully running the code, you will see output similar to the following:
:::
```bash
PS E:\0_nebula\code\blades> go run .
2025/11/06 15:54:21 use weather tool,😈Fetching weather for: Shanghai
2025/11/06 15:54:23 Agent Response: [Text: The weather in Shanghai is sunny and 25°C. It's a beautiful day there!)]
```