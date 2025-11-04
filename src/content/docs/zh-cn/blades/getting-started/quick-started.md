---
title: 快速开始
---
Blades 是一个基于 Go 语言的多模态 AI Agent 框架，支持自定义模型、工具、记忆、中间件等，适用于多轮对话、链式推理和结构化输出场景。

## 📦 环境安装
确保你已安装 Go 1.20+，然后通过以下命令初始化你的项目并引入 Blades：

```basic
cd your-project-name
go mod init your-project-name
go get github.com/go-kratos/blades
```

## 🚀 第一个 Chat Agent
下面是一个使用 OpenAI 模型构建简单聊天 Agent 的完整示例：

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

### 💡 注意
如果你要更换其他LLM的API，则需要设置环境变量，例如：

```go
export OPENAI_BASE_URL=https://api.deepseek.com
```

需要设置环境变量 `OPENAI_API_KEY`，例如：

```go
export OPENAI_API_KEY=your-api-key
```

### ⚙常用大模型URL
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


## 🧩 核心概念速览
| **<font style="color:#000000;">组件</font>** | **<font style="color:#000000;">说明</font>** |
| --- | --- |
| **<font style="color:#000000;">Agent</font>** | <font style="color:#000000;">智能体核心，负责协调模型、工具、记忆等</font> |
| **<font style="color:#000000;">ModelProvider</font>** | <font style="color:#000000;">模型适配器（如 OpenAI、DeepSeek），统一调用接口</font> |
| **<font style="color:#000000;">Tool</font>** | <font style="color:#000000;">外部能力插件（如调用 API、查数据库）</font> |
| **<font style="color:#000000;">Memory</font>** | <font style="color:#000000;">会话记忆管理，支持多轮上下文</font> |
| **<font style="color:#000000;">Middleware</font>** | <font style="color:#000000;">中间件机制，用于日志、限流、鉴权等横切关注点</font> |
| **<font style="color:#000000;">Runnable</font>** | <font style="color:#000000;">所有可执行组件的统一接口（Agent、Chain、Model 等均实现它）</font> |


## 📂 更多示例
项目提供了丰富的使用案例，涵盖：

+ 多工具调用（Function Calling）
+ 流式响应（Streaming）
+ 自定义 Memory 实现
+ 工作流编排（Flow）

请查看 `[https://github.com/go-kratos/blades/tree/main/examples](https://github.com/go-kratos/blades/tree/main/examples)` 目录获取完整代码。

## 🛠 环境变量（以 OpenAI 为例）
```basic
export OPENAI_API_KEY=sk-xxxxxx
# 可选：自定义 API 地址（如使用代理）
export OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📚 学习资源
+ [github官网地址](https://github.com/go-kratos/blades)

## 📕说明
✅ 提示：Blades 遵循 Go 语言惯用法，代码简洁、组件解耦，非常适合构建企业级 AI 应用。

欢迎 Star ⭐️ 项目：github.com/go-kratos/blades

