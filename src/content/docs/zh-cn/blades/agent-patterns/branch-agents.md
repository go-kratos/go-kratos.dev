---
title: "分支智能体"
---
分支智能体是Blades框架中用于实现条件分支逻辑的核心组件，它允许根据运行时条件动态选择执行路径,基于条件函数的返回值从多个可执行任务中选择一个来执行。这种模式非常适合需要根据不同输入或状态采取不同行动的场景。

## 核心概念
分支智能体结构如下：
```go
type Branch struct {
	condition BranchCondition
	runners   map[string]blades.Runnable
}
```
### 参数说明
Branch 包含两个参数：分支条件函数 (BranchCondition) 和可执行任务映射 (runners)。
### 1. 分支条件函数 (BranchCondition)

- 类型: `func(ctx context.Context, input *blades.Prompt) (string, error)`
- 作用: 根据上下文和输入确定要执行的分支名称
- 返回值: 字符串类型的分支名称和可能的错误

### 2. 可执行任务映射 (runners)
- 类型: `map[string]blades.Runnable`
- 作用: 存储分支名称到可执行任务的映射关系
- 特点: 每个分支名称对应一个具体的任务实现

## 特性
- 条件驱动执行：分支智能体通过条件函数动态决定执行哪个分支，这使得程序可以根据运行时信息做出智能决策。
- 灵活的任务组合：支持任意数量的分支，每个分支可以是任何实现了**Runnable**接口的对象，包括其他流程控制器（顺序、并行等）。
- 错误处理机制：当条件函数执行出错或指定的分支不存在时，会返回相应的错误信息。

## 使用方法
以下介绍了分支智能体的使用方法。
### 1. 创建分支条件函数
```go
condition := func(ctx context.Context, input *blades.Prompt) (string, error) {
    if input.Latest().Text() == "positive" {
        return "positive_branch", nil
    }
    return "default_branch", nil
}
```
### 2. 定义分支任务
```go
runners := map[string]blades.Runnable{
    "positive_branch": flow.NewSequential(
        // positive handling
    ),
    "default_branch": flow.NewSequential(
        // default handling
    ),
}
```
### 3. 创建并执行分支智能体
```go
branch := flow.NewBranch(condition, runners)
result, err := branch.Run(context.Background(), prompt)
```
## 最佳实践
:::tip
- **明确的条件设计**: 条件函数应尽量简单明了，避免复杂的业务逻辑
- **完整的分支覆盖**: 确保所有可能的条件结果都有对应的处理分支
- **合理的错误处理**: 在条件函数和分支任务中都要考虑错误处理
- **可维护性考虑**: 对于复杂分支逻辑，建议拆分成多个层次的分支嵌套
:::
## 代码示例
```go
func main() {
    condition := func(ctx context.Context, input *blades.Prompt) (string, error) {
    latest := input.Latest()
    if latest == nil {
        return "default", nil
    }
    
    text := latest.Text()
    switch {
        case strings.Contains(text, "help"):
            return "help", nil
        case strings.Contains(text, "order"):
            return "order", nil
        default:
            return "general", nil
        }
    }

    runners := map[string]blades.Runnable{
        "help": flow.NewSequential(
            // handle help
        ),
        "order": flow.NewSequential(
            // handle order
        ),
        "general": flow.NewSequential(
            // handle general
        ),
    }

    branch := flow.NewBranch(condition, runners)
    result, err := branch.Run(ctx, prompt)
}
```
