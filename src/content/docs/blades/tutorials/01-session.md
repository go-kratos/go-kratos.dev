---
title: "Session and State"
description: "Blades provides storage for contextual conversation history and multimodal content within a single dialogue."
reference: ["https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---
Agents often need to access conversation history within a single dialogue to ensure awareness of what has been said and done, maintaining coherence and avoiding repetition. Blades provides foundational functionality for Agents through Session and State.
## Core Concepts
`Session` and `State` are core concepts in Blades used to provide conversational context information. However, they differ and are suitable for different scenarios.

- **Session**: Represents the current conversation thread, indicating a one-on-one, continuous interaction between the user and the Agent.

- **State**: Stores data within the current conversation (e.g., PDF documents in the dialogue).

## State
**`State`** is essentially a key-value data pair storage **`map[string]any`**. In Blades, you can store it using the **PutState** method of the session.
```go
session := blades.NewSession()
session.PutState(agent.Name(), output.Text())
```
## Session
Creating a `Session` in Blades is straightforward—simply call the **NewSession** method, which can accept State data to be stored in the conversation.
```go
session := blades.NewSession(states)
```
Here, `states` is of type **`map[string]any`**. Multiple **`State`** contents can be imported into a **`Session`**.
### Session Example
When using **`Session`** in Blades, you only need to pass the **`Session`** parameter in the **`NewRunner`** method.
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
	runner := blades.NewRunner(agent)
	output, err := runner.Run(context.Background(), input, blades.WithSession(session))
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```