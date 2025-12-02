---
title: "会话与状态"
description: "blades为在单次对话中存储上下文对话记录和多模态内容"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---

## 核心概念

在多轮对话或多 Agent 协作流程里，系统需要一个地方来承载上下文并沉淀中间产物，这样后续步骤才能“接着上一步继续做”，而不是每次从零开始。

- Session（会话）：一次对话线程的容器。它负责在一次 Run/RunStream 的链路里，维护这一轮交互共享的上下文与状态。
- State（状态）：会话内的共享数据存储，用于保存“可复用的中间结果”（例如草稿 draft、审阅建议 suggestions、工具输出、解析后的文本等）。

一句话理解：
- Session = 运行时上下文容器
- State = 容器里的键值数据（map[string]any）

## State

在 Blades 中，State 本质上可以理解为：`map[string]any`

它用于跨步骤（跨 Agent）共享数据：上一步写入，下一个 Agent 的 Prompt 模板直接读取。

> 你原文里单独出现的 “Kratos” 一行看起来像误粘贴，建议删掉，避免读者困惑。

#### Agent：保存运行结果
在 Agent 的配置里，可以通过 `WithOutputKey` 方法，指定某个步骤的输出结果要写入 State 里的哪个 key。

比如 WriterAgent 负责产出草稿，把输出落到 draft：
```go
writerAgent, err := blades.NewAgent(
  "WriterAgent",
  blades.WithModel(model),
  blades.WithInstruction("Draft a short paragraph on climate change."),
  blades.WithOutputKey("draft"),
)
```
同理 ReviewerAgent 的输出落到 suggestions：
```go
reviewerAgent, err := blades.NewAgent(
  "ReviewerAgent",
  blades.WithModel(model),
  blades.WithInstruction("Review the draft and suggest improvements."),
  blades.WithOutputKey("suggestions"),
)
```

#### 在 Prompt 里读取 State：模板变量直接引用
当你在 WithInstruction 里写 Go template（{{.draft}} / {{.suggestions}}），Blades 会把当前 Session 的 State 注入模板上下文，于是你能像下面这样直接使用：
```go
**Draft**
{{.draft}}

Here are the suggestions to consider:
{{.suggestions}}
```

## Session

创建 Session（可选初始化 State）：
```go
session := blades.NewSession()
```
也可以带着初始状态启动（常用于：已有草稿、已有用户信息、或恢复一次中断的流程）：
```go
session := blades.NewSession(map[string]any{
  "draft": "Climate change refers to long-term shifts in temperatures and weather patterns...",
})
```

#### 将 Session 注入 Runner：让同一链路共享 State
只有把 session 注入运行（blades.WithSession(session)），你前面说的 State 才会在该次运行链路里共享起来。

- 如果你用 runner.Run(...)：把 blades.WithSession(session) 作为 option 传入即可。
- 如果你用 runner.RunStream(...)：同样可以传入 session option。

#### 完整示例：Writer/Reviewer 在 Loop 中共享 draft & suggestions

你的代码本质是一个“写作-审阅”闭环：
1. WriterAgent 生成草稿 → 写入 draft
2. ReviewerAgent 给建议 → 写入 suggestions
3. Loop 条件检查：如果 reviewer 认为 “draft is good” 则停止，否则继续迭代
4. 下一轮 WriterAgent 会在 instruction 里读到 draft 与 suggestions，进行定向改写

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

## 最佳实践
- key 命名要稳定、可读：如 draft、suggestions，复杂项目建议用层级：writing.draft、review.suggestions
- 避免把大段历史对话全塞进 State：State 更适合“结构化/可复用中间产物”，历史对话建议走模型消息或摘要
- 流式输出也要带 session：只要希望多步共享状态，就让整个 Run/RunStream 在同一个 session 下执行
