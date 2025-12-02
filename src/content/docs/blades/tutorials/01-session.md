---
title: "Session and State"
description: "blades provides storage for contextual conversation history and multimodal content within a single conversation"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---

## Core Concepts

In multi-turn conversations or multi-Agent collaboration workflows, the system needs a place to carry context and accumulate intermediate outputs, so that subsequent steps can "continue from the previous step" rather than starting from scratch each time.

- Session: A container for a conversation thread. It is responsible for maintaining the shared context and state for a single interaction chain within one Run/RunStream.
- State: Shared data storage within a session, used to save "reusable intermediate results" (e.g., draft, suggestions, tool outputs, parsed text, etc.).

In a nutshell:
- Session = Runtime context container
- State = Key-value data inside the container (map[string]any)

## State: Persisting Intermediate Results as Key-Value Pairs

### Data Structure
In Blades, State can essentially be understood as: `map[string]any`

It is used to share data across steps (across Agents): the previous step writes, and the next Agent's Prompt template reads directly.

> The standalone "Kratos" line in your original text appears to be a mis-paste; it is recommended to delete it to avoid confusing readers.

### Writing to State: Using WithOutputKey to Store Output Under a Specific Key
In an Agent's configuration, you can use the `WithOutputKey` method to specify which key in the State a particular step's output should be written to.

For example, a WriterAgent responsible for producing a draft writes its output to the key `draft`:
```go
writerAgent, err := blades.NewAgent(
  "WriterAgent",
  blades.WithModel(model),
  blades.WithInstruction("Draft a short paragraph on climate change."),
  blades.WithOutputKey("draft"),
)
```
Similarly, a ReviewerAgent writes its output to the key `suggestions`:
```go
reviewerAgent, err := blades.NewAgent(
  "ReviewerAgent",
  blades.WithModel(model),
  blades.WithInstruction("Review the draft and suggest improvements."),
  blades.WithOutputKey("suggestions"),
)
```

### Reading State in Prompts: Directly Referencing Template Variables
When you write Go templates ({{.draft}} / {{.suggestions}}) in WithInstruction, Blades injects the current Session's State into the template context, allowing you to use them directly like this:
```go
**Draft**
{{.draft}}

Here are the suggestions to consider:
{{.suggestions}}
```

## Session: Creating, Initializing, and Reusing Within a Single Execution Chain

### Creating a Session (Optionally Initializing State)
You can create an empty session:
```go
session := blades.NewSession()
```
Or start with an initial state (commonly used when there is already a draft, user information, or when resuming an interrupted workflow):
```go
session := blades.NewSession(map[string]any{
  "draft": "Climate change refers to long-term shifts in temperatures and weather patterns...",
})
```

### Injecting Session into Runner: Sharing State Across the Same Chain
Only by injecting the session into the run (blades.WithSession(session)) will the State you mentioned earlier be shared throughout that execution chain.

- If you use runner.Run(...): pass blades.WithSession(session) as an option.
- If you use runner.RunStream(...): similarly, you can pass the session option.

## Complete Example: Writer/Reviewer Sharing draft & suggestions in a Loop

Your code essentially implements a "writing-review" closed loop:
1. WriterAgent generates a draft → writes to `draft`
2. ReviewerAgent provides suggestions → writes to `suggestions`
3. Loop condition check: if the reviewer thinks "draft is good", stop; otherwise, continue iterating
4. In the next iteration, WriterAgent reads `draft` and `suggestions` in its instruction for targeted revision

```go
package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/flow"
)

func main() {
	model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	writerAgent, err := blades.NewAgent(
		"WriterAgent",
		blades.WithModel(model),
		blades.WithInstruction(`Draft a short paragraph on climate change.
			{{if .suggestions}}	
			**Draft**
			{{.draft}}

			Here are the suggestions to consider:
			{{.suggestions}}
			{{end}}
		`),
		blades.WithOutputKey("draft"),
	)
	if err != nil {
		log.Fatal(err)
	}
	reviewerAgent, err := blades.NewAgent(
		"ReviewerAgent",
		blades.WithModel(model),
		blades.WithInstruction(`Review the draft and suggest improvements.
			If the draft is good, respond with "The draft is good".

			**Draft**
			{{.draft}}	
		`),
		blades.WithOutputKey("suggestions"),
	)
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
- Avoid stuffing entire conversation history into State: State is better suited for "structured/reusable intermediate outputs." For historical conversation, consider using model messages or summaries.
- Include session even for streaming output: If you want state to be shared across multiple steps, ensure the entire Run/RunStream executes under the same session.