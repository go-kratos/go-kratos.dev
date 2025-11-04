# 🌊 Streaming Calls
Streaming calls (Streaming) are an API communication mode that returns data as it is generated. Unlike the traditional "wait for the complete response before returning" approach, streaming interfaces send data in chunks (chunks) to the client in real-time as the server generates the content, allowing the client to process and display it immediately.

    Features: Low perceived latency, memory-friendly, real-time feedback.
    Suitable for: Chatbots, code completion, real-time translation, pre-processing for speech synthesis, and other scenarios that require high "immediacy".


## 🚀 Code Example

### Prerequisites
    1. Install Blades: `go get github.com/go-kratos/blades`
    2. Configure the model provider (e.g., OpenAI): Set the environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`


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
	provider := openai.NewChatProvider()
	agent := blades.NewAgent(
		"demo-runstream",
		blades.WithProvider(provider),
		blades.WithModel("deepseek-chat"),
	)
	params := map[string]any{
		"topic":    "predict champion of S15",
		"audience": "users",
	}
	prompt, err := blades.NewPromptTemplate().
		System("please summarize {{.topic}} ", params).
		User("please answer for {{.audience}}, KT and T1 who is more likely to win the final", params).
		Build()
	if err != nil {
		panic(err)
	}
	resp, err := agent.RunStream(context.Background(), prompt)
	if err != nil {
		log.Fatalf("agent run: %v", err)
	}
	for resp.Next() {
		chunk, _ := resp.Current()
		os.Stdout.WriteString(chunk.Text())
	}
}
```