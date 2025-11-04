# 🌊 Streaming Calls
Streaming is an API communication mode that returns data as it is generated. Unlike the traditional "wait for the complete response before returning" approach, streaming interfaces send data in chunks (chunk) to the client in real-time while the server is generating content, allowing the client to process and display it immediately.

    Features: Low perceived latency, memory-friendly, real-time feedback.
    Use cases: Chatbots, code completion, real-time translation, pre-processing for speech synthesis, and other scenarios with high requirements for "immediacy".


## 🚀 Code Example

### Prerequisites
    1. Install Blades: `go get github.com/go-kratos/blades`
    2. Configure a model provider (e.g., OpenAI): Set environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`


```Go
package main

import (
	"bufio"
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
		System("请用三点简洁回答 {{.topic}} ", params).
		User("请回答 {{.audience}},KT和T1谁最有可能在决赛中获得冠军", params).
		Build()

	if err != nil {
		panic(err)
	}

	parentctx := context.Background()
	ctx, cancel := context.WithCancel(parentctx)

	go func() {
		key := bufio.NewReader(os.Stdin)
		log.Println("press Enter to cancel")
		_, _ = key.ReadString('\n')
		log.Println("用户主动取消请求")
		cancel()
	}()
	resp, err := agent.RunStream(ctx, prompt)

	if err != nil {
		log.Fatalf("agent run: %v", err)
	}

	for resp.Next() {
		chunk, _ := resp.Current()
		os.Stdout.WriteString(chunk.Text())
	}
	defer cancel()

}

// result:
// 2025/11/04 23:42:35 press Enter to cancel
// 1. T1在近期状态和团队配合上更胜一筹，胜率更高。  
// 2. KT虽有实力，但面对T1的战术多样性
// 2025/11/04 23:42:37 用户主动取消请求
```

## Running Instructions