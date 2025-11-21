---
title: "Memory"
description: "blades provides memory capabilities for Agent"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/tools-memory","https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---
Agents often need to access conversation history to ensure what has been said and done, maintaining coherence and avoiding repetition. Blades provides basic functionality for Agents through Session, State, and Memory.
## Core Concepts
`Session`, `State`, and `Memory` are the core concepts in Blades used to provide memory storage functionality. However, they differ and are suitable for different scenarios.

- **Session**: Represents the current conversation thread, indicating a one-on-one, single, continuous interaction between the user and the Agent.

- **State**: Stores data from the current conversation (e.g., PDF documents in the conversation).

- **Memory**: Can retrieve conversation information from multiple past sessions, allowing the Agent to recall context and details from previous conversations.

The relationship between the three can be illustrated with a vivid analogy:

Imagine you are a detective investigating a "missing diamond" case, and the Agent is your assistant.

**State** is like the sticky notes you carry with you, used to temporarily record important clues from the current investigation. During the investigation, if your assistant checks "the last surveillance footage of the diamond," your sticky note records the information: `session.PutState("last_seen_location", "library")`.

**Session** is the entire case file. During the investigation, you use `session := blades.NewSession()` to take out a new case file, write "Diamond Theft Case" on it, and use `runner := blades.NewRunner(agent, blades.WithSession(session))` to tell your assistant: all our subsequent discussions and findings will be recorded in this case file.

**Memory** is the detective's archive of old case files. During the investigation, you can check the `Memory` to see if there are records of similar modus operandi. (`Equivalent to a knowledge base`)

## State
**`State`** is essentially a key-value data pair storage **`map[string]any`**. In Blades, you can use the session's **PutState** method to store it.
```go
session := blades.NewSession()
session.PutState(agent.Name(), output.Text())
```
## Session
Creating a `Session` in blades is very simple; just execute the **NewSession** method, which can accept the State data to be stored in the conversation.
```go
session := blades.NewSession(states)
```
Here, the type of states is **`map[string]any`**. Multiple **`State`** contents can be imported into a **`Session`**.
### Session Example
When using **`Session`** in blades, simply pass the **`Session`** parameter in the **`NewRunner`** method.
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
		"History Tutor",
		blades.WithModel(model),
		blades.WithInstruction("You are a knowledgeable history tutor. Provide detailed and accurate information on historical events."),
	)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("Can you tell me about the causes of World War II?")
	// Create a new session
	session := blades.NewSession()
	// Run the agent
	runner := blades.NewRunner(agent, blades.WithSession(session))
	output, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```
## Memory
**`Memory`** can store conversation information from multiple **`Session`**s, allowing the Agent to recall context and details from previous conversations. In Blades, this can be implemented using the **`memory`** module. First, you need to initialize a "memory database":

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

- **NewMemoryTool()** allows the Agent to actively search and retrieve information from the **MemoryStore**. When initializing the Agent later, you can directly add the **MemoryStore** to the Agent via the **`blades.WithTool`** method.

```go
memoryTool, err := memory.NewMemoryTool(memoryStore)
if err != nil {
    log.Fatal(err)
}
```

- You can add information (`Memory`) to the **MemoryStore** using its `AddMemory` method.
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
    model := openai.NewModel("gpt-5", openai.Config{
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
