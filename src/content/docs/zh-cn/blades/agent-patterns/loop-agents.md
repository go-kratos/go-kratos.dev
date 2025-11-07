---
title: "循环智能体"
---
:::note
循环智能体是Blades框架中用于实现循环执行逻辑的核心组件，循环智能体基于条件函数的返回值决定是否继续执行某个任务。这种模式非常适合需要重复处理直到达成目标的场景。
:::
## 核心概念
循环智能体具体结构如下： 
```go
type Loop struct {
	maxIterations int
	condition     LoopCondition
	runner        blades.Runnable
}
```
## 参数说明
Loop共包含3个参数，分别为循环条件函数(condition)、可执行任务(runner)和最大迭代次数(maxIterations)。
### 1. 循环条件函数 (condition)
:::note
- 类型: `func(ctx context.Context, output *blades.Message) (bool, error)`
- 作用: 根据上一次执行的输出结果判断是否继续循环
- 返回值: 布尔值表示是否继续循环，以及可能的错误
:::
### 2. 可执行任务 (runner)
:::note
- 类型: 
```go
type Runnable interface {
	Run(context.Context, *Prompt, ...ModelOption) (*Message, error)
	RunStream(context.Context, *Prompt, ...ModelOption) (Streamable[*Message], error)
}
```
- 作用: 需要重复执行的具体任务
- 特点: 可以是任何实现了[Runnable](file://e:\0_nebula\blades\core.go#L45-L48)接口的对象
:::
### 3. 最大迭代次数 (maxIterations)
:::note
- 类型: `int`
- 作用: 防止无限循环的安全机制
:::
## 特性
:::note
- **条件驱动循环**: 循环智能体通过条件函数动态决定是否继续执行，这使得程序可以根据执行结果智能地决定是否继续迭代。
- **安全机制**: 内置最大迭代次数限制，防止因条件判断错误导致的无限循环问题。
- **灵活的任务组合**: 支持任意实现了**Runnable**接口的任务，包括其他流程控制器（顺序、并行、分支等）。
- **错误处理机制**: 当条件函数执行出错或任务执行出错时，会立即返回相应的错误信息。
:::
## 使用方法
### 1. 创建循环条件函数
```go
condition := func(ctx context.Context, output *blades.Message) (bool, error) {
    // judge whether to continue loop
    return !strings.Contains(output.Text(), "completed"), nil
}
```
### 2. 定义执行任务
```go
task := flow.NewSequential(
    // loop task
)
```
### 3. 创建并使用循环智能体
```go
loop := flow.NewLoop(condition, task, flow.WithLoopMaxIterations(5))
result, err := loop.Run(context.Background(), prompt)
```
## 最佳实践
:::note
- **合理的条件设计**: 循环条件应能准确反映任务完成状态，避免永远无法满足的条件
- **设置合适的最大迭代次数**: 根据业务场景设置合理的上限，防止资源浪费
- **完善的错误处理**: 在条件函数和执行任务中都要考虑错误处理，避免因异常导致的无限循环
- **状态传递优化**: 合理利用输入输出参数传递状态信息，确保每次迭代都能基于最新状态进行处理
:::
## 代码示例
```go
func main() {
    // define loop condition function
    condition := func(ctx context.Context, output *blades.Message) (bool, error) {
        // if output contains "continue", continue loop
        return strings.Contains(output.Text(), "continue"), nil
    }

    // define the task to be executed repeatedly
    task := flow.NewSequential(
        // task implementation
    )

    // create loop agent with max iterations set to 5
    loop := flow.NewLoop(
        condition, 
        task, 
        flow.WithLoopMaxIterations(5),
    )

    // execute loop task
    result, err := loop.Run(ctx, prompt)
    if err != nil {
        log.Printf("loop execution error: %v", err)
        return
    }

    log.Printf("loop execution completed, final result: %s", result.Text())
}
```