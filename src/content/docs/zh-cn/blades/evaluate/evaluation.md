---
title: "评估"
---
Evaluator是Blades框架中用于评估AI模型响应质量的核心组件，它提供了结构化的方式来判断模型输出的相关性和准确性。

## 核心概念
Evaluator用于返回评估和反馈结果，其接口结构结构如下：
```go
type Evaluator interface {
	Evaluate(context.Context, *blades.Prompt) (*Evaluation, error)
}
```

### Evaluation
Evaluation结构体用于表示评估结果。
- **Pass**: 表示模型输出是否满足评估标准。
- **Score**: 表示模型输出与预期结果的相似度评分，取值范围[0,1]，值越高表示越相似。
- **Feedback**: 表示评估结果的反馈信息。
```go
type Evaluation struct {
	Pass     bool      `json:"pass" jsonschema:"Indicates whether the response satisfies the evaluation criteria."`
	Score    float64   `json:"score" jsonschema:"LLM-judged similarity to the expected response; score in [0,1], higher is better."`
	Feedback *Feedback `json:"feedback" jsonschema:"Structured feedback on the evaluation results."`
}
```

### Feedback
Feedback结构体用于表示评估结果的反馈信息。
```go
type Feedback struct {
	Summary     string   `json:"summary" jsonschema:"Short summary of evaluation results."`
	Details     string   `json:"details" jsonschema:"Detailed explanation of strengths, weaknesses, and reasoning."`
	Suggestions []string `json:"suggestions" jsonschema:"List of recommended improvements or fixes."`
}
```
## 特性
- **AI驱动评估**:使用专门的AI模型来评估其他AI模型的输出质量，提供更智能的评估能力。
- **结构化反馈**:提供结构化的反馈信息，包括摘要、详细说明和改进建议。
- **标准化接口**:通过统一的接口设计，支持不同类型的评估器实现。
- **灵活配置**:支持自定义评估模板和模型配置，适应不同的评估场景。
## 使用方法

### 1. 创建评估器
```go
evaluator, err := evaluate.NewCriteria(
    "Evaluation Agent",
    blades.WithModel("gpt-4"),
    blades.WithProvider(openai.NewChatProvider()),
)
if err != nil {
    log.Fatal(err)
}
```
### 2. 构造评估提示
```go
prompt, err := blades.NewPromptTemplate().
    System(evaluationTmpl, map[string]any{
        "Input":  "What is the capital of France?",
        "Output": "Paris",
    }).
    Build()
if err != nil {
    log.Fatal(err)
}
```
### 3. 执行评估
```go
result, err := evaluator.Evaluate(context.Background(), prompt)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Pass: %t Score: %f\n", result.Pass, result.Score)
fmt.Printf("Feedback: %+v\n", result.Feedback)
```
## 最佳实践
:::tip
- **设计有效的评估模板**：评估模板应清晰地指导评估模型如何判断响应质量，包括具体的评估标准和评分规则。
- **选择合适的评估模型**：使用能力足够强的AI模型作为评估器，确保评估结果的准确性。
- **合理设置评估参数**：根据具体应用场景设置合适的温度、top-p等参数，平衡评估的一致性和创造性。
- **处理评估错误**：实现完善的错误处理机制，确保评估过程的稳定性。
- **持续优化评估标准**：根据实际使用情况不断优化评估标准和反馈机制。
:::
## 代码示例
```go
package examples

import (
	"context"
	"fmt"
	"log"

	"github.com/go-kratos/blades"
	"github.com/go-kratos/blades/contrib/openai"
	"github.com/go-kratos/blades/evaluate"
)

const evaluationTmpl = `You are a professional evaluation expert. Your task is to assess the relevance of AI model responses to a given prompt.

Please use the above guidelines to evaluate the AI model's response.

The input content is as follows:
{
  "User Prompt": {{ .Input }},
  "Model Response": {{ .Output }},
},in JSON Format`

func Evaluate_example() {
	// Test data
	qa := map[string]string{
		"what is the capital of france":  "Paris",
		"convert 5 kilometers to meters": "60 kilometers/hour.",
	}

	// Create evaluator
	evaluator, err := evaluate.NewCriteria(
		"Evaluation Agent",
		blades.WithModel("qwen-plus"),
		blades.WithProvider(openai.NewChatProvider()),
	)
	if err != nil {
		log.Fatal(err)
	}

	// Evaluate question-answer pairs one by one
	for question, answer := range qa {
		// Construct evaluation prompt
		prompt, err := blades.NewPromptTemplate().
			System(evaluationTmpl, map[string]any{
				"Input":  question,
				"Output": answer,
			}).
			User("make a evaluation").
			Build()
		if err != nil {
			log.Fatal(err)
		}

		// Execute evaluation
		result, err := evaluator.Evaluate(context.Background(), prompt)
		if err != nil {
			log.Fatal(err)
		}

		// Output results
		fmt.Printf("Question: %s\n", question)
		fmt.Printf("Answer: %s\n", answer)
		fmt.Printf("Pass: %t Score: %.2f\n", result.Pass, result.Score)
		if result.Feedback != nil {
			fmt.Printf("Summary: %s\n", result.Feedback.Summary)
			fmt.Printf("Details: %s\n", result.Feedback.Details)
			fmt.Printf("Suggestions: %v\n", result.Feedback.Suggestions)
		}
		fmt.Println("---")
	}
}
```
