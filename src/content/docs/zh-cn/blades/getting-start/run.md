# 🔁同步调用
使用Blades同步调用让Agent一次返回完整回答。

    行为：同步调用Run发送请求后阻塞等待，直到模型生成完整回复，一次性返回结果。
    返回值：一个完整的Message对象


## 🚀代码示例

### 前置条件
    1. 安装Blades：`go get github.com/go-kratos/blades`
    2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`

```Go
package main

import (
	"bufio"
	"context"
	"log"
	"os"
	"strings"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

func main() {

	provider := openai.NewChatProvider()
	// you can also use this way for setting the provider.
	// provider := openai.NewChatProvider(
	//         openai.WithChatOptions(
	//             option.WithBaseURL("https://api.openai.com/v1"),
	//             option.WithAPIKey("API-YOUR-KEY"),
	//         ),

	// build Agent
	agent := blades.NewAgent(
		"demo-run-agent",
		blades.WithProvider(provider),
		blades.WithModel("deepseek-chat"),
	)

	// build Prompt
	params := map[string]any{
		"topic":    "artificial intelligence",
		"audience": "users",
	}
	prompt, err := blades.NewPromptTemplate().
		System("请用三点总结 {{.topic}}。", params).
		User("请为 {{.audience}} 简明准确地回答。", params).
		Build()
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// start a thread to handle the input
	go func() {
		reader := bufio.NewReader(os.Stdin)
		log.Println("press Enter to cancel")
		reader.ReadString('\n')
		input, _ := reader.ReadString('\n')
		if strings.TrimSpace(input) == "" {
			log.Println("用户主动取消请求")
			cancel()
		}
		cancel()
	}()
	// run
	resp, err := agent.Run(ctx, prompt)
	if err != nil {
		log.Fatalf("agent run: %v", err)
	}

	os.Stdout.WriteString(resp.Text())
}
// result:
// 1. **定义**：人工智能（AI）是计算机科学的一个分支，旨在开发能够模拟人类智能的系统和机器，以执行学习、推理、感知和决策等任务。  

// 2. **核心技术**：依赖机器学习、深度学习、自然语言处理等技术，通过数据训练模型，实现自动化与智能化。

// 3. **应用领域**：广泛应用于医疗、金融、交通、娱乐等行业，提升效率并解决复杂问题。

```
