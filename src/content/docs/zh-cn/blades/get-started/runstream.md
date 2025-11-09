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
```Go
package main

import (
    "context"
    "log"
    "os"
    
    "github.com/go-kratos/blades"
    "github.com/go-kratos/blades/contrib/openai"
)

func main() {
    // Set Environment Variables for OpenAI
    provider := openai.NewChatProvider()
    agent := blades.NewAgent(
    	"Stream Agent",
    	blades.WithProvider(provider),
    	blades.WithModel("deepseek-chat"),
    )
    params := map[string]any{
    	"topic":    "Predict champion of S15",
    	"audience": "General reader",
    }
    prompt, err := blades.NewPromptTemplate().
    	System("Please summarize {{.topic}} ", params).
    	User("Please answer for {{.audience}}, KT and T1 who is more likely to win the final", params).
    	Build()
    if err != nil {
    	log.Fatal(err)
    }
    stream, err := agent.RunStream(context.Background(), prompt)
    if err != nil {
    	log.Fatal(err)
    }
    for stream.Next() {
    	chunk, err := stream.Current()
        if err != nil {
            log.Fatal(err)
        }
    	log.Println(chunk.Text())
    }
}
```
