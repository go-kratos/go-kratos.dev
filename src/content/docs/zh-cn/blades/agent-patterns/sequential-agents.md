---
title: "顺序智能体"
---
:::tip
顺序智能体是Blades框架中用于实现顺序执行逻辑的核心组件，它允许按预定顺序依次执行多个任务，前一个任务的输出作为后一个任务的输入，这种模式非常适合需要步骤化处理的线性业务流程。
:::
## 核心概念
```go
type Sequential struct {
	runners []blades.Runnable
}
```
### 参数说明
Sequential结构体只包含一个runners参数。
### 1. 可执行任务列表 (runners)
:::note
- 类型: 
```go
type Runnable interface {
	Run(context.Context, *Prompt, ...ModelOption) (*Message, error)
	RunStream(context.Context, *Prompt, ...ModelOption) (Streamable[*Message], error)
}
```
- 作用: 需要按顺序执行的任务列表
- 特点: 每个任务都可以是任何实现了**Runnable**接口的对象
:::
##  特性
:::note
- **线性执行流程**: 顺序智能体严格按照任务列表的顺序执行，确保每个步骤都在前一个步骤完成后才开始。
- **自动数据传递**: 前一个任务的输出会自动成为下一个任务的输入，形成自然的数据流水线。
- **统一错误处理**: 任何一个任务执行失败都会立即中断整个流程并返回错误，确保流程的一致性。
- **任务组合能力**: 支持任意实现了**Runnable**接口的任务，包括其他流程控制器（分支、并行、循环等）。
:::
## 使用方法
### 1. 定义执行任务列表
```go
tasks := []blades.Runnable{
    // step 1
    flow.NewSequential(...),
    // step 2
    flow.NewSequential(...),
    // step 3
    flow.NewSequential(...),
}
```
### 2. 使用顺序智能体
```go
sequential := flow.NewSequential(tasks...)
result, err := sequential.Run(context.Background(), prompt)
```
## 最佳实践
:::note
- **合理的任务划分**: 将复杂流程分解为职责清晰的独立任务
- **明确的数据依赖**: 确保任务间的输入输出关系清晰明确
- **完善的错误处理**: 在每个任务中都要考虑错误处理，确保流程的健壮性
- **避免过度嵌套**: 对于过于复杂的流程，考虑使用图形化工作流代替深度嵌套
- **性能考量**: 对于耗时较长的任务，考虑是否可以通过并行处理优化
:::
## 代码示例
:::note
在运行此代码之前，请确保您已经正确配置了API密钥。
:::
```go
// define tasks
tasks := []blades.Runnable{
    // step 1: data validation
    flow.NewSequential(
        // validation task implementation
    ),
    // step 2: data processing
    flow.NewSequential(
        // processing task implementation
    ),
    // step 3: result generation
    flow.NewSequential(
        // generation task implementation
    ),
}

// create sequential agent
sequential := flow.NewSequential(tasks...)

// sequential execution
result, err := sequential.Run(ctx, prompt)
if err != nil {
    log.Printf("sequential execution error: %v", err)
    return
}

log.Printf("sequential execution completed, final result: %s", result.Text())
```