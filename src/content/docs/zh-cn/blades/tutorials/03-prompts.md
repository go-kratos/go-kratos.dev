---
title: "提示词"
description: "提示词"
references: ["https://github.com/go-kratos/blades/blob/main/examples/image-to-text","https://github.com/go-kratos/blades/tree/main/examples/prompt-basic","https://github.com/go-kratos/blades/tree/main/examples/prompt-instructions","https://github.com/go-kratos/blades/tree/main/examples/prompt-invocation","https://github.com/go-kratos/blades/tree/main/examples/prompt-template"]
---
在 Blades 框架中，Prompt 是与大型语言模型（LLM）交互的核心组件。它表示用户与助手之间交换的消息序列，支持多种类型的消息（系统消息、用户消息、助手消息）以及模板化功能，使开发者能够构建动态和上下文感知的 AI 应用程序。	

### 角色
大语言模型中，角色（Role）表示消息的发送者，主要有以下几种角色：

#### RoleUser
即用户角色，代表人类用户或外部系统发起的输入。用户消息可以使用 `blades.UserMessage` 添加，该函数定义如下：
```go
func UserMessage[T contentPart](parts ...T) *Message {
	return &Message{ID: NewMessageID(), Role: RoleUser, Author: "user", Parts: Parts(parts...)}
}
```
##### 用途
	1. 提出问题、发出指令、提供上下文信息。
	2. 在多轮对话中，每次用户的新输入都应标记为 RoleUser。
:::note
在智能体系统中，RoleUser 也可能来自其他 Agent 或上游系统的调用，不一定是真人。
:::
#### RoleSystem
即系统角色，由系统预设的指令，用于控制模型的行为、设定任务目标或提供全局上下文。
##### 用途
	1. 定义助手的身份（如“你是一个Go编程专家”）。
	2. 设定输出格式、语言风格、安全边界等。
	3. 在工作流（Workflow）开始前注入任务描述或约束条件。
#### RoleAssistant
即助手角色，代表大模型或智能体自身生成的响应。
##### 用途
	1. 回答用户问题。
	2. 调用工具（通过函数调用或 Tool Use 协议）。
	3. 在多轮对话中维持上下文连贯性。
##### 关键点
- 所有模型输出都应标记为 RoleAssistant。
- Assistant 可能会主动提出“我需要调用某个工具”，然后由框架执行并返回 RoleTool 消息。
#### RoleTool
即工具角色，表示外部工具、函数或 API 执行后的结果。
##### 用途
	1. 将工具调用的返回值反馈给模型，供其继续推理。
	2. 实现“思考 → 调用 → 观察 → 再思考”的 ReAct（Reason + Act）循环。

### Message
在 `Blades` 中所有的消息角色都支持输入支持多种消息类型：
- `TextPart` : 纯文本内容
- `FilePart` : 文件引用
- `DataPart` : 文件内容
- `ToolPart` : 工具输出内容

可以使用每个角色对应的方法添加一条或多条信息，这里以 `blades.UserMessage` 为例：
```go
input := blades.UserMessage(
	blades.TextPart{
		Text: "Can you describe the image in logo.svg?",
	},
	blades.FilePart{
		MIMEType: "image/png",
		URI:      "https://go-kratos.dev/images/architecture.png",
	},
)
```
#### TextPart
> 普通文本消息，可以使用 `blades.TextPart` 添加，传递纯文本内容，如用户提问、AI回答。
```go
blades.TextPart{
	Text: "Can you describe the image in logo.svg?",
}
```
#### FilePart
引用一个已存在的文件（不内嵌内容），通过 URI（如本地路径、HTTP URL、S3 链接等）指向该文件。
```go
blades.FilePart{
	MIMEType: "image/png",
	URI:      "https://go-kratos.dev/images/architecture.png",
}
```
##### 适用场景🏹
> 用户在上传很大的文件时，系统只需要保存文件的上传后的路径即可时，选择该方法能很大节约成本，分布式系统中，文件存储在对象存储（如 MinIO、S3）中, **`Agent`** 只需要去访问对应的链接。

##### 优缺点
> 优点：**`TextPart`**  **消息体小**，**传输高效**，**支持大文件（避免内存溢出）**，还可复用已有文件资源。

> 缺点：接收方必须能访问该 URI（权限、网络可达性）；且文件可能被删除或移动，导致失效。

#### DataPart
> 内嵌文件字节（完整内容）,将文件的完整二进制内容直接嵌入消息中。
```go
blades.DataPart{
	Name:     "cat",
	MIMEType: blades.MIMEImagePNG,
	Bytes:    imagesBytes,
}
```
##### 适用场景🏹
> 适用于小文件（如图标、短音频、截图），当然如果要确保数据必须完整且不依赖外部存储也可以选择该类型。用户可以用此类型在测试或本地开发环境过程中，快速传递数据。
:::tip
此外，倘若工具输出生成了新文件（如图表、PDF），需立即返回给模型时，也可以使用该类型。
:::
##### 优缺点
> **`DataPart`** 好就好在无需外部依赖，能够保证**数据一致性**，且方便数据进行序列化和反序列化（如 JSON + Base64）；

> 当然该类型也有弊端，**`DataPart`** 需要上传字节流，消息体积大，比较影响性能，若是上传大文件，可能会导致 `Out of Memory` 或网络请求超时等错误，可能会导致系统稳定性降低。此外，过大的数据传输也会导致占用更多的带宽。
#### ToolPart
工具调用的请求与响应记录,记录一次工具调用的完整生命周期（调用参数 + 执行结果）。 `ToolPart` 的结构定义如下：
```go
blades.ToolPart{
	ID:       "load",
	Name:     "load",
	Request:  `{"city": "Beijing"}`,
	Response: `{"temp": 18, "condition": "sunny"}`,
}
```
##### 适用场景🏹
> 在对话历史中可保留工具交互上下文；此外， **`ToolPart`** 支持多步推理（如：Agent 先调用 A 工具，再基于结果调用 B 工具）。

## 提示词💬
提示词是现今用户与大语言模型交互的桥梁，在此处不讨论如果写一个好的提示词，**`Blades`** 对于提示词的构造有多少方式以对应不同的场景。
### 直接构造
```go
input := blades.UserMessage("What is the capital of France?")
```
`blades.UserMessage` 直接返回一个 `Message` 结构体实例。
### 模板化构造
```go
func buildPrompt(params map[string]any) (string, error) {
	var (
		tmpl = "Respond concisely and accurately for a {{.audience}} audience."
		buf  strings.Builder
	)
	t, err := template.New("message").Parse(tmpl)
	if err != nil {
		return "", err
	}
	if err := t.Execute(&buf, params); err != nil {
		return "", err
	}
	return buf.String(), nil
}
```
> 可以构建一个模板函数，传入对应的参数即可。
```go
prompt, err := buildPrompt(params)
if err != nil {
	log.Fatal(err)
}
input := blades.UserMessage(prompt)
```

## 完整代码示例
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
		"Basic Agent",
		blades.WithModel(model),
		blades.WithInstruction("You can tell user what's in the pictures"),
	)
	if err != nil {
		log.Fatal(err)
	}
	imagesBytes, err := os.ReadFile("img.png")
	if err != nil {
		log.Fatal(err)
	}
	fileLoad := blades.DataPart{
		Name:     "cat",
		MIMEType: blades.MIMEImagePNG,
		Bytes:    imagesBytes,
	}
	input := blades.UserMessage(fileLoad)
	runner := blades.NewRunner(agent)
	output, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}

```

## 最佳实践
- 明确系统指令: 在系统消息中提供清晰、具体的指令，有助于模型更好地理解任务要求。
- 合理使用模板: 利用模板功能可以提高代码复用性和可维护性，特别是在需要动态生成 Prompt 的场景中。
- 管理上下文长度: 注意控制 Prompt 的长度，避免超出模型的最大上下文限制。
- 错误处理: 始终检查模板渲染和 Prompt 构建过程中的错误，确保应用程序的健壮性。
