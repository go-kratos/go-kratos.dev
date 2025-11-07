---
title: "OpenAI"
---
:::note
Blades adapts the OpenAI API to the generic `blades.ModelProvider` interface.
- `NewChatProvider` wraps the chat completions endpoint for text and multimodal conversations.
- `NewImageProvider` wraps the image generation endpoint (`/v1/images/generations`) and returns image bytes or URLs as `DataPart`/`FilePart` message content.
- `NewAudioProvider` wraps the text-to-speech endpoint (`/v1/audio/speech`) and returns synthesized audio as a `DataPart` payload.
:::
## ImageProvider
```go
provider := openai.NewImageProvider()
req := &blades.ModelRequest{
    Model: "gpt-image-1",
    Messages: []*blades.Message{
        blades.UserMessage("a watercolor painting of a cozy reading nook"),
    },
}
res, err := provider.Generate(ctx, req, blades.ImageSize("1024x1024"))
```
## AudioProvider
```go
provider := openai.NewAudioProvider()
req := &blades.ModelRequest{
    Model: "gpt-4o-mini-tts",
    Messages: []*blades.Message{
        blades.UserMessage("Hello from Blades audio!"),
    },
}
res, err := provider.Generate(ctx, req, blades.AudioVoice("alloy"), blades.AudioResponseFormat("mp3"))
```