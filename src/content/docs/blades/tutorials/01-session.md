---
title: "Session and State"
description: "blades provides storage for contextual conversation history and multimodal content within a single conversation"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---
Agents often need to access conversation history within a single dialogue to track what has been said and done, ensuring coherence and avoiding repetition. Blades provides basic functionality for Agents through Session and State.
## Core Concepts
`Session` and `State` are core concepts in Blades used to provide conversational context information. However, they differ and are suitable for different scenarios.

- **Session**: Represents the current conversation thread, indicating a one-on-one, continuous interaction between the user and the Agent.

- **State**: Stores data within the current conversation (e.g., PDF documents in the conversation).

The relationship between the two can be illustrated with a vivid analogy:

Imagine you are a detective investigating a "missing diamond" case, and the Agent is your assistant.

**State** is like the sticky notes you carry with you, used to temporarily record important clues during the investigation. For example, if your assistant checks "the last surveillance footage of the diamond," your sticky note records: `session.PutState("last_seen_location", "library")`.

**Session** is the entire case file. During the investigation, you use `session := blades.NewSession()` to create a new case file, label it "Diamond Theft Case," and use `runner := blades.NewRunner(agent, blades.WithSession(session))` to tell your assistant: "All our subsequent discussions and findings will be recorded in this case file."

## State
**`State`** is essentially a key-value data store **`map[string]any`**. In Blades, you can store data using the **PutState** method of the session.
```go
session := blades.NewSession()
session.PutState(agent.Name(), output.Text())
```
## Session
Creating a `Session` in Blades is very simple. Just call the **NewSession** method, which can accept State data to be stored in the conversation.
```go
session := blades.NewSession(states)
```
Here, the type of states is **`map[string]any`**. Multiple **`State`** contents can be imported into a **`Session`**.
### Session Example
When using **`Session`** in Blades, simply pass the **`Session`** parameter in the **`NewRunner`** method.
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
		blades.WithInstructions("You are a knowledgeable history tutor. Provide detailed and accurate information on historical events."),
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