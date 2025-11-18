---
title: "构建流式智能体"
---
# 流式调用
流式调用（Streaming）是一种边生成、边返回的 API 通信模式。与传统“等待完整响应后再返回”的方式不同，流式接口在服务端生成内容的过程中，实时将数据分块（chunk）发送给客户端，客户端可即时处理和展示。

    特点：低延迟感知、内存友好、实时反馈。
    可用于：聊天机器人、代码补全、实时翻译、语音合成前处理等，对“即时性”要求高的场景。

## 代码示例
前置条件

    1. 安装 Blades：`go get github.com/go-kratos/blades`
    2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`

### Runstream
Blades中使用流式调用与同步调用的参数基本一致，不同的是，流式调用不会等待模型完全生成响应后才返回，而是立即返回一个**流式接口**，允许逐步接收模型的响应内容。流式调用使用 **Runstream** 方法，所有的输入参数与Run方法相同。

使用 **Runstream** 方法的示例如下：
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
		blades.WithInstructions("You are a helpful assistant that provides detailed answers."),
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
