---
title: "构建流式智能体"
---
<<<<<<< HEAD:src/content/docs/blades/getting-started/runstream.md
# 🌊 Streaming Calls
Streaming calls (Streaming) are an API communication mode that returns data as it is generated. Unlike the traditional approach of "waiting for the complete response before returning," streaming interfaces send data in chunks (chunks) to the client in real-time as the server generates content, allowing the client to process and display it immediately.

    Characteristics: Low perceived latency, memory-friendly, real-time feedback.
    Suitable for: Chatbots, code completion, real-time translation, pre-processing for speech synthesis, and other scenarios that require high "immediacy."
=======
# 🌊流式调用
流式调用（Streaming）是一种边生成、边返回的 API 通信模式。与传统“等待完整响应后再返回”的方式不同，流式接口在服务端生成内容的过程中，实时将数据分块（chunk）发送给客户端，客户端可即时处理和展示。

    特点：低延迟感知、内存友好、实时反馈。
    可用于：聊天机器人、代码补全、实时翻译、语音合成前处理等，对“即时性”要求高的场景。
>>>>>>> c3e0facabaf1dbafee93d281abbd6f78295206db:src/content/docs/zh-cn/blades/get-started/runstream.md

## 🚀代码示例

### 前置条件
    1. 安装Blades：`go get github.com/go-kratos/blades`
    2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`

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
