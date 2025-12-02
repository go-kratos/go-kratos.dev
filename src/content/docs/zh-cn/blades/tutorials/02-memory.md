---
title: "记忆"
description: "blades为Agent提供记忆能力"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/tools-memory","https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---

在多轮、多次会话中，Agent 往往需要“记住以前发生过什么”：例如用户偏好、历史结论、曾确认过的事实等。Blades 提供 Memory 能力，用于跨多个 Session 进行信息存储与检索，让 Agent 在新对话里也能“回忆”上下文，从而减少重复提问、提升一致性。

## Memory 解决什么问题？

- Session / State 解决的是“当前对话线程内”的组织与临时数据管理（教程在上一章展开）。
- Memory 面向的是“跨多个 session 的历史信息”，可被检索出来辅助当前回答，可理解为 Agent 的“可检索档案库/知识库”

## 让 Agent 具备记忆检索能力
Blades 的 Memory 使用流程可以概括为 4 步：
1. 创建 MemoryStore（记忆库）
2. 创建 MemoryTool（让 Agent 能主动检索记忆）
3. 把 MemoryTool 注入 Agent（WithTools），再运行对话

## 创建记忆数据库

NewInMemoryStore() 会创建一个内存版的 MemoryStore，适合示例与本地开发。

```go
memoryStore := memory.NewInMemoryStore()
```

## 创建 Agent 并添加记忆工具

在创建 Agent 配置 `记忆工具`（示例使用 blades.WithTools(memoryTool)），并在 Instruction 里提示模型“必要时使用 Memory 工具进行查询记忆内容”。

```go
package main

import (
	"context"
	"log"
	"os"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/memory"
)

func main() {
	ctx := context.Background()
	memoryStore := memory.NewInMemoryStore()
	memoryTool, err := memory.NewMemoryTool(memoryStore)
	if err != nil {
		log.Fatal(err)
	}
	memoryStore.AddMemory(ctx, &memory.Memory{Content: blades.AssistantMessage("My favorite project is the Blades Agent kit.")})
	memoryStore.AddMemory(ctx, &memory.Memory{Content: blades.AssistantMessage("My favorite programming language is Go.")})
	// Create an agent with memory tool
	model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	agent, err := blades.NewAgent(
		"MemoryRecallAgent",
		blades.WithModel(model),
		blades.WithInstruction("Answer the user's question. Use the 'Memory' tool if the answer might be in past conversations."),
		blades.WithTools(memoryTool),
	)
	if err != nil {
		log.Fatal(err)
	}
	// Example conversation in memory
	input := blades.UserMessage("What is my favorite project?")
	runner := blades.NewRunner(agent)
	output, err := runner.Run(ctx, input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```
