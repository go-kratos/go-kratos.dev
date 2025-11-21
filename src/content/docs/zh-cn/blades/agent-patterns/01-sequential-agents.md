---
title: "链式 Agent"
description: "Blades中实现Agent的顺序执行"
reference: ["https://github.com/go-kratos/blades/blob/main/examples/workflow-sequential/main.go"]
---
链式Agent是Blades框架中用于实现顺序执行逻辑的重要组件，它将复杂的任务分解为更简单的、更容易管理的子任务。
![alt text](/images/blades/chain-workflow.png)
## 核心概念
链式Agent的核心函数为 **`NewSequentialAgent`** ,用于构建一个顺序工作流，其初始化一个链式工作流时需要输入配置 **`SequentialConfig`** ：

- **name** : 链式Agent的名称
- **description** : 链式Agent的描述说明
- **subAgents** : 子Agent列表，表示顺序执行的子任务列表，按顺序执行
```go
type SequentialConfig struct {
	Name        string
	Description string
	SubAgents   []blades.Agent
}
```
构建一个链式Agent的方式如下：
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
### 何时使用
- 具有清晰顺序步骤的任务
- 当你想要用延迟换取更高的准确性
- 当每一步都建立在前一步的输出之上
### 运行
**`blades.NewRunner`** 方法可以直接接收 `sequentialAgent` 作为输入参数：

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
	writerAgent, err := blades.NewAgent(
		"WriterAgent",
		blades.WithModel(model),
		blades.WithInstruction("Draft a short paragraph on climate change."),
		blades.WithOutputKey("draft"),
	)
	if err != nil {
		log.Fatal(err)
	}
	reviewerAgent, err := blades.NewAgent(
		"ReviewerAgent",
		blades.WithModel(model),
		blades.WithInstruction(`Review the draft and suggest improvements.
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