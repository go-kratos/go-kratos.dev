---
title: "构建流式智能体"
---
# 流式调用
流式调用（Streaming）是一种边生成、边返回的 API 通信模式。与传统“等待完整响应后再返回”的方式不同，流式接口在服务端生成内容的过程中，实时将数据分块（chunk）发送给客户端，客户端可即时处理和展示。

    特点：低延迟感知、内存友好、实时反馈。
    可用于：聊天机器人、代码补全、实时翻译、语音合成前处理等，对“即时性”要求高的场景。

## 代码示例

:::note
前置条件
1. 安装Blades：`go get github.com/go-kratos/blades`
2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`
:::
### Runstream
Blades中使用流式调用与同步调用的参数基本一致，不同的是，流式调用不会等待模型完全生成响应后才返回，而是立即返回一个**流式接口**，允许逐步接收模型的响应内容。流式调用使用**Runstream**方法，所有的输入参数与Run方法相同。

使用**Runstream**方法的示例如下：
```go
package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"text/template"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func buildPrompt(input string, params map[string]any) string {
	t, err := template.New("prompt").Parse(input)
	if err != nil {
		panic(err)
	}
	var result bytes.Buffer
	err = t.Execute(&result, params)
	if err != nil {
		panic(err)
	}
	return result.String()
}

func main() {
	params := map[string]any{
		"topic":    "Predict champion of S15",
		"audience": "General reader",
	}
	// Set Environment Variables for OpenAI
	provider := openai.NewChatProvider()
	info := buildPrompt("Please summarize {{.topic}}", params)
	agent, err := blades.NewAgent(
		"Stream Agent",
		blades.WithProvider(provider),
		blades.WithModel("deepseek-chat"),
		blades.WithInstructions(info),
	)
	if err != nil {
		log.Fatal(err)
	}

	input := blades.UserMessage(
		buildPrompt("Please answer for {{.audience}}, KT and T1 who is more likely to win the final", params),
	)
	runner := blades.NewRunner(agent)
	stream := runner.RunStream(context.Background(), input)
	// stream is a generator of messages
	for msg, err := range stream {
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s", msg.Text())
	}
}
```
