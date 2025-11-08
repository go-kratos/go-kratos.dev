---
title: "观测"
---
Blades 提供了丰富的功能来帮助开发者观测和诊断应用程序性能。本文档将给出一个监控AI性能的观测示例

## 代码示例
:::tip
在运行本示例前，请先检查是否配置APIKEY。
:::

### 1. 初始化追踪
```go
// Initialize OpenTelemetry tracer provider
func createTracerProvider() {
    exporter, err := stdouttrace.New()
    if err != nil {
        log.Fatal(err)
    }
    
    resource, err := resource.New(context.Background(),
        resource.WithAttributes(
            semconv.ServiceNameKey.String("blades-performance-monitoring"),
        ),
    )
    if err != nil {
        log.Fatal(err)
    }
    
    otel.SetTracerProvider(
        sdktrace.NewTracerProvider(
            sdktrace.WithBatcher(exporter, sdktrace.WithBatchTimeout(1*time.Millisecond)),
            sdktrace.WithResource(resource),
        ),
    )
}
```
### 2. 创建多个Agent
```go
func createAgents() []*blades.Agent {
    agents := []*blades.Agent{
        blades.NewAgent(
            "Fast Agent",
            blades.WithModel("gpt-3.5-turbo"),
            blades.WithInstructions("Provide concise answers in under 50 words."),
            blades.WithProvider(openai.NewChatProvider()),
            blades.WithMiddleware(middleware.Tracing(middleware.WithSystem("openai"))),
        ),
        blades.NewAgent(
            "Detail Agent",
            blades.WithModel("gpt-4"),
            blades.WithInstructions("Provide concise answers in under 50 words."),
            blades.WithProvider(openai.NewChatProvider()),
            blades.WithMiddleware(middleware.Tracing(middleware.WithSystem("openai"))),
        ),
    }
    return agents
}
```

### 3. 测试Agent性能
```go
func testAgentPerformance(agents []*blades.Agent) {
    prompt := blades.NewPrompt(
        blades.UserMessage("Explain the theory of relativity in simple terms."),
    )
    session := blades.NewSession("performance-test-session")
    ctx := blades.NewSessionContext(context.Background(), session)
    for _, agent := range agents {
        start := time.Now()
        result, err := agent.Run(ctx, prompt)
        duration := time.Since(start)
        
        if err != nil {
            log.Printf("Agent %s failed: %v", agent.Name(), err)
        } else {
            log.Printf("Agent %s responded in %v with %d characters", 
                agent.Name(), duration, len(result.Text()))
        }
    }
    // Shutdown the exporter to flush any remaining spans
    if err := exporter.Shutdown(context.Background()); err != nil {
        log.Fatal(err)
    }
}
```
