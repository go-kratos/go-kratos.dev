---
title: "Evaluation"
---
:::note
Evaluator is the core component in the Blades framework for assessing the quality of AI model responses. It provides a structured way to judge the relevance and accuracy of model outputs.
:::
## Core Concepts
:::note
Evaluator is used to return evaluation and feedback results. Its interface structure is as follows:
:::
```go
type Evaluator interface {
	Evaluate(context.Context, *blades.Prompt) (*Evaluation, error)
}
```
### Evaluation
:::note
The Evaluation struct is used to represent the evaluation result.
- **Pass**: Indicates whether the model output meets the evaluation criteria.
- **Score**: Represents the similarity score between the model output and the expected result, range [0,1], higher is better.
- **Feedback**: Represents the feedback information for the evaluation result.
:::
```go
type Evaluation struct {
	Pass     bool      `json:"pass" jsonschema:"Indicates whether the response satisfies the evaluation criteria."`
	Score    float64   `json:"score" jsonschema:"LLM-judged similarity to the expected response; score in [0,1], higher is better."`
	Feedback *Feedback `json:"feedback" jsonschema:"Structured feedback on the evaluation results."`
}
```
### Feedback
:::note
The Feedback struct is used to represent the feedback information for the evaluation result.
:::
```go
type Feedback struct {
	Summary     string   `json:"summary" jsonschema:"Short summary of evaluation results."`
	Details     string   `json:"details" jsonschema:"Detailed explanation of strengths, weaknesses, and reasoning."`
	Suggestions []string `json:"suggestions" jsonschema:"List of recommended improvements or fixes."`
}
```
## Features
:::tip
- **AI-Driven Evaluation**: Uses specialized AI models to evaluate the output quality of other AI models, providing more intelligent evaluation capabilities.
- **Structured Feedback**: Provides structured feedback information, including summaries, detailed explanations, and improvement suggestions.
- **Standardized Interface**: Supports different types of evaluator implementations through a unified interface design.
- **Flexible Configuration**: Supports custom evaluation templates and model configurations to adapt to different evaluation scenarios.
:::
## Usage

### 1. Create an Evaluator
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
### 2. Construct Evaluation Prompt
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
### 3. Execute Evaluation
```go
result, err := evaluator.Evaluate(context.Background(), prompt)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Pass: %t Score: %f\n", result.Pass, result.Score)
fmt.Printf("Feedback: %+v\n", result.Feedback)
```
## Best Practices
:::tip
- **Design Effective Evaluation Templates**: Evaluation templates should clearly guide the evaluation model on how to judge response quality, including specific evaluation criteria and scoring rules.
- **Select Appropriate Evaluation Models**: Use sufficiently capable AI models as evaluators to ensure the accuracy of evaluation results.
- **Set Reasonable Evaluation Parameters**: Set appropriate parameters such as temperature and top-p according to the specific application scenario to balance consistency and creativity in evaluation.
- **Handle Evaluation Errors**: Implement robust error handling mechanisms to ensure the stability of the evaluation process.
- **Continuously Optimize Evaluation Criteria**: Continuously optimize evaluation criteria and feedback mechanisms based on actual usage.
:::
## Code Example
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