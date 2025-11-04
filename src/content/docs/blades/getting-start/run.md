# 🔁 Synchronous Invocation
Use Blades synchronous invocation to make the Agent return a complete answer at once.

    Behavior: After sending a request via synchronous Run, it blocks and waits until the model generates a complete response, then returns the result all at once.
    Return value: A complete Message object


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

	provider := openai.NewChatProvider()
	// build Agent
	agent := blades.NewAgent(
		"demo-run-agent",
		blades.WithProvider(provider),
		blades.WithModel("deepseek-chat"),
	)
	// build Prompt
	params := map[string]any{
		"topic":    "artificial intelligence",
		"audience": "users",
	}
	prompt, err := blades.NewPromptTemplate().
		System("please summarize {{.topic}}。", params).
		User("please answer for {{.audience}} in a clear and accurate manner.", params).
		Build()
	if err != nil {
		log.Fatal(err)
	}
	// run
	resp, err := agent.Run(context.Background(), prompt)
	if err != nil {
		log.Fatalf("agent run: %v", err)
	}
	os.Stdout.WriteString(resp.Text())
}
```