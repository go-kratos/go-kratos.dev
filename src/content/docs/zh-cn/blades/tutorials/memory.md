---
title: "记忆存储"
description: "blades为Agent提供记忆能力"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/tools-memory","https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---
Agent常常需要获取对话历史，来确保已经说过和做过什么，避免保持连贯性和避免重复。Blades通过Session、State 和Memory来为Agent提供基础功能。
## 核心概念
`Session`、`State` 和 `Memory` 是Blades中用于提供记忆存储功能的核心概念。但三者有所不同，适合于不同的场景。

- **Session**：表示当前对话线程，表示用户和Agent时1v1单次、持续的交互。

- **State**：存储当前对话中的数据（例如：对话中的pdf文档等）。

- **Memory**：可以检索过去多个session的对话信息，可以让Agent回忆之前对话的上下文信息和细节。

下面用一个生动形象的比喻可以说明三者的关系：

现在你是一名侦探，正在调查一个“失踪的砖石”案件，Agent就是你的小助手。

**State** 就是你随身携带的便签纸，用来临时记录当前调查中的重要线索，在侦查过程中，你的小助手查看了“砖石最后的监控录像”，则你的便签纸就记下了信息：`session.PutState("last_seen_location", "图书馆")` 。

**Session** 则为整个案件的卷宗，在破案过程中使用 `session := blades.NewSession()` 拿出一份新卷宗，写上“钻石失窃案”，并使用 `runner := blades.NewRunner(agent, blades.WithSession(session))` 告诉小助手：我们接下来的讨论和发现都记录在这个卷宗内。

**Memory** 就是侦探的旧案件档案库，在破案过程可以查看 `Memory` 中是否记录有无相似的作案手法。（ `相当于知识库` ）

## State
**`State`** 实质为存储键值数据对 **`map[string]any`** ,在Blades中可以使用session的 **PutState** 方法存储。
```go
session := blades.NewSession()
session.PutState(agent.Name(), output.Text())
```
## Session
在blades中创建 `Session` 十分简单，只需要执行 **NewSession** 方法,在方法中可传入对话中存储的数据State。
```go
session := blades.NewSession(states)
```
其中states的类型为 **`map[string]any`** 。能够在 **`Session`** 中导入多个 **`State`** 内容。
### Session示例
在blades中使用 **`Session`** 时，只需要在 **`NewRunner`** 方法中传入 **`Session`** 参数即可。
```go
package main

import (
	"context"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func main() {
	agent, err := blades.NewAgent(
		"History Tutor",
		blades.WithModel("qwen-plus"),
		blades.WithInstructions("You are a knowledgeable history tutor. Provide detailed and accurate information on historical events."),
		blades.WithProvider(openai.NewChatProvider()),
	)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("Can you tell me about the causes of World War II?")
	// Create a new session
	session := blades.NewSession()
	// Run the agent
	runner := blades.NewRunner(agent, blades.WithSession(session))
	output, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```
## Memory
**`Memory`** 可以存储多个 **`Session`** 的对话信息，让Agent回忆之前对话的上下文信息和细节。在Blades中，可以用 **`memory`** 模块来实现。首先需要初始化一个“记忆数据库”：
```go
ctx := context.Background()
memoryStore := memory.NewInMemoryStore()
```
- **NewInMemoryStore()** 表示初始化一个Memory实例。Memory是一个存储Agent消息的结构体：
```go
type Memory struct {
	Content  *blades.Message `json:"content"`
	Metadata map[string]any  `json:"metadata,omitempty"`
}
```
- **NewMemoryTool()** 允许Agent主动去 **MemoryStore** 中搜索和检索信息。在后续初始化Agent时，可以直接通过方法 **`blades.WithTool`** 将 **MemoryStore** 添加到Agent中。
```go
memoryTool, err := memory.NewMemoryTool(memoryStore)
if err != nil {
    log.Fatal(err)
}
```
- 通过使用 **MemoryStore** 的 `AddMemory` 方法可以在其中添加信息（ `Memory` ）。
```go
memoryStore.AddMemory(
    ctx, 
    &memory.Memory{Content: blades.AssistantMessage("My favorite project is the Blades Agent kit.")},
    )
// you can add more memories
memoryStore.AddMemory(
		ctx, 
		&memory.Memory{Content: blades.AssistantMessage("My favorite programming language is Go.")},
	)
```
### Memory示例
完整示例参照 [Memory使用示例](https://github.com/go-kratos/blades/tree/main/examples/tools-memory) 。
```go
package main

import (
	"context"
	"log"

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
	memoryStore.AddMemory(
		ctx, 
		&memory.Memory{Content: blades.AssistantMessage("My favorite project is the Blades Agent kit.")},
		)
	memoryStore.AddMemory(
		ctx, 
		&memory.Memory{Content: blades.AssistantMessage("My favorite programming language is Go.")},
	)
	// Create an agent with memory tool
	agent, err := blades.NewAgent(
		"MemoryRecallAgent",
		blades.WithModel("gpt-5"),
		blades.WithInstructions("Answer the user's question. Use the 'Memory' tool if the answer might be in past conversations."),
		blades.WithProvider(openai.NewChatProvider()),
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