---
title: "Branch Agent"
---
:::note
The Branch Agent is a core component in the Blades framework used to implement conditional branch logic. It allows for the dynamic selection of execution paths based on runtime conditions, choosing one executable task from multiple options according to the return value of a condition function. This pattern is particularly suitable for scenarios requiring different actions based on varying inputs or states.
:::

## Core Concepts
The Branch Agent structure is as follows:
```go
type Branch struct {
	condition BranchCondition
	runners   map[string]blades.Runnable
}
```
### Parameter Description
Branch contains two parameters: the branch condition function (BranchCondition) and the executable task mapping (runners).
### 1. Branch Condition Function (BranchCondition)
:::note
- Type: `func(ctx context.Context, input *blades.Prompt) (string, error)`
- Purpose: Determines the branch name to execute based on context and input
- Return Value: String type branch name and a possible error
:::
### 2. Executable Task Mapping (runners)
:::note
- Type: `map[string]blades.Runnable`
- Purpose: Stores the mapping relationship from branch names to executable tasks
- Characteristic: Each branch name corresponds to a specific task implementation
:::

## Features
:::tip
- **Condition-Driven Execution**: The Branch Agent dynamically decides which branch to execute through the condition function, enabling the program to make intelligent decisions based on runtime information.
- **Flexible Task Composition**: Supports any number of branches, where each branch can be any object implementing the **Runnable** interface, including other flow controllers (sequential, parallel, etc.).
- **Error Handling Mechanism**: Returns corresponding error information when the condition function execution fails or the specified branch does not exist.
:::
## Usage
:::note
The following describes how to use the Branch Agent.
:::
### 1. Create a Branch Condition Function
```go
condition := func(ctx context.Context, input *blades.Prompt) (string, error) {
    if input.Latest().Text() == "positive" {
        return "positive_branch", nil
    }
    return "default_branch", nil
}
```
### 2. Define Branch Tasks
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
### 3. Create and Execute the Branch Agent
```go
branch := flow.NewBranch(condition, runners)
result, err := branch.Run(context.Background(), prompt)
```
## Best Practices
:::tip
- **Clear Condition Design**: The condition function should be as simple and clear as possible, avoiding complex business logic.
- **Complete Branch Coverage**: Ensure all possible condition outcomes have corresponding handling branches.
- **Proper Error Handling**: Consider error handling in both the condition function and branch tasks.
- **Maintainability Considerations**: For complex branch logic, it is recommended to split it into multiple levels of nested branches.
:::
## Code Example
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