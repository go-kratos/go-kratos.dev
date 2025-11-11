---
title: "Building Generative Agents"
---
# Synchronous Invocation
Use Blades synchronous invocation to have the Agent return a complete answer at once.

    Behavior: In synchronous invocation, Run sends the request and blocks until the model generates a complete reply, returning the result all at once.
    Return value: A complete Message object
## Code Example
Prerequisites
1. Install Blades: `go get github.com/go-kratos/blades`
2. Configure the model provider (e.g., OpenAI): Set the environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`

### Creating an Agent
In Blades, to create an agent, use the **NewAgent** method, which is used to create a new Agent instance. **Agent** is the core component in the Blades framework, responsible for coordinating models, tools, prompts, and other resources to perform various AI tasks.
NewAgent has two parameters, as follows:
1. **`name`(string, required)**: Represents the name of the Agent, used to identify different Agent instances.
2. **`opts`(Options, optional)**: Options used to configure the Agent instance. Supported configuration options include:
    - **`WithProvider(provider ModelProvider)`**: Set the model provider, such as OpenAI, Claude, and Gemini, etc.
    - **`WithModel(models string)`**: Set the default model name. (e.g., "deepseek-chat")
    - **`WithTools(tools ...tools.Tool)`**: Add available tools for the Agent
    - **`WithInstructions(instructions string)`**: Set the Agent's system instructions/role settings
    - **`WithInputSchema(schema *jsonschema.Schema)`**: Set the input format
    - **`WithOutputSchema(schema *jsonschema.Schema)`**: Set the output format

Example usage of this method:
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
input := blades.UserMessage("what is the weather like in Shanghai today?")
output, err := runner.Run(context.Background(), input)
if err != nil {
    log.Fatal(err)
}
log.Println(output.Text())
```
### Run
runner.Run is the core execution method for an Agent in the Blades framework, used to run a complete AI interaction process. This method interacts with the configured model based on the provided prompt and returns the model's response. The parameters of this method are as follows:
1. **`ctx (context.Context)`**: Context parameter used to control the request lifecycle, which can be used to set timeouts, cancellations, etc.
2. **`prompt (Prompt)`**: Prompt object containing user input information, which can be created via blades.NewPrompt() or blades.NewPromptTemplate().
3. **`opts (...ModelOption)`**: Variable model option parameters used to override the Agent's default configuration at runtime.

Example usage of this method:
```go
package main

import (
	"context"
	"log"
	"strings"
	"text/template"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
)

// buildPrompt builds a prompt using text/template with the given parameters.
func buildPrompt(params map[string]any) (string, error) {
	var (
		text = "Respond concisely and accurately for a {{.audience}} audience."
		buf  strings.Builder
	)
	t, err := template.New("message").Parse(text)
	if err != nil {
		return "", err
	}
	if err := t.Execute(&buf, params); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func main() {
	agent, err := blades.NewAgent(
		"Template Agent",
		blades.WithModel("gpt-5"),
		blades.WithProvider(openai.NewChatProvider()),
		blades.WithInstructions("Please summarize {{.topic}} in three key points."),
	)
	if err != nil {
		log.Fatal(err)
	}
	// Define templates and params
	state := map[string]any{
		"topic":    "The Future of Artificial Intelligence",
		"audience": "General reader",
	}
	// Build prompt using the template builder
	// Note: Use exported methods when calling from another package.
	prompt, err := buildPrompt(state)
	if err != nil {
		log.Fatal(err)
	}
	input := blades.UserMessage(prompt)
	// Run the agent with the templated prompt
	session := blades.NewSession(state)
	runner := blades.NewRunner(agent, blades.WithSession(session))
	output, err := runner.Run(context.Background(), input)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(output.Text())
}
```
