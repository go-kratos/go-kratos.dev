---
title: "Building Streaming Agents"
---

# What is Streaming Invocation
Streaming invocation is an interaction method of "generate while returning": the model continuously pushes responses to the client in chunks while generating content; the client can render or process them in real-time, rather than waiting for the complete result to be returned all at once.

**Applicable Scenarios**
- Real-time output for chatbots
- Code completion / output while typing
- Real-time translation
- UI requiring low-latency feedback (e.g., answers appearing word by word)

**Characteristics**
- Low perceived latency (faster "first token" time)
- More memory/experience friendly (no need to wait for full response)
- More suitable for real-time display or incremental processing

### Streaming Invocation Example
Blades implements streaming invocation through the RunStream method. Its input parameters are largely consistent with the synchronous Run method, but it returns an iterable stream object from which you can continuously receive model output messages within a for range loop.

Example using the **RunStream** method:
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
		blades.WithInstruction("You are a helpful assistant that provides detailed answers."),
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