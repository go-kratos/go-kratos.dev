---
title: "Building Streaming Agents"
---
# Streaming Calls
Streaming calls (Streaming) are an API communication mode that returns data while generating it. Unlike the traditional approach of "waiting for the complete response before returning," streaming interfaces send data in chunks to the client in real-time as the server generates the content, allowing the client to process and display it immediately.

    Features: Low perceived latency, memory-friendly, real-time feedback.
    Applicable to: Chatbots, code completion, real-time translation, pre-processing for speech synthesis, and other scenarios with high requirements for "immediacy."

## Code Example
Prerequisites
1. Install Blades: `go get github.com/go-kratos/blades`
2. Configure the model provider (e.g., OpenAI): Set the environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`

### Runstream
In Blades, the parameters for streaming calls are basically the same as for synchronous calls. The difference is that streaming calls do not wait for the model to fully generate the response before returning; instead, they immediately return a **streaming interface**, allowing the model's response content to be received incrementally. Streaming calls use the **Runstream** method, and all input parameters are the same as the Run method.

An example of using the **Runstream** method is as follows:
```go
package main

import (
	"context"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func main() {
	agent, err := blades.NewAgent(
		"Stream Agent",
		blades.WithModel("deepseek-chat"),
		blades.WithProvider(openai.NewChatProvider()),
		blades.WithInstructions("You are a helpful assistant that provides detailed answers."),
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