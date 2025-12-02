---
title: "Memory"
description: "blades provides memory capabilities for Agents"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/tools-memory","https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---

In multi-turn and multiple sessions, an Agent often needs to "remember what happened before": such as user preferences, historical conclusions, previously confirmed facts, etc. Blades provides Memory capabilities for storing and retrieving information across multiple Sessions, allowing the Agent to "recall" context in new conversations, thereby reducing repetitive questioning and improving consistency.

## What problem does Memory solve?

- Session / State addresses the organization and temporary data management "within the current conversation thread" (the tutorial is covered in the previous chapter).
- Memory is oriented towards "historical information across multiple sessions," which can be retrieved to assist in current responses. It can be understood as the Agent's "retrievable archive/knowledge base."

## Enabling the Agent with Memory Retrieval Capabilities
The Memory usage process in Blades can be summarized in 4 steps:
1. Create a MemoryStore (memory library)
2. Create a MemoryTool (enabling the Agent to actively retrieve memories)
3. Inject the MemoryTool into the Agent (WithTools), then run the conversation

## Creating a Memory Database

NewInMemoryStore() creates an in-memory version of MemoryStore, suitable for examples and local development.

```go
memoryStore := memory.NewInMemoryStore()
```

## Creating an Agent and Adding Memory Tools

In the Agent configuration, add `memory tools` (the example uses blades.WithTools(memoryTool)), and prompt the model in the Instruction to "use the Memory tool when necessary to query memory content."

```go
package main

import (
	"context"
	"log"
	"os"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/memory"
)

func main() {
	ctx := context.Background()
	memoryStore := memory.NewInMemoryStore()
	memoryTool, err := memory.NewMemoryTool(memoryStore)
	if err != nil {
		log.Fatal(err)
	}
	memoryStore.AddMemory(ctx, &memory.Memory{Content: blades.AssistantMessage("My favorite project is the Blades Agent kit.")})
	memoryStore.AddMemory(ctx, &memory.Memory{Content: blades.AssistantMessage("My favorite programming language is Go.")})
	// Create an agent with memory tool
	model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	agent, err := blades.NewAgent(
		"MemoryRecallAgent",
		blades.WithModel(model),
		blades.WithInstruction("Answer the user's question. Use the 'Memory' tool if the answer might be in past conversations."),
		blades.WithTools(memoryTool),
	)
	if err != nil {
		log.Fatal(err)
	}
	// Example conversation in memory
	input := blades.UserMessage("What is my favorite project?")
	runner := blades.NewRunner(agent)
	output, err := runner.Run(ctx, input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```