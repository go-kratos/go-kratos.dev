---
title: "记忆"
description: "blades为Agent提供记忆能力"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/tools-memory","https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]
---
Agent在多次对话中常常需要回忆起之前对话的上下文信息，因此需要对前面的对话信息进行保存并导入到新的对话中，获取之前的对话历史，来确保已经说过和做过什么，避免保持连贯性和避免重复。Blades通过Memory提供基础功能。
## 核心概念
 `Memory` 与 `Session`、`State` 的使用范围有所不同，适合于不同的场景。

- **Memory**：可以检索过去多个session的对话信息，可以让Agent回忆之前对话的上下文信息和细节。

在之前`Session` 和 `State` 举例中已经说明了两者之间的关系，那么 `Memory` 在整个案件的侦破中侦探的旧案件档案库，在破案过程可以查看 `Memory` 中是否记录有无相似的作案手法。（ `相当于知识库` ）

## Memory
**`Memory`** 可以存储多个 **`Session`** 的对话信息，让Agent回忆之前对话的上下文信息和细节。在Blades中，可以用 **`memory`** 模块来实现。首先需要初始化一个“记忆数据库”：

```go
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
// Add a memory entry
memoryStore.AddMemory(ctx, 
    &memory.Memory{
        Content: blades.AssistantMessage("My favorite project is the Blades Agent kit."),
    },
)
```
### Memory示例
完整示例参照 [Memory使用示例](https://github.com/go-kratos/blades/tree/main/examples/tools-memory) 。

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
	memoryStore.AddMemory(ctx,
		&memory.Memory{
			Content: blades.AssistantMessage("My favorite project is the Blades Agent kit."),
		},
	)
	memoryStore.AddMemory(ctx,
		&memory.Memory{
			Content: blades.AssistantMessage("My favorite programming language is Go."),
		},
	)
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
