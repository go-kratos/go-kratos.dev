---
title: "Sequential Agent"
---
The Sequential Agent is the core component in the Blades framework for implementing sequential execution logic. It allows multiple tasks to be executed in a predetermined order, where the output of the previous task serves as the input for the next. This pattern is particularly suitable for linear business processes that require step-by-step handling.
## Core Concepts
```go
type Sequential struct {
	runners []blades.Runnable
}
```
### Parameter Description
The Sequential struct contains only one parameter: runners.
### 1. Executable Task List (runners)
- Type: 
```go
type Runnable interface {
	Run(context.Context, *Prompt, ...ModelOption) (*Message, error)
	RunStream(context.Context, *Prompt, ...ModelOption) (Streamable[*Message], error)
}
```
- Purpose: A list of tasks to be executed in sequence
- Characteristics: Each task can be any object that implements the **Runnable** interface
## Features
- **Linear Execution Flow**: The Sequential Agent strictly executes tasks in the order of the list, ensuring each step begins only after the previous one completes.
- **Automatic Data Passing**: The output of the previous task automatically becomes the input for the next task, forming a natural data pipeline.
- **Unified Error Handling**: If any task fails, the entire process is immediately interrupted and an error is returned, ensuring process consistency.
- **Task Composition Capability**: Supports any task that implements the **Runnable** interface, including other flow controllers (branching, parallel, loop, etc.).
## Usage
### 1. Define the Task List
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
### 2. Using the Sequential Agent
```go
sequential := flow.NewSequential(tasks...)
result, err := sequential.Run(context.Background(), prompt)
```
## Best Practices
- **Reasonable Task Division**: Decompose complex processes into independent tasks with clear responsibilities.
- **Clear Data Dependencies**: Ensure clear and explicit input-output relationships between tasks.
- **Comprehensive Error Handling**: Consider error handling in each task to ensure process robustness.
- **Avoid Excessive Nesting**: For overly complex processes, consider using graphical workflows instead of deep nesting.
- **Performance Considerations**: For time-consuming tasks, consider whether optimization through parallel processing is possible.
## Code Example
Before running this code, please ensure you have correctly configured your API key.
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
