---
title: "Building Streaming Agents"
---
# Streaming Calls
Streaming calls (Streaming) are an API communication mode that returns content as it is generated. Unlike the traditional approach of "waiting for a complete response before returning," streaming interfaces send data in chunks to the client in real-time while the server is generating the content, allowing the client to process and display it immediately.

    Features: Low perceived latency, memory-friendly, real-time feedback.
    Applicable to: Chatbots, code completion, real-time translation, pre-processing for speech synthesis, and other scenarios with high requirements for "immediacy."

## Code Example

:::note
Prerequisites
1. Install Blades: `go get github.com/go-kratos/blades`
2. Configure the model provider (e.g., OpenAI): Set environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`
:::
### Runstream
In Blades, the parameters for streaming calls are essentially the same as for synchronous calls. The difference is that streaming calls do not wait for the model to fully generate the response before returning; instead, they immediately return a **streaming interface**, allowing you to progressively receive the model's response content. Streaming calls use the **Runstream** method, and all input parameters are the same as the Run method.

An example of using the **Runstream** method is as follows:
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