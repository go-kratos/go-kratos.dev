---
title: "构建生成式智能体"
---
# 同步调用
使用Blades同步调用让Agent一次返回完整回答。

    行为：同步调用Run发送请求后阻塞等待，直到模型生成完整回复，一次性返回结果。
    返回值：一个完整的Message对象
## 代码示例
:::note
前置条件
1. 安装Blades：`go get github.com/go-kratos/blades`
2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`
:::
### 创建智能体
在Blades中，想要创建一个智能体，使用**NewAgent**方法，该方法用于创建一个新的Agent实例。**Agent**是Blades框架中的核心组件，负责协调模型、工具、提示词等资源来执行各种AI任务。
NewAgent有两个参数，如下：
1. **`name`(string,必需)**:表示Agent的名称，用于识别不同的Agent实例。
2. **`opts`(Options,可选)**:用于配置Agent实例的选项。支持的配置选项包括：
    - **`WithProvider(provider ModelProvider)`**:设置模型提供者，如OpenAI、Claude和Gemini等。
    - **`WithModel(models string)`**:设置默认模型名称。（如 "deepseek-chat"）
    - **`WithTools(tools ...*tools.Tool)`**: 为 Agent 添加可用的工具
    - **`WithInstructions(instructions string)`**: 设置 Agent 的系统指令/角色设定
    - **`WithInputSchema(schema *jsonschema.Schema)`**: 设置输入的格式
    - **`WithOutputSchema(schema *jsonschema.Schema)`**: 设置输出的格式

该方法使用示例如下：
```go
agent := blades.NewAgent(
    "Weather Agent",
    blades.WithModel("deepseek-chat"),
    blades.WithInstructions("You are a helpful assistant that provides weather information."),
    blades.WithProvider(openai.NewChatProvider()),
    blades.WithTools(weatherTool),
)
// Run the agent
runner := blades.NewRunner(agent)
result, err := runner.Run(context.Background(), blades.UserMessage("what is the weather like in Shanghai today?") )
```
### Run
runner.Run 是 Blades 框架中 Agent 的核心执行方法，用于运行一次完整的 AI 交互流程。该方法会根据提供的提示词（Prompt）与配置的模型进行交互，并返回模型的响应结果。该方法参数如下：
1. **`ctx (context.Context)`**:上下文参数，用于控制请求的生命周期，可用于设置超时、取消等操作。
2. **`prompt (Prompt)`**:提示词对象，包含用户输入的信息，可以通过 blades.NewPrompt() 或 blades.NewPromptTemplate() 创建。
3. **`opts (...ModelOption)`**:可变的模型选项参数，用于在运行时覆盖 Agent 的默认配置。

该方法使用示例如下：
```go
import (
	"bytes"
	"context"
	"html/template"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func buildPrompt(input string, params map[string]any) string {
	t, err := template.New("prompt").Parse(input)
	if err != nil {
		panic(err)
	}
	var result bytes.Buffer
	err = t.Execute(&result, params)
	if err != nil {
		panic(err)
	}
	return result.String()
}
func main() {
	params := map[string]any{
		"topic":    "The Future of Artificial Intelligence",
		"audience": "General reader",
	}
	// Set Environment Variables for OpenAI
	provider := openai.NewChatProvider()
	inform := buildPrompt("You are a helpful assistant that provides detailed and accurate information.", params)

	agent, err := blades.NewAgent(
		"Run Agent",
		blades.WithProvider(provider),
		blades.WithModel("deepseek-chat"),
		blades.WithInstructions(inform), // you can set system message
	)
	if err != nil {
		log.Fatal(err)
	}
	input := buildPrompt("please answer for {{.audience}} in a clear and accurate manner.", params)
	prompt := blades.UserMessage(input)
	log.Println(prompt.Text())
	runner := blades.NewRunner(agent)
	result, err := runner.Run(context.Background(), prompt)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(result.Text())
}
```
Run方法的可选配置参数`(...ModelOption)`如下：

    Seed: 设置生成文本时的随机种子，确保结果可复现。
    MaxOutputTokens: 设置生成响应中的最大标记数。
    FrequencyPenalty: 设置频率惩罚参数，用于控制重复字词的出现概率。
    PresencePenalty: 设置存在惩罚参数，用于控制新话题的引入概率。
    Temperature: 设置采样温度，值在 0.0 到 1.0 之间，控制生成文本的随机性。
    TopP: 设置核心采样参数，控制生成文本的多样性。
    StopSequences: 设置生成文本的停止序列，当遇到这些序列时停止生成。

图像生成相关的配置选项：

    ImageBackground: 设置生成图像的背景偏好。
    ImageSize: 设置生成图像的输出尺寸。
    ImageQuality: 设置生成图像的质量预设。
    ImageResponseFormat: 设置图像生成的响应格式。
    ImageOutputFormat: 设置图像的输出编码格式。
    ImageModeration: 设置生成图像的审核级别。
    ImageStyle: 设置生成图像的风格提示。
    ImageUser: 为生成的图像标记最终用户标识符。
    ImageCount: 设置请求生成的图像数量。
    ImagePartialImages: 设置流式 API 中发出的部分图像数量。
    ImageOutputCompression: 设置 JPEG/WEBP 图像的输出压缩百分比。

音频相关配置选项：

    AudioVoice: 选择生成语音的合成声音。
    AudioResponseFormat: 设置提供者返回的音频容器/编解码器。
    AudioStreamFormat: 选择流式协议（当支持时）。
    AudioInstructions: 提供关于语音传递的额外指导。
    AudioSpeed: 设置播放速度倍数。