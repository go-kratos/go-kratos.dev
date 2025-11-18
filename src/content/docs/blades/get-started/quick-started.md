---
title: Quick Start
---
Blades is a multimodal AI Agent framework based on Go, supporting custom models, tools, memory, middleware, etc., suitable for multi-turn conversations, chain-of-thought reasoning, and structured output scenarios.

## Environment Setup
Ensure you have Go 1.20+ installed, then initialize your project and import Blades with the following commands:

```shell
cd your-project-name
go mod init your-project-name
go get github.com/go-kratos/blades
```

## Create an Agent
Here is a complete example of building a simple chat Agent using the OpenAI model:
```go
package main

import (
	"context"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/openai/openai-go/v2/option"
)

func main() {
    // Configure OpenAI API key and base URL using environment variables:
    model := openai.NewModel("gpt-5", openai.Config{
        APIKey: os.Getenv("OPENAI_API_KEY"),
    })
	// create agent
	agent, err := blades.NewAgent(
		"Blades Agent",
		blades.WithModel(model),
		blades.WithInstructions("You are a helpful assistant that provides detailed and accurate information."),
	)
	if err != nil {
		log.Fatal(err)
	}
	// Create a new input message
	input := blades.UserMessage("What is the capital of France?") // Create a new input message
	// Run the agent
	runner := blades.NewRunner(agent)
	result, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(result.Text())
}
```

### Note
If you want to use another provider's **API**, you need to set environment variables, for example:

```go
export OPENAI_BASE_URL=https://api.deepseek.com
```

You need to set the environment variable `OPENAI_API_KEY`, for example:

```go
export OPENAI_API_KEY=your-api-key
```

### Supported Models and Providers
| Provider | Model                           | Compatibility     
| ---- |---------------------------------|----------------|
| **OpenAI** | ChatGPT, gpt-5, gpt-4, etc... | qwen3-mqx、deepseek-chat |
| **Claude** | Claude 3.7 Sonnet | - |
| **Gemini** | Gemini 2.5 Pro| - |

## Core Concepts Overview
| **<font style="color:#000000;">Component</font>** | **<font style="color:#000000;">Description</font>** |
| --- | --- |
| **<font style="color:#000000;">Agent</font>** | <font style="color:#000000;">Agent interface for integrating and coordinating models, tools, memory, and other functional agents</font> |
| **<font style="color:#000000;">Tool</font>** | <font style="color:#000000;">External capability plugins (e.g., calling APIs, querying databases)</font> |
| **<font style="color:#000000;">Memory</font>** | <font style="color:#000000;">Conversation memory management, supporting multi-turn context</font> |
| **<font style="color:#000000;">Middleware</font>** | <font style="color:#000000;">Middleware mechanism for cross-cutting concerns like logging, rate limiting, authentication</font> |
| **<font style="color:#000000;">ModelProvider</font>** | <font style="color:#000000;">Model adapter (e.g., OpenAI, DeepSeek), providing a unified calling interface</font> |


## More Examples
:::tip
The project provides rich usage examples, covering:

+ Multi-tool calling (Function Calling)
+ Streaming responses
+ Custom Memory implementation
+ Workflow orchestration (Flow)

Please check the [https://github.com/go-kratos/blades/tree/main/examples](https://github.com/go-kratos/blades/tree/main/examples) directory for complete code.
:::
