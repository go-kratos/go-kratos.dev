---
title: "Building Generative Agents"
---
# Synchronous Invocation
Use Blades synchronous invocation to have the Agent return a complete response at once.

    Behavior: In synchronous invocation, the Run method sends the request and blocks until the model generates the full reply, returning the result in one go.
    Return value: A complete Message object
## Code Example
Prerequisites
1. Install Blades: `go get github.com/go-kratos/blades`
2. Configure the model provider (e.g., OpenAI): Set the environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`

### Creating an Agent
In Blades, to create an agent, use the **NewAgent** method, which is used to create a new Agent instance. **Agent** is the core component in the Blades framework, responsible for coordinating models, tools, prompts, and other resources to perform various AI tasks.
NewAgent has two parameters, as follows:
1. **`name`(string, required)**: Represents the name of the Agent, used to identify different Agent instances.
2. **`options`(Options, optional)**: Options used to configure the Agent instance. Supported configuration options include:
    - **`WithModel(model ModelProvider)`**: Set the model provider, such as OpenAI, Claude, and Gemini.
    - **`WithTools(tools ...tools.Tool)`**: Add available tools for the Agent
    - **`WithInstruction(instructions string)`**: Set the Agent's system instructions/role settings
    - **`WithInputSchema(schema *jsonschema.Schema)`**: Set the input format
    - **`WithOutputSchema(schema *jsonschema.Schema)`**: Set the output format

Example usage of this method:
```go
// Configure OpenAI API key and base URL using environment variables:
model := openai.NewModel("gpt-5", openai.Config{
	APIKey: os.Getenv("OPENAI_API_KEY"),
})
agent := blades.NewAgent(
    "Weather Agent",
    blades.WithModel(model),
    blades.WithInstruction("You are a helpful assistant that provides weather information."),
    blades.WithTools(weatherTool),
)
// Run the agent
input := blades.UserMessage("what is the weather like in Shanghai today?")
runner := blades.NewRunner(agent)
output, err := runner.Run(context.Background(), input)
if err != nil {
    log.Fatal(err)
}
log.Println(output.Text())
```
### Run
runner.Run is the core execution method for Agents in the Blades framework, used to run a complete AI interaction process. This method interacts with the configured model based on the provided prompt and returns the model's response. The parameters of this method are as follows:
1. **`ctx (context.Context)`**: The context parameter, used to control the request lifecycle, can be used to set timeouts, cancellations, etc.
2. **`input (Message)`**: The prompt object, containing the user's input information, which can be created using blades.UserMessage("user prompt").