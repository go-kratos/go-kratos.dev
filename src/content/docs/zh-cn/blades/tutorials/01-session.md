---

title: "会话与状态"
description: "blades为在单次对话中存储上下文对话记录和多模态内容"
reference: ["https://github.com/go-kratos/blades/tree/main/examples/state","https://github.com/go-kratos/blades/tree/main/examples/session"]

---
Agent常常需要在单次对话中获取对话历史，来确保已经说过和做过什么，避免保持连贯性和避免重复。Blades通过Session、State 来为Agent提供基础功能。
## 核心概念
`Session`、`State` 是Blades中用于提供对话上下文信息的核心概念。但两者有所不同，适合于不同的场景。

- **Session**：表示当前对话线程，表示用户和Agent时1v1单次、持续的交互。

- **State**：存储当前对话中的数据（例如：对话中的pdf文档等）。

下面用一个生动形象的比喻可以说明三者的关系：

现在你是一名侦探，正在调查一个“失踪的砖石”案件，Agent就是你的小助手。

**State** 就是你随身携带的便签纸，用来临时记录当前调查中的重要线索，在侦查过程中，你的小助手查看了“砖石最后的监控录像”，则你的便签纸就记下了信息：`session.PutState("last_seen_location", "图书馆")` 。

**Session** 则为整个案件的卷宗，在破案过程中使用 `session := blades.NewSession()` 拿出一份新卷宗，写上“钻石失窃案”，并使用 `runner.Run(ctx, input, blades.WithSession(session))` 告诉小助手：我们接下来的讨论和发现都记录在这个卷宗内。

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
	"os"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func main() {
	model := openai.NewModel(os.Getenv("OPENAI_MODEL"), openai.Config{
		APIKey: os.Getenv("OPENAI_API_KEY"),
	})
	agent, err := blades.NewAgent(
		"History Tutor",
		blades.WithModel(model),
		blades.WithDescription("You are a knowledgeable history tutor. Provide detailed and accurate information on historical events."),
	)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage("Can you tell me about the causes of World War II?")
	// Create a new session
	session := blades.NewSession()
	// Run the agent
	ctx := context.Background()
	runner := blades.NewRunner(agent)
	output, err := runner.Run(ctx, input, blades.WithSession(session))
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```