---
title: " Synchronous Invocation"
---
# 🔁 Synchronous Invocation
:::note
Use Blades synchronous invocation to have the Agent return a complete response at once.

    Behavior: After sending a request with a synchronous Run call, it blocks and waits until the model generates a complete reply, then returns the result all at once.
    Return value: A complete Message object

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
    // Set Environment Variables for OpenAI
    provider := openai.NewChatProvider()
    agent := blades.NewAgent(
    	"Run Agent",
    	blades.WithProvider(provider),
    	blades.WithModel("deepseek-chat"),
    )
    params := map[string]any{
    	"topic":    "The Future of Artificial Intelligence",
    	"audience": "General reader",
    }
    prompt, err := blades.NewPromptTemplate().
    	System("please summarize {{.topic}}。", params).
    	User("please answer for {{.audience}} in a clear and accurate manner.", params).
    	Build()
    if err != nil {
    	log.Fatal(err)
    }
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
    	log.Fatal(err)
    }
    log.Println(result.Text())
}
```