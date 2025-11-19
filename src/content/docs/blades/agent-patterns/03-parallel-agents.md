---
title: "Parallel Agent"
description: "Implementing parallel execution of Agents in Blades"
---
During `workflow` execution, to reduce waiting time, it is often necessary to execute Agents in parallel. The Blades framework provides the **`NewParallelAgent`** method to construct a parallel Agent.
![parallel-agent](../../../../../assets/images/parallel-workflow.png)
## Core Concepts
Using **`NewParallelAgent`** requires passing a parameter of type **`ParallelConfig`**, which has the following structure:
```go
type ParallelConfig struct {
	Name        string
	Description string
	SubAgents   []blades.Agent
}
```
- name: The name of the parallel Agent, used for identification and distinction
- description: The description of the parallel Agent, used to explain its function and purpose
- subAgents: The list of sub-Agents contained in the parallel Agent; these sub-Agents will be executed in parallel
## Execution Flow
**Parallel Agent** uses **`NewParallelAgent`** to instantiate a parallel Agent instance. When running the **parallel Agent**, it will directly loop through and run all Agents in `SubAgents`, using a concurrency-safe but fixed-buffer message queue to collect the streaming output from all Agents, and finally use `yield` to return the results.

Here we use an example to illustrate how to use **Parallel Agent** in **Blades**.
### 1. Create SubAgents
```go
editorAgent1, err := blades.NewAgent(
    "editorAgent1",
    blades.WithModel(model),
    blades.WithInstructions(`Edit the paragraph for grammar.
        **Paragraph:**
        {{.draft}}
    `),
    blades.WithOutputKey("grammar_edit"),
)
editorAgent2, err := blades.NewAgent(
    "editorAgent1",
    blades.WithModel(model),
    blades.WithInstructions(`Edit the paragraph for style.
        **Paragraph:**
        {{.draft}}
    `),
    blades.WithOutputKey("style_edit"),
)
```
### 2. Create Parallel Agent
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
### 3. Run Parallel Agent
```go
session := blades.NewSession()
input := blades.UserMessage("Please write a short paragraph about climate change.")
runner := blades.NewRunner(parallelAgent, blades.WithSession(session))
stream := runner.RunStream(context.Background(), input)
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
		blades.WithInstructions(`Edit the paragraph for grammar.
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
		blades.WithInstructions(`Edit the paragraph for style.
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
	runner := blades.NewRunner(parallelAgent, blades.WithSession(session))
	stream := runner.RunStream(context.Background(), input)
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