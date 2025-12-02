---
title: 快速开始
---
Blades 是一个基于 Go 语言的多模态 AI Agent 框架，支持自定义模型、工具、记忆、中间件等，适用于多轮对话、链式推理和结构化输出场景。

## 环境安装
确保你已安装 Go 1.24+，然后通过以下命令初始化你的项目并引入 Blades：

```shell
cd your-project-name
go mod init your-project-name
go get github.com/go-kratos/blades
```
**前置条件**

运行前需要配置模型侧的环境变量（不同 ModelProvider 变量名可能不同，关键是确保 API Key 与 Base URL 可用）：
- OPENAI_BASE_URL
- OPENAI_API_KEY
- OPENAI_MODEL

## 创建智能体
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
    // Configure OpenAI API key and base URL using environment variables:
    model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
        APIKey: os.Getenv("OPENAI_API_KEY"),
    })
	agent, err := blades.NewAgent(
		"Blades Agent",
		blades.WithModel(model),
		blades.WithInstruction("You are a helpful assistant that provides detailed and accurate information."),
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

### 注意
如果你要更换其他提供商的**API**，则需要设置环境变量，例如：

```go
export OPENAI_BASE_URL=https://api.deepseek.com
```

需要设置环境变量 `OPENAI_API_KEY`，例如：

```go
export OPENAI_API_KEY=your-api-key
```

### 支持的模型和提供商
|  提供商  | 模型                           | 兼容     
| ---- |---------------------------------|----------------|
| **OpenAI** | ChatGPT, gpt-5, gpt-4, etc... | qwen3-mqx、deepseek-chat |
| **Claude** | Claude 3.7 Sonnet | - |
| **Gemini** | Gemini 2.5 Pro| - |

## 核心概念速览
| **<font style="color:#000000;">组件</font>** | **<font style="color:#000000;">说明</font>** |
| --- | --- |
| **<font style="color:#000000;">Agent</font>** | <font style="color:#000000;">智能体接口，用于整合与协调模型、工具和记忆等多种功能智能体</font> |
| **<font style="color:#000000;">Tool</font>** | <font style="color:#000000;">外部能力插件（如调用 API、查数据库）</font> |
| **<font style="color:#000000;">Memory</font>** | <font style="color:#000000;">会话记忆管理，支持多轮上下文</font> |
| **<font style="color:#000000;">Middleware</font>** | <font style="color:#000000;">中间件机制，用于日志、限流、鉴权等横切关注点</font> |
| **<font style="color:#000000;">ModelProvider</font>** | <font style="color:#000000;">模型适配器（如 OpenAI、DeepSeek），统一调用接口</font> |


## 更多示例
:::tip
项目提供了丰富的使用案例，涵盖：

+ 多工具调用（Function Calling）
+ 流式响应（Streaming）
+ 自定义 Memory 实现
+ 工作流编排（Flow）

请查看 [https://github.com/go-kratos/blades/tree/main/examples](https://github.com/go-kratos/blades/tree/main/examples) 目录获取完整代码。
:::
