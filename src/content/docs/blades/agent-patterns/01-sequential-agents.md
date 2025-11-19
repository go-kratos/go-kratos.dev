---
title: "Chain Agent"
description: "Implementing sequential execution of Agents in Blades"

---
Chain Agent is an important component in the Blades framework for implementing sequential execution logic. It decomposes complex tasks into simpler, more manageable sub-tasks.
![alt text](../../../../../assets/images/chain-workflow.png)
## Core Concepts
The core function of the Chain Agent is **`NewSequentialAgent`**, used to build a sequential workflow. When initializing a chain workflow, it requires the input configuration **`SequentialConfig`**:

- **name**: The name of the Chain Agent
- **description**: The description of the Chain Agent
- **subAgents**: The list of sub-agents, representing the list of sequentially executed sub-tasks, executed in order
```go
type SequentialConfig struct {
	Name        string
	Description string
	SubAgents   []blades.Agent
}
```
The way to build a Chain Agent is as follows:
```go
sequentialAgent := flow.NewSequentialAgent(
    flow.SequentialConfig{
        Name: "WritingReviewFlow",
        SubAgents: []blades.Agent{
            writerAgent,
            reviewerAgent,
    },
})
```
### When to Use
- Tasks with clear sequential steps
- When you want to trade latency for higher accuracy
- When each step builds upon the output of the previous step
### Execution
The **`blades.NewRunner`** method can directly receive `sequentialAgent` as an input parameter:

```go
input := blades.UserMessage("Please write a short paragraph about climate change.")
runner := blades.NewRunner(sequentialAgent)
stream := runner.RunStream(context.Background(), input)
for message, err := range stream {
    if err != nil {
        log.Fatal(err)
    }
    log.Println(message.Author, message.Text())
}
```

### Complete Example
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
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	writerAgent, err := blades.NewAgent(
		"WriterAgent",
		blades.WithModel(model),
		blades.WithInstructions("Draft a short paragraph on climate change."),
		blades.WithOutputKey("draft"),
	)
	if err != nil {
		log.Fatal(err)
	}
	reviewerAgent, err := blades.NewAgent(
		"ReviewerAgent",
		blades.WithModel(model),
		blades.WithInstructions(`Review the draft and suggest improvements.
			Draft: {{.draft}}`),
	)
	if err != nil {
		log.Fatal(err)
	}
	sequentialAgent := flow.NewSequentialAgent(
		flow.SequentialConfig{
			Name: "WritingReviewFlow",
			SubAgents: []blades.Agent{
				writerAgent,
				reviewerAgent,
			},
		})
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("Please write a short paragraph about climate change.")
	runner := blades.NewRunner(sequentialAgent)
	stream := runner.RunStream(context.Background(), input)
	for message, err := range stream {
		if err != nil {
			log.Fatal(err)
		}
		log.Println(message.Author, message.Text())
	}
}
```