---

title: "Session and State"
description: "blades provides storage of contextual conversation history and multimodal content within a single dialogue"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]

---
Agents often need to access conversation history within a single dialogue to ensure what has been said and done, maintaining coherence and avoiding repetition. Blades provides basic functionality for Agents through Session and State.
## Core Concepts
`Session` and `State` are core concepts in Blades used to provide dialogue context information. However, they differ and are suitable for different scenarios.

- **Session**: Represents the current conversation thread, indicating a one-on-one, continuous interaction between the user and the Agent.

- **State**: Stores data within the current conversation (e.g., PDF documents in the dialogue).

The relationship between the two can be illustrated with a vivid analogy:

Imagine you are a detective investigating a "missing diamond" case, and the Agent is your assistant.

**State** is like the sticky notes you carry with you, used to temporarily record important clues during the investigation. For example, if your assistant checks "the last surveillance footage of the diamond," your sticky note records the information: `session.PutState("last_seen_location", "library")`.

**Session** is the entire case file. During the investigation, you use `session := blades.NewSession()` to create a new case file, label it "Diamond Theft Case," and use `runner.Run(ctx, input, blades.WithSession(session))` to tell your assistant: "All our discussions and findings from now on will be recorded in this case file."

## State
**`State`** is essentially a key-value data store **`map[string]any`**. In Blades, you can use the **PutState** method of a session to store data.
```go
session := blades.NewSession()
```
## Session
Creating a `Session` in Blades is straightforward—simply call the **NewSession** method, which can optionally accept State data to store in the conversation.
```go
session := blades.NewSession(states)
```
Here, `states` is of type **`map[string]any`**. Multiple **`State`** contents can be imported into a **`Session`**.
### Session Example
When using **`Session`** in Blades, simply pass the **`Session`** parameter in the **`NewRunner`** method.
```go
package main

import (
	"context"
	"log"
	"os"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/flow"
)

func main() {
	model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
	model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	writerAgent, err := blades.NewAgent(
		"WriterAgent",
		blades.WithModel(model),
		blades.WithDescription("You are a knowledgeable history tutor. Provide detailed and accurate information on historical events."),
	)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("Can you tell me about the causes of World War II?")
	// Create a new session
	session := blades.NewSession()
	// Run the agent
	ctx := context.Background()
	runner := blades.NewRunner(agent)
	output, err := runner.Run(ctx, input, blades.WithSession(session))
	if err != nil {
		log.Fatal(err)
	}
	loopAgent := flow.NewLoopAgent(flow.LoopConfig{
		Name:          "WritingReviewFlow",
		Description:   "An agent that loops between writing and reviewing until the draft is good.",
		MaxIterations: 3,
		Condition: func(ctx context.Context, output *blades.Message) (bool, error) {
			return !strings.Contains(output.Text(), "The draft is good"), nil
		},
		SubAgents: []blades.Agent{
			writerAgent,
			reviewerAgent,
		},
	})
	input := blades.UserMessage("Please write a short paragraph about climate change.")
	runner := blades.NewRunner(loopAgent)
	stream := runner.RunStream(context.Background(), input)
	for message, err := range stream {
		if err != nil {
			log.Fatal(err)
		}
		log.Println(message.Author, message.Text())
	}
}
```

## Best Practices
- Use stable, readable key names: e.g., `draft`, `suggestions`. For complex projects, consider hierarchical naming: `writing.draft`, `review.suggestions`.
- Avoid stuffing entire conversation history into State: State is better suited for "structured/reusable intermediate outputs". For historical dialogue, consider using model messages or summaries.
- Include session for streaming outputs too: If you want to share state across multiple steps, ensure the entire Run/RunStream executes under the same session.
