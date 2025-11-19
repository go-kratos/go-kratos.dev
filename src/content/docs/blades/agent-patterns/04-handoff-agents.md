---
title: "Routing Agent"
description: "Implementing Agent routing in Blades"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/workflow-handoff/main.go"]
---
Agent Routing is the core component in the Blades framework for implementing route transitions. It can determine which operation to execute next based on the input information from the previous step. You can use the pre-packaged HandoffAgent in Blades to implement routing logic, or customize your own routing logic.

## HandoffAgent Implementation
**`HandoffAgent`** encapsulates the routing transition logic, requiring only parameter input:

- `name` : The name of the `handoffAgent`
- `description` : The description of the `handoffAgent`
- `model` : `blades.ModelProvider`
- `subAgents` : List of subAgents

```go
agent, err := flow.NewHandoffAgent(flow.HandoffConfig{
    Name:        "TriageAgent",
    Description: "You determine which agent to use based on the user's homework question",
    Model:       model,
    SubAgents: []blades.Agent{
        mathTutorAgent,
        historyTutorAgent,
    },
})
```
During the execution of **`handoffAgent`**, it will automatically select the appropriate `SubAgent` internally. If no suitable `SubAgent` is found, the result will be returned in `err`:
```shell
target agent no found:
``` 
## Custom Routing Logic
### Core Concepts
Agent Routing is an indispensable part of the Blades workflow and is crucial during intelligent routing scheduling. First, define the structure type of `workflow`:
```go
type RoutingWorkflow struct {
	blades.Agent
	routes map[string]string
	agents map[string]blades.Agent
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
	mathTutorAgent, err := blades.NewAgent(
		"MathTutor",
		blades.WithDescription("An agent that helps with math questions"),
		blades.WithInstructions("You are a helpful math tutor. Answer questions related to mathematics."),
		blades.WithModel(model),
	)
	if err != nil {
		log.Fatal(err)
	}
	historyTutorAgent, err := blades.NewAgent(
		"HistoryTutor",
		blades.WithDescription("An agent that helps with history questions"),
		blades.WithInstructions("You are a helpful history tutor. Answer questions related to history."),
		blades.WithModel(model),
	)
	if err != nil {
		log.Fatal(err)
	}
	agent, err := flow.NewHandoffAgent(flow.HandoffConfig{
		Name:        "TriageAgent",
		Description: "You determine which agent to use based on the user's homework question",
		Model:       model,
		SubAgents: []blades.Agent{
			mathTutorAgent,
			historyTutorAgent,
		},
	})
	if err != nil {
		log.Fatal(err)

	}
	input := blades.UserMessage("What is the capital of France?")
	runner := blades.NewRunner(agent)
	output, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```
#### Parameter Description
`RoutingWorkflow` contains three parameters: the routing agent, route names, and the corresponding agents for each route.
### Routing Agent

- Type: `blades.Agent`
- Function: Dynamically decides which agent to navigate to based on the input parameters.

#### routes

- Type: `map[string]string`
- Function: Stores the routing information table, describing the name and description of each agent.

Available parameters:
```go
routes = map[string]string{
    "math_agent": "You provide help with math problems. Explain your reasoning at each step and include examples.",
    "geo_agent":  "You provide assistance with geographical queries. Explain geographic concepts, locations, and spatial relationships clearly.",
}
```

#### agents

- Type: `map[string]blades.Agent`
- Function: Stores the agent information table, describing the name and corresponding agent instance for each agent.

Specific structure form:
```go
agents = map[string]blades.Agent{
    "math_agent": mathAgent,
    "geo_agent":  geoAgent,
}
```

### Usage Method
Next, we explain how to implement Agent routing in Blades.

#### 1. Build the Workflow Initialization Function
Initialize the corresponding agent instances during the **`workflow`** initialization process.
```go
func NewRoutingWorkflow(routes map[string]string) (*RoutingWorkflow, error) {
	model := openai.NewModel("deepseek-chat", openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	router, err := blades.NewAgent(
		"triage_agent",
		blades.WithModel(model),
		blades.WithInstructions("You determine which agent to use based on the user's homework question"),
	)
	if err != nil {
		return nil, err
	}
	agents := make(map[string]blades.Agent, len(routes))
	for name, instructions := range routes {
		agent, err := blades.NewAgent(
			name,
			blades.WithModel(model),
			blades.WithInstructions(instructions),
		)
		if err != nil {
			return nil, err
		}
		agents[name] = agent
	}
	return &RoutingWorkflow{
		Agent:  router,
		routes: routes,
		agents: agents,
	}, nil
}
```
#### 2. Set Routing Selection Logic
Add a method **`selectRoute`** to the **`RoutingWorkflow`** struct, used to select the appropriate route based on the user's original input information `invocation`.
:::note
When setting the routing prompt here, high precision is required for the prompt. It is recommended to directly use the following fixed prompt template.
:::
```go
func (r *RoutingWorkflow) selectRoute(ctx context.Context, invocation *blades.Invocation) (blades.Agent, error) {
	var buf strings.Builder
	buf.WriteString("You are a routing agent.\n")
	buf.WriteString("Choose the single best route key for handling the user's request.\n")
	buf.WriteString("User message: " + invocation.Message.Text() + "\n")
	buf.WriteString("Available route keys (choose exactly one):\n")
	routes, err := json.Marshal(r.routes)
	if err != nil {
		return nil, err
	}
	buf.WriteString(string(routes))
	buf.WriteString("\nOnly return the name of the routing key.")
	for res, err := range r.Agent.Run(ctx, &blades.Invocation{Message: blades.UserMessage(buf.String())}) {
		if err != nil {
			return nil, err
		}
		choice := strings.TrimSpace(res.Text())
		if a, ok := r.agents[choice]; ok {
			return a, nil
		}
	}
	return nil, fmt.Errorf("no route selected")
}
```
Here, the corresponding agent is selected based on the return value after the routing agent executes, and this agent is returned as the result of the **`selectRoute`** method.
#### 3. Execute Route Selection
```go
func (r *RoutingWorkflow) Run(ctx context.Context, invocation *blades.Invocation) blades.Generator[*blades.Message, error] {
	return func(yield func(*blades.Message, error) bool) {
		agent, err := r.selectRoute(ctx, invocation)
		if err != nil {
			yield(nil, err)
			return
		}
		stream := agent.Run(ctx, invocation)
		for msg, err := range stream {
			if !yield(msg, err) {
				break
			}
		}
	}
}
```
#### 4. Run the Workflow
```go
func main() {
	var (
		routes = map[string]string{
			"math_agent": "You provide help with math problems. Explain your reasoning at each step and include examples.",
			"geo_agent":  "You provide assistance with geographical queries. Explain geographic concepts, locations, and spatial relationships clearly.",
		}
	)
	routing, err := NewRoutingWorkflow(routes)
	if err != nil {
		log.Fatal(err)
	}
	// Example prompt that will be routed to the history_agent
	input := blades.UserMessage("What is the capital of France?")
	runner := blades.NewRunner(routing)
	res, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(res.Text())
}
```