---
title: "Streaming Calls"
---
# 🌊 Streaming Calls
Streaming calls (Streaming) are an API communication mode that returns data as it is generated. Unlike the traditional approach of "waiting for the complete response before returning," streaming interfaces send data in chunks (chunks) to the client in real-time as the server generates content, allowing the client to process and display it immediately.

    Characteristics: Low perceived latency, memory-friendly, real-time feedback.
    Suitable for: Chatbots, code completion, real-time translation, pre-processing for speech synthesis, and other scenarios that require high "immediacy."

## 🚀 Code Example

### Prerequisites
    1. Install Blades: `go get github.com/go-kratos/blades`
    2. Configure the model provider (e.g., OpenAI): Set environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`

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