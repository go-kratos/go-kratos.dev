---
title: Quick Start
---
Blades is a multimodal AI Agent framework based on the Go language, supporting custom models, tools, memory, middleware, etc., suitable for multi-turn conversations, chain-of-thought reasoning, and structured output scenarios.

## 📦 Environment Setup
Ensure you have installed Go 1.20+, then initialize your project and import Blades with the following commands:

```basic
cd your-project-name
go mod init your-project-name
go get github.com/go-kratos/blades
```

## 🚀 First Chat Agent
Below is a complete example of building a simple chat Agent using the OpenAI model:

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
    // Create an Agent, specifying the model and model provider
    provider := openai.NewChatProvider(
        openai.WithChatOptions(
            option.WithBaseURL("https://api.deepseek.com"),
            option.WithAPIKey("API-YOUR-KEY"),
        ),
    )
    agent := blades.NewAgent(
		"Blades Agent",
        blades.WithModel("deepseek-chat"),  // or gpt-5, qwen3-max, etc.
        blades.WithProvider(provider),
        blades.WithInstructions("You are a helpful assistant that provides detailed and accurate information."),
    )
    // Input prompt
    prompt := blades.NewPrompt(
        blades.UserMessage("What is the capital of France?"),
    )
    // Execute the Agent
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }
    // Output the result
    log.Println(result.Text())
}

```

### 💡 Note
If you want to switch to another LLM's API, you need to set environment variables, for example:

```go
export OPENAI_BASE_URL=https://api.deepseek.com
```

You need to set the environment variable `OPENAI_API_KEY`, for example:

```go
export OPENAI_API_KEY=your-api-key
```

### ⚙ Common Large Model URLs
| **<font style="color:#000000;">Provider</font>** | **<font style="color:#000000;">models</font>** | **URL** |
| :---: | --- | --- |
| <font style="color:#000000;">OpenAI</font> | gpt-4o, gpt-4, gpt-3.5-turbo | [https://api.openai.com/v1](https://api.openai.com/v1) |
| <font style="color:#000000;">DeepSeek</font> | deepseek-chat, deepseek-coder | [https://api.deepseek.com/v1](https://api.deepseek.com/v1) |
| <font style="color:#000000;">Moonshot</font> | moonshot-v1-8k, moonshot-v1-32k | [https://api.moonshot.cn/v1](https://api.moonshot.cn/v1) |
| <font style="color:#000000;">Zhipu AI</font> | glm-4, glm-4-flash, glm-3-turbo | [https://open.bigmodel.cn/api/paas/v4](https://open.bigmodel.cn/api/paas/v4) |
| <font style="color:#000000;">Baichuan</font> | Baichuan4, Baichuan3-Turbo | [https://api.baichuan-ai.com/v1](https://api.baichuan-ai.com/v1) |
| <font style="color:#000000;">Ollama</font> | llama3, qwen:7b, mistral | [http://localhost:11434/v1](http://localhost:11434/v1)	 |
| <font style="color:#000000;">Together AI</font> | meta-llama/Llama-3-8b-chat-hf | [https://api.together.xyz/v1](https://api.together.xyz/v1) |
| <font style="color:#000000;">Groq</font> | llama3-8b-8192, mixtral-8x7b-32768 | [https://api.groq.com/openai/v1](https://api.groq.com/openai/v1) |


## 🧩 Core Concepts Overview
| **<font style="color:#000000;">Component</font>** | **<font style="color:#000000;">Description</font>** |
| --- | --- |
| **<font style="color:#000000;">Agent</font>** | <font style="color:#000000;">The core of the intelligent agent, responsible for coordinating models, tools, memory, etc.</font> |
| **<font style="color:#000000;">Tool</font>** | <font style="color:#000000;">External capability plugins (e.g., calling APIs, querying databases)</font> |
| **<font style="color:#000000;">Memory</font>** | <font style="color:#000000;">Conversation memory management, supporting multi-turn context</font> |
| **<font style="color:#000000;">Runnable</font>** | <font style="color:#000000;">Unified interface for all executable components (Agent, Chain, Model, etc. all implement it)</font> |
| **<font style="color:#000000;">Middleware</font>** | <font style="color:#000000;">Middleware mechanism for cross-cutting concerns like logging, rate limiting, authentication</font> |
| **<font style="color:#000000;">ModelProvider</font>** | <font style="color:#000000;">Model adapter (e.g., OpenAI, DeepSeek), providing a unified calling interface</font> |


## 📂 More Examples
The project provides rich usage examples, covering:

+ Multi-tool calling (Function Calling)
+ Streaming responses
+ Custom Memory implementations
+ Workflow orchestration (Flow)

Please check the `[https://github.com/go-kratos/blades/tree/main/examples](https://github.com/go-kratos/blades/tree/main/examples)` directory for complete code.

## 🛠 Environment Variables (Using OpenAI as an Example)
```basic
export OPENAI_API_KEY=sk-xxxxxx
# Optional: Custom API address (e.g., when using a proxy)
export OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📚 Learning Resources
+ [Official GitHub Repository](https://github.com/go-kratos/blades)

## 📕 Note
✅ Tip: Blades follows Go language idioms, with concise code and decoupled components, making it very suitable for building enterprise-level AI applications.

Welcome to Star ⭐️ the project: github.com/go-kratos/blades
