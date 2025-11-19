---
title: "Loop Agent"
description: "Implementing Agent loop execution in Blades"

---
Loop Agent is an important component in the Blades framework for implementing loop execution logic. The Loop Agent decides whether to continue executing a task based on the return value of a condition function. This pattern is very suitable for scenarios that require repeated processing until a goal is achieved.
![alt text](../../../../../assets/images/loop-workflow.png)
## Core Concepts
To implement loop logic in Blades, you can directly use the pre-packaged **`NewLoopAgent`** function to initialize a Loop Agent. You need to pass the parameter `LoopConfig`, which has the following structure:
```go
type LoopConfig struct {
	Name          string
	Description   string
	MaxIterations int
	Condition     LoopCondition
	SubAgents     []blades.Agent
}
```

- name : The name of the Loop Agent, used to identify and distinguish different Loop Agents
- description : The description of the Loop Agent, used to explain the purpose and function of the Loop Agent
- maxIterations : The maximum number of iterations for the Loop Agent, to prevent infinite loops
- condition : The termination condition for the Loop Agent. Its parameter type is **LoopCondition**, which is a function type defined as follows. The input parameters are consistent with the Agent's Run function:
```go
type LoopCondition func(ctx context.Context, output *blades.Message) (bool, error)
```
- subAgents : The list of sub-agents contained within the Loop Agent. These sub-agents will be executed in a loop.

## Execution Flow
### 1. Create SubAgents
Use `blades.NewAgent` to create multiple sub-agents, each assigned a specific task. Here, we construct a writing agent for drafting and a reviewing agent for evaluation as an example.
:::note
If you want multiple sub-agents to pass messages between them, you should align their input and output parameters accordingly. In this example, the output of `writeAgent` is passed as the parameter `draft`, and the output of `reviewerAgent` is passed as the parameter `suggestions`.
:::
```go
model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
    APIKey: os.Getenv("OPENAI_API_KEY"),
})
writerAgent, err := blades.NewAgent(
    "WriterAgent",
    blades.WithModel(model),
    blades.WithInstructions(`Draft a short paragraph on climate change.
        {{if .suggestions}}	
        **Draft**
        {{.draft}}

        Here are the suggestions to consider:
        {{.suggestions}}
        {{end}}
    `),
    blades.WithOutputKey("draft"),
)
reviewerAgent, err := blades.NewAgent(
    "ReviewerAgent",
    blades.WithModel(model),
    blades.WithInstructions(`Review the draft and suggest improvements.
        If the draft is good, respond with "The draft is good".

        **Draft**
        {{.draft}}	
    `),
    blades.WithOutputKey("suggestions"),
)
```
### 2. Create the Loop Agent
When creating the Loop Agent, you should set the maximum number of iterations to avoid infinite loops. In this example, the maximum number of iterations is set to 3, and the loop terminates if the word "good" appears.

```go
loopAgent := flow.NewLoopAgent(flow.LoopConfig{
    Name:          "WritingReviewFlow",
    Description:   "An agent that loops between writing and reviewing until the draft is good.",
    MaxIterations: 3,
    Condition: func(ctx context.Context, output *blades.Message) (bool, error) {
        return !strings.Contains(output.Text(), "good"), nil
    },
    SubAgents: []blades.Agent{
        writerAgent,
        reviewerAgent,
    },
})
```
### 3. Run the Loop Agent
In this example, when running the Loop Agent, a Runner is created and its RunStream method is called, passing the context and input message. This returns a message stream, and iterating over this stream allows you to obtain the output results from each Agent.
```go
input := blades.UserMessage("Please write a short paragraph about climate change.")
runner := blades.NewRunner(loopAgent)
stream := runner.RunStream(context.Background(), input)
for message, err := range stream {
    if err != nil {
        log.Fatal(err)
    }
    log.Println(message.Author, message.Text())
}
```
## Best Practices
- **Reasonable Condition Design**: The loop condition should accurately reflect the task completion status to avoid conditions that can never be met.
- **Set Appropriate Maximum Iterations**: Set a reasonable upper limit based on the business scenario to prevent resource waste.
- **Comprehensive Error Handling**: Consider error handling in both the condition function and task execution to avoid infinite loops caused by exceptions.
- **State Transfer Optimization**: Properly utilize input and output parameters to transfer state information, ensuring that each iteration processes based on the latest state.

## Complete Example
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
		blades.WithInstructions(`Draft a short paragraph on climate change.
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
		blades.WithInstructions(`Review the draft and suggest improvements.
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
			return !strings.Contains(output.Text(), "good"), nil
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