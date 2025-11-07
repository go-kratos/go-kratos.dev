---
title: "并行智能体"
---
:::note
并行智能体是Blades框架中用于实现并发执行逻辑的核心组件，它可以同时启动多个任务并发执行，并提供灵活的结果合并机制。这种模式非常适合需要并行处理以提高效率的场景。
:::
## 核心概念
并行智能体的结构如下：
```go
type Parallel struct {
	merger  ParallelMerger
	runners []blades.Runnable
}
```
### 参数说明
Parallel结构体包含两个参数：可执行任务列表 (runners) 和结果合并函数 (ParallelMerger)。
#### 1. 可执行任务列表 (runners)
:::note
- 类型: `[]blades.Runnable`
- 作用: 需要并发执行的任务列表
- 特点: 每个任务都可以是任何实现了**Runnable**接口的对象
:::
#### 2. 结果合并函数 (ParallelMerger)
:::note
- 类型: `func(ctx context.Context, outputs []*blades.Message) (*blades.Message, error)`
- 作用: 将多个并行任务的输出结果合并成单一输出
- 默认行为: 将所有输出的消息部分合并到一个新的消息中
:::
## 特性
:::note
- **并发执行**：并行智能体使用Go的并发机制同时启动所有任务，充分利用多核CPU性能。

- **灵活的结果合并**：提供自定义结果合并函数的能力，可以根据业务需求灵活处理多个任务的输出。

- **统一的错误处理**：使用errgroup机制确保任何一个任务失败时能够及时终止所有任务并返回错误。

- **任务组合能力**：支持任意实现了[Runnable](file://e:\0_nebula\blades\core.go#L45-L48)接口的任务，包括其他流程控制器（顺序、分支、循环等）。
:::
## 使用方法
### 1. 定义执行任务列表
```go
tasks := []blades.Runnable{
    // task 1
    flow.NewSequential(...),
    // task 2
    flow.NewSequential(...),
    // task 3
    flow.NewSequential(...),
}
```
### 2. 使用并行智能体
```go
parallel := flow.NewParallel(tasks)
result, err := parallel.Run(context.Background(), prompt)
```
### 3. 自定义结果合并函数
```go
erger := func(ctx context.Context, outputs []*blades.Message) (*blades.Message, error) {
    // default merge logic
    result := blades.NewMessage(blades.RoleAssistant)
    // ... merge logic ...
    return result, nil
}

parallel := flow.NewParallel(tasks, flow.WithParallelMerger(merger))
```
## 最佳实践
:::tip
- **合理划分任务**: 将可以独立执行且耗时较长的任务划分为并行任务
- **避免资源竞争**: 确保并行任务之间没有共享资源的竞争问题
- **设计合适的合并策略**: 根据业务需求设计合适的结果合并逻辑
- **性能评估**: 对于轻量级任务，并行执行可能因为调度开销反而降低性能
:::
## 代码示例
```go
// Define tasks to be executed in parallel
tasks := []blades.Runnable{
    // Task 1: Get weather information
    flow.NewSequential(
        // Weather query task implementation
    ),
    // Task 2: Get news information
    flow.NewSequential(
        // News query task implementation
    ),
    // Task 3: Get stock information
    flow.NewSequential(
        // Stock query task implementation
    ),
}

// Custom result merger function
merger := func(ctx context.Context, outputs []*blades.Message) (*blades.Message, error) {
    result := blades.NewMessage(blades.RoleAssistant)
    result.AddText("Comprehensive information report:")
    
    for i, output := range outputs {
        switch i {
        case 0:
            result.AddText("\n[Weather Information]")
        case 1:
            result.AddText("\n[News Information]")
        case 2:
            result.AddText("\n[Stock Information]")
        }
        result.AddText(output.Text())
    }
    
    return result, nil
}

// create parallel agent
parallel := flow.NewParallel(tasks, flow.WithParallelMerger(merger))

// execute parallel tasks
result, err := parallel.Run(ctx, prompt)
if err != nil {
    log.Printf("Parallel execution error: %v", err)
    return
}

log.Printf("Parallel execution completed, merged result: %s", result.Text())
```