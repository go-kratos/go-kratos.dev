---
title: "并行 Agent"
description: "Blades中实现Agent的并行执行"
---
在 `workflow` 执行过程中，为减少等待时间常常需要并行执行Agent，Blades框架提供了 **`NewParallelAgent`** 方法构建并行Agent。
![parallel-agent](../../../../../assets/images/parallel-workflow.png)
## 核心概念
使用 **`NewParallelAgent`** 需要传递参数类型 **`ParallelConfig`** ,该类型结构如下：
```go
type ParallelConfig struct {
	Name        string
	Description string
	SubAgents   []blades.Agent
}
```
- name: 并行Agent的名称，用于标识和区分
- description: 并行Agent的描述，用于说明其功能和用途
- subAgents: 并行Agent包含的子Agent列表，这些子Agent将按并行执行
## 运行流程
**并行Agent** 使用 **`NewParallelAgent`** 实例化一个并行Agent实例，在运行 **并行Agent** 时会直接循环运行 `SubAgents` 内的所有Agent，并使用并发安全但缓冲固定的的消息队列收集所有Agent的流式输出，最后使用 `yield` 返回结果。

在此处我们使用一个示例说明在 **Blades** 中该如何使用 **并行Agent**
### 1. 创建SubAgents
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
### 2. 创建并行Agent
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
### 3. 运行并行Agent
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
### 完整代码
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