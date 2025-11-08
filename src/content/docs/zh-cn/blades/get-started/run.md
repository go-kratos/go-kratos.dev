---
title: "构建生成式智能体"
description: "文章介绍了如何使用 Blades Agent 的 Run 方法以同步方式调用 LLM，从而实现一次性返回完整回答的功能。内容包括使用 Blades Agent 的前置条件说明、以及通过示例代码展示具体的调用过程。"
---

# 构建生成式智能体

Blades 框架提供了强大的 Agent 组件，允许开发者通过 `Run` 方法以同步方式调用大语言模型（LLM），实现一次性返回完整回答的功能。本文将详细介绍如何使用 Blades Agent 构建生成式智能体应用。

## 概述

Blades Agent 是框架的核心执行单元，它封装了与大语言模型交互的复杂性，提供了简洁的接口来实现各种 AI 功能。通过 `Run` 方法，开发者可以以同步方式调用 LLM，获取完整的响应内容。

### 核心特性

- **同步执行**：`Run` 方法以阻塞方式执行，等待 LLM 完成全部响应后返回
- **完整的响应处理**：支持工具调用、状态管理、中间件处理等完整功能
- **灵活的配置选项**：支持多种模型提供者、工具集成、中间件等配置
- **状态持久化**：自动管理会话状态和消息历史

## 前置条件

在使用 Blades Agent 的 `Run` 方法之前，需要满足以下条件：

### 1. 环境配置

确保已安装 Go 1.19 或更高版本，并正确配置了 Go 模块：

```bash
go mod init your-project
go get github.com/go-kratos/blades
go get github.com/go-kratos/blades/contrib/openai  # 或其他模型提供者
```

### 2. 模型提供者配置

Blades 支持多种模型提供者，需要选择并配置相应的提供者：

```go
// OpenAI 提供者
provider := openai.NewChatProvider(
    openai.WithAPIKey("your-api-key"),
    openai.WithBaseURL("https://api.openai.com/v1"),
)

// Claude 提供者
provider := claude.NewProvider(
    claude.WithAPIKey("your-api-key"),
)

// Gemini 提供者
provider := gemini.NewProvider(
    gemini.WithAPIKey("your-api-key"),
)
```

### 3. 基础依赖导入

在代码中导入必要的包：

```go
import (
    "context"
    "log"

    "github.com/go-kratos/blades"
    "github.com/go-kratos/blades/contrib/openai"  // 选择所需的提供者
)
```

## 使用 Run 方法

### 基本用法

创建 Agent 并使用 `Run` 方法进行同步调用：

```go
func main() {
    // 创建 Agent 实例
    agent := blades.NewAgent(
        "Basic Agent",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions("你是一个有用的助手，提供详细准确的信息。"),
    )

    // 构建提示
    prompt := blades.NewPrompt(
        blades.UserMessage("什么是人工智能？请简单介绍一下。"),
    )

    // 同步调用 LLM
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }

    // 输出结果
    log.Println("AI 回答:", result.Text())
}
```

### 模板化提示

Blades 支持模板化提示，允许动态替换变量：

```go
func main() {
    agent := blades.NewAgent(
        "Template Agent",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
    )

    // 定义模板参数
    params := map[string]any{
        "topic":    "人工智能的未来发展",
        "audience": "普通读者",
    }

    // 构建模板化提示
    prompt, err := blades.NewPromptTemplate().
        System("请总结 {{.topic}} 的三个关键点。", params).
        User("请以 {{.audience}} 能理解的方式回答。", params).
        Build()

    if err != nil {
        log.Fatal(err)
    }

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }

    log.Println("生成的提示:", prompt.String())
    log.Println("AI 回答:", result.Text())
}
```

### 工具集成

Blades Agent 支持集成外部工具，扩展 AI 的能力：

```go
// 定义工具请求结构
type WeatherReq struct {
    Location string `json:"location" jsonschema:"获取指定城市的天气信息"`
}

// 定义工具响应结构
type WeatherRes struct {
    Forecast string `json:"forecast" jsonschema:"天气预报"`
}

func main() {
    // 创建天气工具
    weatherTool, err := tools.NewTool[WeatherReq, WeatherRes](
        "get_weather",
        "获取指定城市的当前天气",
        tools.HandleFunc[WeatherReq, WeatherRes](func(ctx context.Context, req WeatherReq) (WeatherRes, error) {
            log.Println("查询天气:", req.Location)
            return WeatherRes{Forecast: "晴天，25°C"}, nil
        }),
    )

    if err != nil {
        log.Fatal(err)
    }

    // 创建带工具的 Agent
    agent := blades.NewAgent(
        "Weather Agent",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions("你是一个天气助手，帮助用户查询天气信息。"),
        blades.WithTools(weatherTool),
    )

    // 查询天气
    prompt := blades.NewPrompt(
        blades.UserMessage("北京的天气怎么样？"),
    )

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }

    log.Println("天气查询结果:", result.Text())
}
```

### 高级配置

使用更高级的配置选项：

```go
func main() {
    // 创建输入模式（验证用户输入）
    inputSchema := &jsonschema.Schema{
        Type: "object",
        Properties: map[string]*jsonschema.Schema{
            "query": {
                Type:        "string",
                Description: "用户查询内容",
                MinLength:   1,
                MaxLength:   1000,
            },
        },
        Required: []string{"query"},
    }

    // 创建输出模式（验证模型输出）
    outputSchema := &jsonschema.Schema{
        Type: "object",
        Properties: map[string]*jsonschema.Schema{
            "answer": {
                Type:        "string",
                Description: "AI 的回答",
            },
            "confidence": {
                Type:        "number",
                Description: "回答的置信度 (0-1)",
            },
        },
        Required: []string{"answer", "confidence"},
    }

    agent := blades.NewAgent(
        "Advanced Agent",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions("你是一个专业的助手，请按照指定格式回答问题。"),
        blades.WithInputSchema(inputSchema),
        blades.WithOutputSchema(outputSchema),
        blades.WithMaxIterations(5),  // 设置最大迭代次数
        blades.WithOutputKey("response"),  // 设置状态输出键
    )

    prompt := blades.NewPrompt(
        blades.UserMessage(`{"query": "什么是机器学习？"}`),
    )

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        log.Fatal(err)
    }

    log.Println("结构化回答:", result.Text())
}
```

## 错误处理

在实际使用中，需要妥善处理各种错误情况：

```go
func runAgentSafely(agent *blades.Agent, prompt *blades.Prompt) {
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        switch err {
        case blades.ErrMaxIterationsExceeded:
            log.Println("错误：超出最大迭代次数")
        case context.Canceled:
            log.Println("错误：请求被取消")
        case context.DeadlineExceeded:
            log.Println("错误：请求超时")
        default:
            log.Printf("错误：%v", err)
        }
        return
    }

    log.Println("成功获取回答:", result.Text())
}
```

## 性能优化

### 1. 复用 Agent 实例

```go
// 创建全局 Agent 实例
var globalAgent *blades.Agent

func init() {
    globalAgent = blades.NewAgent(
        "Global Agent",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
    )
}

func handleRequest(query string) (string, error) {
    prompt := blades.NewPrompt(
        blades.UserMessage(query),
    )

    result, err := globalAgent.Run(context.Background(), prompt)
    if err != nil {
        return "", err
    }

    return result.Text(), nil
}
```

### 2. 合理设置超时

```go
func runWithTimeout(agent *blades.Agent, prompt *blades.Prompt, timeout time.Duration) (*blades.Message, error) {
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    result, err := agent.Run(ctx, prompt)
    if err != nil {
        return nil, err
    }

    return result, nil
}
```

## 实际应用场景

### 1. 内容生成

```go
func generateContent(topic string, style string) (string, error) {
    agent := blades.NewAgent(
        "Content Generator",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions(fmt.Sprintf("你是一个专业的%s内容创作者。", style)),
    )

    prompt := blades.NewPrompt(
        blades.UserMessage(fmt.Sprintf("请写一篇关于%s的%s风格文章。", topic, style)),
    )

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        return "", err
    }

    return result.Text(), nil
}
```

### 2. 数据分析

```go
func analyzeData(dataDescription string) (string, error) {
    agent := blades.NewAgent(
        "Data Analyst",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions("你是一个数据分析师，擅长从数据中发现洞察。"),
    )

    prompt := blades.NewPrompt(
        blades.UserMessage(fmt.Sprintf("请分析以下数据特征并提供洞察：%s", dataDescription)),
    )

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        return "", err
    }

    return result.Text(), nil
}
```

### 3. 代码辅助

```go
func generateCode(description string, language string) (string, error) {
    agent := blades.NewAgent(
        "Code Assistant",
        blades.WithModel("gpt-4"),
        blades.WithProvider(openai.NewChatProvider()),
        blades.WithInstructions("你是一个编程助手，请生成高质量的代码。"),
    )

    prompt := blades.NewPrompt(
        blades.UserMessage(fmt.Sprintf("请用%s实现以下功能：%s", language, description)),
    )

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        return "", err
    }

    return result.Text(), nil
}
```

## 最佳实践

### 1. 提示工程

- **明确的指令**：为 Agent 提供清晰、具体的角色定义和任务指令
- **上下文管理**：合理构建提示词，提供足够的上下文信息
- **格式化输出**：指定输出格式，便于后续处理

```go
// 好的提示示例
goodPrompt := blades.NewPromptTemplate().
    System("你是一个资深的产品经理，擅长撰写产品需求文档。").
    User("请为以下功能撰写PRD：\n功能名称：用户注册\n主要特性：支持邮箱注册、手机号注册、社交账号登录\n目标用户：18-35岁的互联网用户").
    Build()
```

### 2. 错误处理策略

- **重试机制**：对于临时性错误实现自动重试
- **降级策略**：在服务不可用时提供备用方案
- **日志记录**：记录详细的错误信息用于调试

```go
func runWithRetry(agent *blades.Agent, prompt *blades.Prompt, maxRetries int) (*blades.Message, error) {
    var lastErr error

    for i := 0; i < maxRetries; i++ {
        result, err := agent.Run(context.Background(), prompt)
        if err == nil {
            return result, nil
        }

        lastErr = err
        log.Printf("尝试 %d 失败: %v", i+1, err)

        // 对于网络错误，等待一段时间后重试
        if isNetworkError(err) {
            time.Sleep(time.Duration(i+1) * time.Second)
            continue
        }

        // 对于其他类型的错误，立即返回
        break
    }

    return nil, fmt.Errorf("经过 %d 次尝试后仍然失败: %w", maxRetries, lastErr)
}
```

### 3. 性能监控

- **响应时间监控**：记录每次调用的响应时间
- **成功率统计**：跟踪调用成功率
- **资源使用监控**：监控内存和CPU使用情况

```go
func monitoredRun(agent *blades.Agent, prompt *blades.Prompt) (*blades.Message, error) {
    startTime := time.Now()

    result, err := agent.Run(context.Background(), prompt)

    duration := time.Since(startTime)
    log.Printf("Agent 调用耗时: %v", duration)

    if err != nil {
        log.Printf("Agent 调用失败: %v", err)
        return nil, err
    }

    log.Printf("Agent 调用成功，响应长度: %d 字符", len(result.Text()))
    return result, nil
}
```

## 总结

Blades Agent 的 `Run` 方法提供了一个简洁而强大的接口，让开发者能够轻松构建生成式智能体应用。通过同步调用方式，开发者可以：

1. **简化开发流程**：避免复杂的异步处理逻辑
2. **确保响应完整性**：获取完整的响应内容
3. **集成丰富功能**：支持工具调用、状态管理、中间件等高级特性
4. **灵活配置**：根据需求定制 Agent 的行为和特性

通过本文介绍的使用方法和最佳实践，开发者可以快速上手并构建高质量的 AI 应用程序。无论是简单的问答系统还是复杂的智能助手，Blades Agent 都能提供可靠的支持。