---
title: "Parallel Agent"
description: "Implementing parallel execution of Agents in Blades"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/workflow-parallel/main.go"]
---
During the execution of a `workflow`, it is often necessary to run Agents in parallel to reduce waiting time. The Blades framework provides the **`NewParallelAgent`** method to construct a parallel Agent.
![parallel-agent](/images/blades/parallel-workflow.png)
## Core Concepts
Using **`NewParallelAgent`** requires passing a parameter of type **`ParallelConfig`**, whose structure is as follows:
```go
type ParallelConfig struct {
	Name        string
	Description string
	SubAgents   []blades.Agent
}
```
- name: The name of the parallel Agent, used for identification and distinction.
- description: A description of the parallel Agent, explaining its function and purpose.
- subAgents: A list of sub-Agents contained within the parallel Agent; these sub-Agents will be executed in parallel.
## Execution Flow
A **Parallel Agent** is instantiated using **`NewParallelAgent`**. When running the **Parallel Agent**, it directly iterates through and runs all Agents within `SubAgents`, collecting the streaming output from all Agents using a concurrency-safe but fixed-buffer message queue, and finally returns the result using `yield`.

Here, we use an example to illustrate how to use a **Parallel Agent** in **Blades**.
### 1. Create SubAgents
```go
editorAgent1, err := blades.NewAgent(
    "editorAgent1",
    blades.WithModel(model),
    blades.WithInstruction(`Edit the paragraph for grammar.
        **Paragraph:**
        {{.draft}}
    `),
    blades.WithOutputKey("grammar_edit"),
)
editorAgent2, err := blades.NewAgent(
    "editorAgent1",
    blades.WithModel(model),
    blades.WithInstruction(`Edit the paragraph for style.
        **Paragraph:**
        {{.draft}}
    `),
    blades.WithOutputKey("style_edit"),
)
```
### 2. Create a Parallel Agent
```go
parallelAgent := flow.NewParallelAgent(flow.ParallelConfig{
    Name:        "EditorParallelAgent",
    Description: "Edits the drafted paragraph in parallel for grammar and style.",
    SubAgents: []blades.Agent{
        editorAgent1,
        editorAgent2,
    },
})
```
### 3. Run the Parallel Agent
```go
session := blades.NewSession()
input := blades.UserMessage("Please write a short paragraph about climate change.")
runner := blades.NewRunner(parallelAgent)
stream := runner.RunStream(context.Background(), input, blades.WithSession(session))
for message, err := range stream {
    if err != nil {
        log.Fatal(err)
    }
    // Only log completed messages
    if message.Status != blades.StatusCompleted {
        continue
    }
    log.Println(message.Author, message.Text())
}
```
### Complete Code
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
	editorAgent1, err := blades.NewAgent(
		"editorAgent1",
		blades.WithModel(model),
		blades.WithInstruction(`Edit the paragraph for grammar.
			**Paragraph:**
			{{.draft}}
		`),
		blades.WithOutputKey("grammar_edit"),
	)
	if err != nil {
		log.Fatal(err)
	}
	editorAgent2, err := blades.NewAgent(
		"editorAgent1",
		blades.WithModel(model),
		blades.WithInstruction(`Edit the paragraph for style.
			**Paragraph:**
			{{.draft}}
		`),
		blades.WithOutputKey("style_edit"),
	)
	if err != nil {
		log.Fatal(err)
	}
	parallelAgent := flow.NewParallelAgent(flow.ParallelConfig{
		Name:        "EditorParallelAgent",
		Description: "Edits the drafted paragraph in parallel for grammar and style.",
		SubAgents: []blades.Agent{
			editorAgent1,
			editorAgent2,
		},
	})
	session := blades.NewSession()
	input := blades.UserMessage("Please write a short paragraph about climate change.")
	runner := blades.NewRunner(parallelAgent)
	stream := runner.RunStream(context.Background(), input, blades.WithSession(session))
	for message, err := range stream {
		if err != nil {
			log.Fatal(err)
		}
		// Only log completed messages
		if message.Status != blades.StatusCompleted {
			continue
		}
		log.Println(message.Author, message.Text())
	}
}
```