---
title: "构建生成式智能体"
description: "深入解析 Blades Agent 的 Run 方法，详细介绍如何通过同步调用方式构建智能对话系统。文章涵盖 Agent 配置、Prompt 模板使用、错误处理机制，以及实际应用场景的完整实现指南。"
---

# 同步调用：构建智能对话系统

Blades Agent 提供了强大的同步调用机制，使开发者能够构建高效的生成式智能体。通过 `Run` 方法，Agent 能够一次性接收完整的模型响应，为各种应用场景提供稳定可靠的对话能力。

## 核心概念

### 同步调用机制

同步调用是 Blades Agent 最基础且重要的交互模式。当调用 `Run` 方法时，系统会：

1. **请求发送**：将构建好的 Prompt 发送给配置的模型提供者
2. **阻塞等待**：在模型生成完整响应期间保持等待状态
3. **完整返回**：一次性返回包含完整内容的 Message 对象

这种模式特别适用于需要完整结果才能继续后续处理的场景，如内容生成、数据分析、报告撰写等。

### Message 对象结构

`Run` 方法返回的 `Message` 对象包含了丰富的响应信息：

- **Text()**：获取模型生成的文本内容
- **Role**：消息角色（系统、用户、助手等）
- **Metadata**：包含令牌使用、模型信息等元数据
- **ToolCalls**：工具调用结果（如使用工具功能）

## 环境准备

### 1. 安装依赖

```bash
go get github.com/go-kratos/blades
go get github.com/go-kratos/blades/contrib/openai
```

### 2. 配置模型提供者

Blades 支持多种模型提供者，以 OpenAI 为例：

```bash
# 设置 API 密钥
export OPENAI_API_KEY=your-api-key-here

# 设置 API 基础 URL（可选，用于兼容服务）
export OPENAI_BASE_URL=https://api.openai.com/v1
```

## 基础实现

### Agent 初始化

创建一个功能完整的 Agent 需要以下核心配置：

```go
package main

import (
    "context"
    "log"

    "github.com/go-kratos/blades"
    "github.com/go-kratos/blades/contrib/openai"
)

func main() {
    // 创建模型提供者
    provider := openai.NewChatProvider()

    // 初始化 Agent
    agent := blades.NewAgent(
        "智能助手",                    // Agent 名称
        blades.WithProvider(provider),   // 指定模型提供者
        blades.WithModel("gpt-4"),      // 指定使用的模型
        blades.WithDescription("一个专业的AI助手，擅长回答各类问题"), // Agent 描述
    )
}
```

### Prompt 模板构建

使用 PromptTemplate 可以灵活地构建动态提示：

```go
// 定义参数
params := map[string]any{
    "topic":    "人工智能的未来发展",
    "audience": "技术爱好者",
    "language": "中文",
}

// 构建多角色 Prompt
prompt, err := blades.NewPromptTemplate().
    System("你是一个专业的{{.topic}}分析师。请用{{.language}}回答问题。", params).
    User("请为{{.audience}}详细介绍{{.topic}}的核心技术趋势。", params).
    Build()
if err != nil {
    log.Fatal(err)
}
```

### 执行同步调用

```go
// 执行同步调用
ctx := context.Background()
result, err := agent.Run(ctx, prompt)
if err != nil {
    log.Fatalf("调用失败: %v", err)
}

// 处理响应
log.Printf("模型响应: %s", result.Text())
log.Printf("使用令牌: %d", result.Usage.TotalTokens)
```

## 高级功能

### 工具集成

Blades Agent 支持工具调用，扩展智能体的能力边界：

```go
import "github.com/go-kratos/blades/tools"

// 创建工具
weatherTool := tools.NewTool(
    "get_weather",
    tools.WithDescription("获取指定城市的天气信息"),
    tools.WithParameters(map[string]interface{}{
        "city": map[string]interface{}{
            "type":        "string",
            "description": "城市名称",
        },
    }),
)

// 创建带工具的 Agent
agent := blades.NewAgent(
    "天气助手",
    blades.WithProvider(provider),
    blades.WithTools(weatherTool),
    blades.WithModel("gpt-4"),
)
```

### 错误处理机制

完善的错误处理确保系统稳定性：

```go
func safeRunAgent(ctx context.Context, agent *blades.Agent, prompt *blades.Prompt) {
    // 设置超时控制
    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()

    result, err := agent.Run(ctx, prompt)
    if err != nil {
        switch {
        case errors.Is(err, context.DeadlineExceeded):
            log.Println("请求超时，请检查网络连接")
        case errors.Is(err, blades.ErrEmptyResponse):
            log.Println("模型返回空响应")
        default:
            log.Printf("调用失败: %v", err)
        }
        return
    }

    // 验证响应内容
    if result.Text() == "" {
        log.Println("模型返回内容为空")
        return
    }

    log.Printf("成功获取响应: %s", result.Text())
}
```

### 中间件支持

使用中间件增强 Agent 功能：

```go
// 日志中间件
loggingMiddleware := func(next blades.MiddlewareHandler) blades.MiddlewareHandler {
    return func(ctx context.Context, prompt *blades.Prompt, opts ...blades.ModelOption) (*blades.Message, error) {
        log.Printf("处理请求: %s", prompt.String())
        start := time.Now()

        result, err := next(ctx, prompt, opts...)

        duration := time.Since(start)
        log.Printf("请求完成，耗时: %v", duration)

        return result, err
    }
}

// 应用中间件
agent := blades.NewAgent(
    "增强型助手",
    blades.WithProvider(provider),
    blades.WithMiddleware(loggingMiddleware),
)
```

## 实际应用场景

### 1. 内容生成系统

```go
func generateArticle(agent *blades.Agent, topic string, style string) (string, error) {
    prompt, _ := blades.NewPromptTemplate().
        System("你是一个专业的内容创作者，擅长撰写{{.style}}风格的文章。",
               map[string]any{"style": style}).
        User("请撰写一篇关于{{.topic}}的详细文章，要求结构清晰、内容丰富。",
               map[string]any{"topic": topic}).
        Build()

    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
        return "", err
    }

    return result.Text(), nil
}
```

### 2. 数据分析助手

```go
func analyzeData(agent *blades.Agent, data interface{}) (string, error) {
    prompt, _ := blades.NewPromptTemplate().
        System("你是一个数据分析师，擅长从数据中发现洞察和趋势。").
        User("请分析以下数据并提供详细报告：\n{{.data}}",
               map[string]any{"data": data}).
        Build()

    result, err := agent.Run(context.Background(), prompt)
    return result.Text(), err
}
```

### 3. 代码审查助手

```go
func reviewCode(agent *blades.Agent, code string, language string) (string, error) {
    prompt, _ := blades.NewPromptTemplate().
        System("你是一个资深的{{.language}}代码审查专家。",
               map[string]any{"language": language}).
        User(`请审查以下{{.language}}代码，重点关注：
               1. 代码质量和最佳实践
               2. 潜在的安全问题
               3. 性能优化建议
               4. 代码可读性和维护性

               代码内容：
               {{.code}}`,
               map[string]any{"code": code, "language": language}).
        Build()

    result, err := agent.Run(context.Background(), prompt)
    return result.Text(), err
}
```

## 最佳实践

### 1. Prompt 设计原则

- **明确性**：清晰定义任务目标和输出格式
- **上下文**：提供充分的背景信息
- **示例**：使用 few-shot 示例引导模型
- **约束**：明确回答的范围和限制

### 2. 性能优化

```go
// 复用 Agent 实例
var globalAgent *blades.Agent

func initAgent() {
    provider := openai.NewChatProvider()
    globalAgent = blades.NewAgent(
        "全局Agent",
        blades.WithProvider(provider),
        blades.WithModel("gpt-4"),
    )
}

// 使用连接池
func batchProcess(requests []string) []string {
    results := make([]string, len(requests))

    var wg sync.WaitGroup
    var mu sync.Mutex

    for i, req := range requests {
        wg.Add(1)
        go func(idx int, request string) {
            defer wg.Done()

            prompt, _ := blades.NewPromptTemplate().
                User(request).
                Build()

            result, err := globalAgent.Run(context.Background(), prompt)
            if err == nil {
                mu.Lock()
                results[idx] = result.Text()
                mu.Unlock()
            }
        }(i, req)
    }

    wg.Wait()
    return results
}
```

### 3. 监控和日志

```go
// 监控中间件
monitoringMiddleware := func(next blades.MiddlewareHandler) blades.MiddlewareHandler {
    return func(ctx context.Context, prompt *blades.Prompt, opts ...blades.ModelOption) (*blades.Message, error) {
        start := time.Now()

        result, err := next(ctx, prompt, opts...)

        // 记录指标
        metrics.RecordRequestDuration(time.Since(start))
        if err == nil {
            metrics.RecordTokenUsage(result.Usage.TotalTokens)
        }

        return result, err
    }
}
```

## 总结

Blades Agent 的同步调用机制为构建智能对话系统提供了强大而灵活的基础设施。通过合理配置 Agent、精心设计 Prompt、完善的错误处理和性能优化，开发者可以构建出满足各种业务需求的生成式智能体。

关键优势包括：
- **简单易用**：直观的 API 设计，快速上手
- **功能强大**：支持工具调用、中间件等高级特性
- **高性能**：异步处理能力，支持高并发场景
- **可扩展**：模块化架构，易于扩展和定制

通过本文档的指导，您可以充分利用 Blades Agent 的能力，构建出专业级的智能对话应用。
