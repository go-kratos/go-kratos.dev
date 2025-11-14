---
title: "工具"
description: "blades对工具操作使用方法"
references: ["https://github.com/go-kratos/blades/tree/main/examples/tools-func"]
---
Blades 为自定义工具提供便捷支持，可以自己定制函数式工具。

## 函数式工具
:::note
在运行此代码之前，请确保您已经正确配置了相关环境变量。
:::
### 定义工具
`tools.NewFunc(...)`是创建一个基于函数的工具得核心方法，包含以下参数：

**name**：工具的名称，用于标识工具。

**description**：工具的描述，用于提示用户工具的功能。

**handler**：工具的处理函数，用于处理工具的请求并返回结果。在定义handler时需要使用包装器，将一个普通的go函数转换成**blades**可以识别的工具处理函数。
```go
// WeatherReq represents a request for weather information.
type WeatherReq struct {
	Location string `json:"location" jsonschema:"Get the current weather for a given city"`
}

// WeatherRes represents a response containing weather information.
type WeatherRes struct {
	Forecast string `json:"forecast" jsonschema:"The weather forecast"`
}

weatherTool, err := tools.NewFunc(
	"get_weather",
	"Get the current weather for a given city",
	tools.HandleFunc[WeatherReq, WeatherRes](func(ctx context.Context, req WeatherReq) (WeatherRes, error) {
		log.Println("Fetching weather for:", req.Location)
		session, ok := blades.FromSessionContext(ctx)
		if !ok {
			return WeatherRes{}, blades.ErrNoSessionContext
		}
		session.PutState("location", req.Location)
		return WeatherRes{Forecast: "Sunny, 25°C"}, nil
	}),
)
if err != nil {
	log.Fatal(err)
}
```
### 创建Agent并导入工具
```go
agent, err := blades.NewAgent(
	"Weather Agent",
	blades.WithModel("gpt-5"),
	blades.WithInstructions("You are a helpful assistant that provides weather information."),
	blades.WithProvider(openai.NewChatProvider()),
	blades.WithTools(weatherTool),
)
if err != nil {
	log.Fatal(err)
}
```
### 运行
```go
input := blades.UserMessage("What is the weather in New York City?")
	session := blades.NewSession()
	runner := blades.NewRunner(agent, blades.WithSession(session))
	ctx := context.Background()
	output, err := runner.Run(ctx, input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("state:", session.State())
	log.Println("output:", output.Text())
```
成功运行代码，将看到类似如下的输出：
```bash
2025/11/14 11:01:18 stream status: completed output: The weather in San Francisco is currently sunny with a temperature of 25°C.
```
## 