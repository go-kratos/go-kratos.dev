---
title: "Loop Agent"
---
:::note
The Loop Agent is a core component in the Blades framework for implementing loop execution logic. The Loop Agent decides whether to continue executing a task based on the return value of a condition function. This pattern is particularly suitable for scenarios that require repeated processing until a goal is achieved.
:::
## Core Concepts
The specific structure of the Loop Agent is as follows:
```go
type Loop struct {
	maxIterations int
	condition     LoopCondition
	runner        blades.Runnable
}
```
## Parameter Description
The Loop structure contains three parameters: the loop condition function (condition), the executable task (runner), and the maximum number of iterations (maxIterations).
### 1. Loop Condition Function (condition)
:::note
- Type: `func(ctx context.Context, output *blades.Message) (bool, error)`
- Purpose: Determines whether to continue the loop based on the output of the previous execution
- Return Value: A boolean value indicating whether to continue the loop, and a possible error
:::
### 2. Executable Task (runner)
:::note
- Type:
```go
type Runnable interface {
	Run(context.Context, *Prompt, ...ModelOption) (*Message, error)
	RunStream(context.Context, *Prompt, ...ModelOption) (Streamable[*Message], error)
}
```
- Purpose: The specific task that needs to be executed repeatedly
- Feature: Can be any object that implements the [Runnable](file://e:\0_nebula\blades\core.go#L45-L48) interface
:::
### 3. Maximum Iterations (maxIterations)
:::note
- Type: `int`
- Purpose: A safety mechanism to prevent infinite loops
:::
## Features
:::note
- **Condition-Driven Loop**: The Loop Agent dynamically decides whether to continue execution through the condition function, allowing the program to intelligently decide whether to continue iterating based on execution results.
- **Safety Mechanism**: Built-in maximum iteration limit prevents infinite loops caused by incorrect condition judgments.
- **Flexible Task Composition**: Supports any task that implements the **Runnable** interface, including other flow controllers (sequential, parallel, branching, etc.).
- **Error Handling Mechanism**: Immediately returns corresponding error information when the condition function execution fails or task execution fails.
:::
## Usage
### 1. Create Loop Condition Function
```go
condition := func(ctx context.Context, output *blades.Message) (bool, error) {
    // judge whether to continue loop
    return !strings.Contains(output.Text(), "completed"), nil
}
```
### 2. Define Execution Task
```go
task := flow.NewSequential(
    // loop task
)
```
### 3. Create and Use Loop Agent
```go
loop := flow.NewLoop(condition, task, flow.WithLoopMaxIterations(5))
result, err := loop.Run(context.Background(), prompt)
```
## Best Practices
:::note
- **Reasonable Condition Design**: The loop condition should accurately reflect the task completion status, avoiding conditions that can never be satisfied.
- **Set Appropriate Maximum Iterations**: Set a reasonable upper limit based on business scenarios to prevent resource waste.
- **Comprehensive Error Handling**: Consider error handling in both the condition function and execution task to avoid infinite loops caused by exceptions.
- **State Transfer Optimization**: Properly utilize input and output parameters to transfer state information, ensuring each iteration processes based on the latest state.
:::
## Code Example
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