---
title: "构建流式智能体"
---

# 什么是流式调用
流式调用是一种“边生成、边返回”的交互方式：模型在生成内容的同时，将响应按 chunk 持续推送给客户端；客户端可以实时渲染或处理，而不是等待完整结果一次性返回。

**适用场景**
- 聊天机器人实时输出
- 代码补全/边打边出
- 实时翻译
- 需要低延迟反馈的 UI（例如逐字出现的回答）

**特点**
- 低延迟感知（更快“看到”首字）
- 更友好的内存/体验（无需等完整响应）
- 更适合做实时展示或增量处理

### 流式调用示例
Blades 的流式调用通过 RunStream 方法完成。它与同步调用 Run 的输入参数基本一致，但返回的是一个可迭代的流对象，你可以在 for range 中持续接收模型输出消息。

使用 **RunStream** 方法的示例如下：
```go
package main

import (
	"context"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func main() {
    // Configure OpenAI API key and base URL using environment variables:
    model := openai.NewModel("gpt-5", openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	agent, err := blades.NewAgent(
		"Stream Agent",
		blades.WithModel(model),
		blades.WithInstruction("You are a helpful assistant that provides detailed answers."),
	)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("What is the capital of France?")
	runner := blades.NewRunner(agent)
	stream := runner.RunStream(context.Background(), input)
	for m, err := range stream {
		if err != nil {
			log.Fatal(err)
		}
		log.Println(m.Status, m.Text())
	}
}
```
