---
title: "循环 Agent"
description: "Blades中实现Agent的循环执行"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/workflow-loop/main.go"]
---
循环Agent是Blades框架中用于实现循环执行逻辑的重要组件，循环Agent基于条件函数的返回值决定是否继续执行某个任务。这种模式非常适合需要重复处理直到达成目标的场景。
![alt text](/images/blades/loop-workflow.png)
## 核心概念
在Blades中实现循环逻辑，可直接使用已经封装好的 **`NewLoopAgent`** 函数初始化一个循环Agent，需要传入参数 `LoopConfig` ,结构如下：
```go
type LoopConfig struct {
	Name          string
	Description   string
	MaxIterations int
	Condition     LoopCondition
	SubAgents     []blades.Agent
}
```

- name : 循环Agent的名称，用于标识和区分不同的循环Agent
- description : 循环Agent的描述，用于说明循环Agent的用途和功能
- maxIterations : 循环Agent的最大迭代次数，防止无限循环
- condition : 循环Agent的终止条件，其参数类型为 **LoopCondition** ，该结构为函数类型如下，输入参数与Agent的Run函数一致：
```go
type LoopCondition func(ctx context.Context, output *blades.Message) (bool, error)
```
- subAgents : 循环Agent包含的子Agent列表，这些子Agent将按循环执行

## 运行流程
### 1. 创建SubAgents
使用 `blades.NewAgent` 创建多个子Agent，分别制定对应的任务。在此处举例构建一个写作Agent进行写作和一个审阅Agent进行评判。
:::note
若想让多个子Agent进行消息传递，应当对应其输入输出参数。在此处将 `writeAgent` 的输出作为参数 `draft`,将reviewerAgent的输出作为参数 `suggestions`。
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
### 2. 创建循环Agent
创建循环Agent时应当设置最大循环次数，避免无限循环。此处例子中设置的最大循环次数为3，且设置若出现“good”则终止循环。

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
### 3. 运行循环Agent
在此处例子中运行循环Agent时，创建了一个Runner并调用其RunStream方法，传入上下文和输入消息，即可得到一个消息流，遍历该消息流即可获取每个Agent的输出结果。
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
## 最佳实践
- **合理的条件设计**: 循环条件应能准确反映任务完成状态，避免永远无法满足的条件
- **设置合适的最大迭代次数**: 根据业务场景设置合理的上限，防止资源浪费
- **完善的错误处理**: 在条件函数和执行任务中都要考虑错误处理，避免因异常导致的无限循环
- **状态传递优化**: 合理利用输入输出参数传递状态信息，确保每次迭代都能基于最新状态进行处理

## 完整示例
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
