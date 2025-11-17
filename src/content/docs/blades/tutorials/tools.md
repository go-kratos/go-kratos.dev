---
title: "Tools"
description: "Usage of tool operations in blades"
references: ["https://github.com/go-kratos/blades/tree/main/examples/tools-func"]
---
Blades provides convenient support for custom tools, allowing you to create your own functional tools.

## Functional Tools
:::note
Before running this code, please ensure you have correctly configured the relevant environment variables.
:::

### Defining Tools
`tools.NewFunc(...)` is the core method for creating a function-based tool, which includes the following parameters:

**name**: The name of the tool, used to identify the tool.

**description**: The description of the tool, used to inform the user of the tool's functionality.

**handler**: The handler function of the tool, used to process the tool's request and return the result. When defining the handler, a wrapper is required to convert an ordinary Go function into a tool handler function recognizable by **blades**.

```go
// WeatherReq represents a request for weather information.
type WeatherReq struct {
	Location string `json:"location" jsonschema:"Get the current weather for a given city"`
}

// WeatherRes represents a response containing weather information.
type WeatherRes struct {
	Forecast string `json:"forecast" jsonschema:"The weather forecast"`
}
weatherTool, err := tools.NewFunc(
	"get_weather",
	"Get the current weather for a given city",
	weatherHandle,
)
```

### Creating an Agent and Importing Tools
```go
// Configure OpenAI API key and base URL using environment variables:
model := openai.NewModel("gpt-5", openai.Config{
	APIKey: os.Getenv("OPENAI_API_KEY"),
})
agent, err := blades.NewAgent(
	"Weather Agent",
	blades.WithModel(model),
	blades.WithInstructions("You are a helpful assistant that provides weather information."),
	blades.WithTools(weatherTool),
)
if err != nil {
	log.Fatal(err)
}
```

### Running
```go
input := blades.UserMessage("What is the weather in New York City?")
	session := blades.NewSession()
	runner := blades.NewRunner(agent, blades.WithSession(session))
	ctx := context.Background()
	output, err := runner.Run(ctx, input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("state:", session.State())
	log.Println("output:", output.Text())
```
After successfully running the code, you will see output similar to the following:
```bash
2025/11/14 11:01:18 stream status: completed output: The weather in San Francisco is currently sunny with a temperature of 25°C.
```
##