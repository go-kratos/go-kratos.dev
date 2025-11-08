---
title: "OpenAI"
---
Blades将 OpenAI API 适配到通用的 `blades.ModelProvider` 接口。
- `NewChatProvider` 封装了用于文本和多模态对话的聊天完成端点。
- `NewImageProvider` 封装了图像生成端点 (`/v1/images/generations`)，并将图像字节或 URL 作为 `DataPart`/`FilePart` 消息内容返回。
- `NewAudioProvider` 封装了文本到语音端点 (`/v1/audio/speech`)，并将合成的音频作为 `DataPart` 有效负载返回。
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
