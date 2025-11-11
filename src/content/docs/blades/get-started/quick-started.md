---
title: Quick Start
---
Blades is a multimodal AI Agent framework based on Go, supporting custom models, tools, memory, middleware, etc., suitable for multi-turn conversations, chain-of-thought reasoning, and structured output scenarios.

## Environment Setup
Ensure you have installed Go 1.20+, then initialize your project and import Blades with the following commands:

```basic
cd your-project-name
go mod init your-project-name
go get github.com/go-kratos/blades
```

## First Chat Agent
Let's get straight to the point. Below is a complete example of building a simple chat Agent using the OpenAI model:
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
	// set up the OpenAI provider
	provider := openai.NewChatProvider(
		openai.WithChatOptions(
			option.WithAPIKey("YOUR_API_KEY"),
			option.WithBaseURL("YOUR_BASE_URL"),
		),
	)
	// create agent
	agent, err := blades.NewAgent(
		"Blades Agent",
		blades.WithModel("YOUR_MODEL"), // or gpt-5, qwen3-max, etc.
		blades.WithProvider(provider),
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
If you want to switch to another LLM API, you need to set environment variables, for example:

```go
export OPENAI_BASE_URL=https://api.deepseek.com
```

You need to set the environment variable `OPENAI_API_KEY`, for example:

```go
export OPENAI_API_KEY=your-api-key
```

### Common Large Models
|  Provider  | Model                           | Compatibility     
| ---- |---------------------------------|----------------|
| **OpenAI** | ChatGPT, GPT-4, GPT-3.5, etc... | Alibaba Bailian, DeepSeek |
| **Claude** | Claude 3.7 Sonnet | - |
| **Gemini** | Gemini 2.5 Pro| - |
## Core Concepts Overview
| **<font style="color:#000000;">Component</font>** | **<font style="color:#000000;">Description</font>** |
| --- | --- |
| **<font style="color:#000000;">Agent</font>** | <font style="color:#000000;">The core of the intelligent agent, responsible for coordinating models, tools, memory, etc.</font> |
| **<font style="color:#000000;">Tool</font>** | <font style="color:#000000;">External capability plugins (such as calling APIs, querying databases)</font> |
| **<font style="color:#000000;">Memory</font>** | <font style="color:#000000;">Conversation memory management, supporting multi-turn context</font> |
| **<font style="color:#000000;">Runnable</font>** | <font style="color:#000000;">A unified interface for all executable components (Agent, Chain, Model, etc. all implement it)</font> |
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