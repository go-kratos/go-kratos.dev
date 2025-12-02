---
title: "Memory"
description: "Blades provides memory capabilities for Agents"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/tools-memory","https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---
Agents often need to recall context from previous conversations across multiple interactions. Therefore, it is necessary to save previous dialogue information and import it into new conversations, retrieving past dialogue history to ensure awareness of what has been said and done, maintaining coherence and avoiding repetition. Blades provides foundational functionality through Memory.
## Core Concepts
The usage scope of `Memory` differs from `Session` and `State`, each suitable for different scenarios.

- **Memory**: Can retrieve dialogue information from multiple past sessions, allowing the Agent to recall context and details from previous conversations.

The relationship between `Session` and `State` has been explained in previous examples. In the context of solving a case, `Memory` can be thought of as the detective's archive of old case files. During the investigation, the detective can check `Memory` to see if similar modus operandi have been recorded. (`Equivalent to a knowledge base`)

## Memory
**`Memory`** can store dialogue information from multiple **`Session`**s, enabling the Agent to recall context and details from previous conversations. In Blades, the **`memory`** module can be used to implement this. First, a "memory database" needs to be initialized:

```go
memoryStore := memory.NewInMemoryStore()
```
- **NewInMemoryStore()** initializes a Memory instance. Memory is a struct that stores Agent messages:

```go
type Memory struct {
	Content  *blades.Message `json:"content"`
	Metadata map[string]any  `json:"metadata,omitempty"`
}
```

- **NewMemoryTool()** allows the Agent to actively search and retrieve information from the **MemoryStore**. When initializing the Agent later, the **MemoryStore** can be added to the Agent directly via the **`blades.WithTool`** method.

```go
memoryTool, err := memory.NewMemoryTool(memoryStore)
if err != nil {
    log.Fatal(err)
}
```

- Information (`Memory`) can be added to the **MemoryStore** using its `AddMemory` method.
```go
// Add a memory entry
memoryStore.AddMemory(ctx, 
    &memory.Memory{
        Content: blades.AssistantMessage("My favorite project is the Blades Agent kit."),
    },
)
```
### Memory Example
For the complete example, refer to [Memory Usage Example](https://github.com/go-kratos/blades/tree/main/examples/tools-memory).

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
	memoryStore.AddMemory(ctx,
		&memory.Memory{
			Content: blades.AssistantMessage("My favorite project is the Blades Agent kit."),
		},
	)
	memoryStore.AddMemory(ctx,
		&memory.Memory{
			Content: blades.AssistantMessage("My favorite programming language is Go."),
		},
	)
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