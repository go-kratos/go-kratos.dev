---
title: "Agent Routing"
description: ""
---
Agent Routing是Blades框架中用于实现路由跳转的核心组件，它可以根据前者的输入信息判断接下来该执行哪一部分操作。你可以使用Blades已经封装好的HandoffAgent实现路由逻辑，也可以自己定制属于自己的路由逻辑。

## HandoffAgent 实现路由
**`HandoffAgent`** 封装了路由跳转逻辑，只需要传入参数即可：

- `name` : `handoffAgent` 的名称
- `description` : `handoffAgent` 的描述说明
- `model` : `blades.ModelProvider`
- `subAgents` : subAgent列表
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
在 **`handoffAgent`** 执行过程中，会在内部自动选择合适的 `SubAgent` 执行，若没有找到合适的 `Subgent` 则会在 `err` 中返回结果：
```shell
target agent no found:
``` 
## 自定义路由逻辑
### 核心概念
Agent Routing 是Blades工作流中不可或缺的存在，在执行智能路由调度过程中十分重要,首先定义`workflow`的结构类型：
```go
type RoutingWorkflow struct {
	blades.Agent
	routes map[string]string
	agents map[string]blades.Agent
}
```
### 完整示例
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
#### 参数说明
`RoutingWorkflow` 包含三个参数，分别是路由agent、路由名、路由对应的agent
### 路由agent

- 类型: `blades.Agent`
- 作用: 根据传入的参数动态决定该导航到哪一个agent

#### routes

- 类型: `map[string]string`
- 作用: 存放路由信息表，说明每一个agent对应的名称及说明。

可传入参数：
```go
routes = map[string]string{
    "math_agent": "You provide help with math problems. Explain your reasoning at each step and include examples.",
    "geo_agent":  "You provide assistance with geographical queries. Explain geographic concepts, locations, and spatial relationships clearly.",
}
```

#### agents

- 类型: `map[string]blades.Agent`
- 作用: 存放agent信息表，说明每一个agent的名称和对应agent实例。

具体结构形式如下：
```go
agents = map[string]blades.Agent{
    "math_agent": mathAgent,
    "geo_agent":  geoAgent,
}
```

### 使用方法
接下来讲解如何在Blades中实现Agent routing

#### 1. 构建初始化Workflow函数
在初始化 **`workflow`** 过程中初始化对应的agent实例。
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
#### 2. 设置路由选择逻辑
在 **`RoutingWorkflow`** 结构体中添加一个方法 **`selectRoute`**，用于根据用户原始的输入信息 `invocation` 选择合适的路由。
:::note
在这里设置路由的提示词时，对提示词的精准度要求高，建议直接使用以下固定提示词模板。
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
此处根据路由agent执行后的返回值选择对应的agent多作为 **`selectRoute`** 方法的返回值。
#### 3. 执行路由选择
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
#### 4. 运行workflow
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