---
title: "Parallel Agent"
---
:::note
The Parallel Agent is a core component in the Blades framework used to implement concurrent execution logic. It can launch multiple tasks simultaneously for concurrent execution and provides a flexible result merging mechanism. This pattern is particularly suitable for scenarios requiring parallel processing to improve efficiency.
:::
## Core Concepts
The structure of the Parallel Agent is as follows:
```go
type Parallel struct {
	merger  ParallelMerger
	runners []blades.Runnable
}
```
### Parameter Description
The Parallel struct contains two parameters: the executable task list (runners) and the result merge function (ParallelMerger).
#### 1. Executable Task List (runners)
:::note
- Type: `[]blades.Runnable`
- Purpose: List of tasks that need to be executed concurrently
- Characteristics: Each task can be any object that implements the **Runnable** interface
:::
#### 2. Result Merge Function (ParallelMerger)
:::note
- Type: `func(ctx context.Context, outputs []*blades.Message) (*blades.Message, error)`
- Purpose: Merges the output results of multiple parallel tasks into a single output
- Default Behavior: Merges the message parts of all outputs into a new message
:::
## Features
:::note
- **Concurrent Execution**: The Parallel Agent uses Go's concurrency mechanism to launch all tasks simultaneously, fully utilizing multi-core CPU performance.

- **Flexible Result Merging**: Provides the ability to customize the result merge function, allowing flexible handling of outputs from multiple tasks based on business requirements.

- **Unified Error Handling**: Uses the errgroup mechanism to ensure that if any task fails, all tasks are promptly terminated and an error is returned.

- **Task Composition Capability**: Supports any task that implements the [Runnable](file://e:\0_nebula\blades\core.go#L45-L48) interface, including other flow controllers (sequential, branch, loop, etc.).
:::
## Usage
### 1. Define the Executable Task List
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
### 2. Use the Parallel Agent
```go
parallel := flow.NewParallel(tasks)
result, err := parallel.Run(context.Background(), prompt)
```
### 3. Custom Result Merge Function
```go
erger := func(ctx context.Context, outputs []*blades.Message) (*blades.Message, error) {
    // default merge logic
    result := blades.NewMessage(blades.RoleAssistant)
    // ... merge logic ...
    return result, nil
}

parallel := flow.NewParallel(tasks, flow.WithParallelMerger(merger))
```
## Best Practices
:::tip
- **Reasonable Task Division**: Divide tasks that can be executed independently and are time-consuming into parallel tasks
- **Avoid Resource Contention**: Ensure there are no shared resource contention issues between parallel tasks
- **Design Appropriate Merging Strategy**: Design appropriate result merging logic based on business requirements
- **Performance Evaluation**: For lightweight tasks, parallel execution might actually reduce performance due to scheduling overhead
:::
## Code Example
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