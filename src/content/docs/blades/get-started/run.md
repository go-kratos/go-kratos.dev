---
title: "Building Generative Agents"
---
# Synchronous Invocation
Use Blades synchronous invocation to have the Agent return a complete response at once.

    Behavior: After sending a request via synchronous Run, it blocks and waits until the model generates a complete reply, returning the result in one go.
    Return Value: A complete Message object
## Code Example
:::note
Prerequisites
1. Install Blades: `go get github.com/go-kratos/blades`
2. Configure a model provider (e.g., OpenAI): Set the environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL`
:::
### Create an Agent
In Blades, to create an agent, use the **NewAgent** method, which is used to create a new Agent instance. **Agent** is the core component in the Blades framework, responsible for coordinating resources such as models, tools, and prompts to execute various AI tasks.
NewAgent has two parameters, as follows:
1. **`name` (string, required)**: Represents the name of the Agent, used to identify different Agent instances.
2. **`opts` (Options, optional)**: Options used to configure the Agent instance. Supported configuration options include:
    - **`WithProvider(provider ModelProvider)`**: Set the model provider, such as OpenAI, Claude, and Gemini.
    - **`WithModel(models string)`**: Set the default model name. (e.g., "deepseek-chat")
    - **`WithTools(tools ...*tools.Tool)`**: Add available tools for the Agent
    - **`WithInstructions(instructions string)`**: Set the Agent's system instructions/role settings
    - **`WithStateInputHandler(h StateInputHandler)`**: Set the input handler function
    - **`WithStateOutputHandler(h StateOutputHandler)`**: Set the output handler function

Example usage of this method:
```go
agent := blades.NewAgent(
    "Weather Agent",
    blades.WithModel("deepseek-chat"),
    blades.WithInstructions("You are a helpful assistant that provides weather information."),
    blades.WithProvider(openai.NewChatProvider()),
    blades.WithTools(weatherTool),
)
```
### Run
Agent.Run is the core execution method for an Agent in the Blades framework, used to run a complete AI interaction process. This method interacts with the configured model based on the provided prompt and returns the model's response. The parameters of this method are as follows:
1. **`ctx (context.Context)`**: Context parameter, used to control the request lifecycle, can be used to set timeouts, cancellations, etc.
2. **`prompt (Prompt)`**: Prompt object, containing the user's input information, can be created via blades.NewPrompt() or blades.NewPromptTemplate().
3. **`opts (...ModelOption)`**: Variable model option parameters, used to override the Agent's default configuration at runtime.

Example usage of this method:
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
Optional configuration parameters for the Run method are as follows:

    Seed: Set the random seed for text generation to ensure reproducible results.
    MaxOutputTokens: Set the maximum number of tokens in the generated response.
    FrequencyPenalty: Set the frequency penalty parameter to control the probability of repeated words.
    PresencePenalty: Set the presence penalty parameter to control the probability of introducing new topics.
    Temperature: Set the sampling temperature, value between 0.0 and 1.0, controlling the randomness of the generated text.
    TopP: Set the nucleus sampling parameter, controlling the diversity of the generated text.
    StopSequences: Set the stop sequences for text generation; generation stops when these sequences are encountered.

Image generation related configuration options:

    ImageBackground: Set the background preference for generated images.
    ImageSize: Set the output size for generated images.
    ImageQuality: Set the quality preset for generated images.
    ImageResponseFormat: Set the response format for image generation.
    ImageOutputFormat: Set the output encoding format for images.
    ImageModeration: Set the moderation level for generated images.
    ImageStyle: Set the style prompt for generated images.
    ImageUser: Mark the generated image with an end-user identifier.
    ImageCount: Set the number of images to generate per request.
    ImagePartialImages: Set the number of partial images emitted in streaming APIs.
    ImageOutputCompression: Set the output compression percentage for JPEG/WEBP images.

Audio related configuration options:

    AudioVoice: Select the synthesized voice for speech generation.
    AudioResponseFormat: Set the audio container/codec returned by the provider.
    AudioStreamFormat: Select the streaming protocol (when supported).
    AudioInstructions: Provide additional guidance regarding speech delivery.
    AudioSpeed: Set the playback speed multiplier.