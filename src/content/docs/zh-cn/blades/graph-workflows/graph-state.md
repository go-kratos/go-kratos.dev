---
title: "Graph State"
---
图状态是Blades框架中图执行引擎的核心数据结构，用于在图的各个节点间传递和共享数据,它是一个键值对映射结构，用于在图执行过程中存储和传递数据且允许节点间共享信息，并支持状态的合并和克隆操作。

## 核心概念
graph state 用于存储图执行过程中需要传递的数据，键为字符串类型类型，值为任意类型，支持灵活的数据存储。
```go
type State map[string]any
```

### 1. 状态克隆 (Clone)
- 方法: 
```go
func (s State) Clone() State {
	return State(maps.Clone(map[string]any(s)))
}
```
- 作用: 创建状态的浅拷贝副本
- 特点: 使用`maps.Clone`实现，嵌套引用会被共享

### 2. 状态合并 (mergeStates)
- 方法: `mergeStates(base State, updates ...State) State`
- 作用: 将多个状态合并为一个状态
- 特点: 后面的状态会覆盖前面状态中相同的键

## 特性
blades中图状态有以下几种特点：
- **数据传递机制**:图状态作为数据载体在图的各个节点间流动，前一个节点的输出状态会作为后一个节点的输入状态。
- **状态隔离**:每个图执行任务都有独立的状态副本，确保并发执行时不会相互干扰。
- **灵活的数据结构**:支持任意类型的数据存储，可以满足各种业务场景的需求。
- **状态聚合**:当一个节点有多个前驱节点时，系统会自动将所有前驱节点的状态进行聚合。

## 使用方法
### 1. 创建初始状态
```go
initialState := graph.State{
    "key1": "value1",
    "key2": 123,
    "key3": []string{"a", "b", "c"},
}
```
### 2. 在节点处理函数中使用状态
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
### 3. 执行图任务
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
## 状态操作
### 状态克隆
```go
// clone state to avoid modifying the original state
newState := state.Clone()
newState["newKey"] = "newValue"
```
### 状态合并
```go
// merge multiple states
mergedState := mergeStates(state1, state2, state3)
```
### 状态访问
```go
// safely access state value
if value, ok := state["key"]; ok {
    // process value
    processValue(value)
}
```
## 代码示例
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

// 创建图
g := graph.NewGraph()
g.AddNode("process", processDataNode)
g.AddNode("validate", validateDataNode)
g.AddEdge("process", "validate")
g.SetEntryPoint("process")
g.SetFinishPoint("validate")

// 编译图
executor, err := g.Compile()
if err != nil {
    log.Fatal(err)
}

// 创建初始状态
initialState := graph.State{
    "input": "hello world",
    "source": "user_input",
}

// 执行图
result, err := executor.Execute(context.Background(), initialState)
if err != nil {
    log.Fatal(err)
}

// 输出结果
fmt.Printf("Final state: %+v\n", result)
```
