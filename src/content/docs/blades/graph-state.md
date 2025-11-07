---
title: "Graph State"
---
:::note
Graph State is the core data structure of the graph execution engine in the Blades framework, used to pass and share data between various nodes in the graph. It is a key-value mapping structure used to store and pass data during graph execution, allows information sharing between nodes, and supports state merging and cloning operations.
:::
## Core Concepts
:::tip
Graph state is used to store data that needs to be passed during graph execution. The key is of string type, and the value can be of any type, supporting flexible data storage.
```go
type State map[string]any
```
:::
### 1. State Clone
:::note
- Method:
```go
func (s State) Clone() State {
	return State(maps.Clone(map[string]any(s)))
}
```
- Purpose: Creates a shallow copy of the state
- Characteristic: Implemented using `maps.Clone`, nested references are shared
:::
### 2. State Merge (mergeStates)
:::note
- Method: `mergeStates(base State, updates ...State) State`
- Purpose: Merges multiple states into a single state
- Characteristic: Later states will overwrite keys that exist in earlier states
:::
## Characteristics
:::note
The graph state in Blades has the following characteristics:
- **Data Passing Mechanism**: The graph state acts as a data carrier flowing between various nodes in the graph; the output state of a previous node becomes the input state for the next node.
- **State Isolation**: Each graph execution task has an independent state copy, ensuring no interference during concurrent execution.
- **Flexible Data Structure**: Supports storing data of any type, meeting the needs of various business scenarios.
- **State Aggregation**: When a node has multiple predecessor nodes, the system automatically aggregates the states from all predecessor nodes.
:::

## Usage
### 1. Create Initial State
```go
initialState := graph.State{
    "key1": "value1",
    "key2": 123,
    "key3": []string{"a", "b", "c"},
}
```
### 2. Using State in Node Handler Functions
```go
handler := func(ctx context.Context, state graph.State) (graph.State, error) {
    // loading state
    value1 := state["key1"].(string)
    
    // updating state
    newState := state.Clone()
    newState["result"] = "processed: " + value1
    
    return newState, nil
}
```
### 3. Executing Graph Tasks
```go
// create graph and add nodes
g := graph.NewGraph()
g.AddNode("node1", handler1)
g.AddNode("node2", handler2)
g.AddEdge("node1", "node2")
g.SetEntryPoint("node1")
g.SetFinishPoint("node2")

// compile graph and execute
executor, err := g.Compile()
if err != nil {
    log.Fatal(err)
}

result, err := executor.Execute(context.Background(), initialState)
```
## State Operations
:::note
### State Cloning
```go
// clone state to avoid modifying the original state
newState := state.Clone()
newState["newKey"] = "newValue"
```
### State Merging
```go
// merge multiple states
mergedState := mergeStates(state1, state2, state3)
```
### State Access
```go
// safely access state value
if value, ok := state["key"]; ok {
    // process value
    processValue(value)
}
```
:::
## Code Example
```go
// define node handler functions
func processDataNode(ctx context.Context, state graph.State) (graph.State, error) {
    // read input data
    inputData, ok := state["input"].(string)
    if !ok {
        return nil, fmt.Errorf("missing input data")
    }
    
    // process data : here we convert the input data to uppercase(eg: a-> A)
    processedData := strings.ToUpper(inputData)
    
    // create new state
    newState := state.Clone()
    newState["processed"] = processedData
    newState["timestamp"] = time.Now()
    
    return newState, nil
}

func validateDataNode(ctx context.Context, state graph.State) (graph.State, error) {
    // read processed data
    processedData, ok := state["processed"].(string)
    if !ok {
        return nil, fmt.Errorf("missing processed data")
    }
    
    // validate data
    isValid := len(processedData) > 0
    
    // update state
    newState := state.Clone()
    newState["valid"] = isValid
    newState["validation_time"] = time.Now()
    
    return newState, nil
}

// create graph
g := graph.NewGraph()
g.AddNode("process", processDataNode)
g.AddNode("validate", validateDataNode)
g.AddEdge("process", "validate")
g.SetEntryPoint("process")
g.SetFinishPoint("validate")

// compile graph
executor, err := g.Compile()
if err != nil {
    log.Fatal(err)
}

// create initial state
initialState := graph.State{
    "input": "hello world",
    "source": "user_input",
}

// execute graph
result, err := executor.Execute(context.Background(), initialState)
if err != nil {
    log.Fatal(err)
}

// output result
fmt.Printf("Final state: %+v\n", result)
```