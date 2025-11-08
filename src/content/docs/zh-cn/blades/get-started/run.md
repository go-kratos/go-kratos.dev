---
title: "构建生成式智能体"
---
# 同步调用
使用Blades同步调用让Agent一次返回完整回答。

    行为：同步调用Run发送请求后阻塞等待，直到模型生成完整回复，一次性返回结果。
    返回值：一个完整的Message对象

## 代码示例

### 前置条件
    1. 安装Blades：`go get github.com/go-kratos/blades`
    2. 配置模型提供者（如OpenAI）：设置环境变量`OPENAI_API_KEY`和`OPENAI_BASE_URL`

```Go
package main

import (
    "context"
    "log"
    "os"
    
    "github.com/go-kratos/blades"
    "github.com/go-kratos/blades/contrib/openai"
)

func main() {
    // Set Environment Variables for OpenAI
    provider := openai.NewChatProvider()
    agent := blades.NewAgent(
    	"Run Agent",
    	blades.WithProvider(provider),
    	blades.WithModel("deepseek-chat"),
    )
    params := map[string]any{
    	"topic":    "The Future of Artificial Intelligence",
    	"audience": "General reader",
    }
    prompt, err := blades.NewPromptTemplate().
    	System("please summarize {{.topic}}。", params).
    	User("please answer for {{.audience}} in a clear and accurate manner.", params).
    	Build()
    if err != nil {
    	log.Fatal(err)
    }
    result, err := agent.Run(context.Background(), prompt)
    if err != nil {
    	log.Fatal(err)
    }
    log.Println(result.Text())
}
```
