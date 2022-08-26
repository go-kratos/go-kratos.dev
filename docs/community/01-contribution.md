---
id: contribution
title: 贡献指南
description: 贡献指南
keywords:
  - Go
  - Kratos
  - Toolkit
  - Framework
  - Microservices
  - Protobuf
  - gRPC
  - HTTP
---

Kratos 社区希望能够得到广大开发者的帮助，所以希望您在要提 issue 或者 pull request 之前花几分钟来阅读一遍这篇指南。

## Bug 修复

Kratos 使用 github issue 来管理问题。 如果您希望提交 bug 报告或帮忙修复 bug 时，请先确保已经搜索过已有的 issues 和 pull requests 并且阅读了我们的 [常见问题](https://go-kratos.dev/docs/intro/faq)。

提交 bug 报告时，请使用我们提供的 issue 模板，清楚地描述遇到的问题和复现方式，如果方便最好是可以提供一个最小复现仓库。

## 功能新增

为了准确的区分用户提出的需求是否是大多数用户的需求或合理需求，通过提案流程，向社区征集意见，社区采纳的提案将作为新功能实现。
提案流程为了尽可能的简单，流程中包含 proposal feature 和 PR 三个阶段，其中 proposal feature 为 issue，PR 为具体的功能实现。为了方便社区正确的理解提案的需求，proposal issue 中需要详细的描述功能的需求，和相关的参考资料或文献。当大多数社区用户赞同这个提案时，将会创建一个 feature issue 关联 proposal issue，feature issue 中 需要详细的描述功能的实现方式，以及功能演示，作为最后功能实现的参考，当功能实现完毕后，将会发起合并请求关联 proposal issue 和 feature issue，合并完成后，关闭所有 issue。

## 如何提交代码

如果您从未在 github 上提交过代码，请跟随如下步骤：

- 首先请 fork 项目到自己的 github 账户中
- 然后基于 main 分支 创建一个新的功能分支，并以功能命名如 feature-log
- 编写代码
- 提交代码到远端分支
- 在 github 中提交 PR 请求
- 等待 review 后合并到 main 分支

## Commit 提交规范

**注意在您提交 PR 请求时首先保证代码使用了正确的编码规范，并有完整的测试用例，提交 PR 的信息中最好关联相关的 issue，以减轻审核人员的工作负担。**

遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) 来规范化 commit message

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### type

提交的 commit 类型主要有以下几种

#### 主要类型

- fix 修复 bug
- feat 新增功能
- deps 依赖修改
- break 不兼容修改

#### 其他类型

- docs 文档修改
- refactor 重构
- style 代码格式
- test 测试用例
- chore 日常工作，如文档修改，示例等
- ci 构建脚本

### scope

提交的代码修改的代码文件范围：

- transport
- examples
- middleware
- config
- cmd
- etc.

### description

用简短的话语清晰的描述提交的代码做了什么事。

### body

补充说明，用于描述原因、目的、实现逻辑等可以省略。

### footer

- **当存在不兼容(breaking change)更新时，需要描述原因以及影响范围。**
- 关联相关的 issue，如 Refs #133。
- 可能涉及到的文档更新和其他模块的更新的 PR 关联。

### Examples

#### 只有提交信息

```
fix: The log debug level should be -1
```

#### 需要引起关注

```
refactor!(transport/http): replacement underlying implementation
```

#### 包含全部结构

```
fix(log): [BREAKING-CHANGE] unable to meet the requirement of log Library

Explain the reason, purpose, realization method, etc.

Close #777
Doc change on doc/#111
BREAKING CHANGE:
  Breaks log.info api, log.log should be used instead
```

## release 版本发布

**release** 时可以使用 `kratos changelog dev`命令生成 **release** 说明，工具会筛选出来从上一次 **release** 到现在的所有提交信息，然后根据提交的分类不同，主要汇总成以下几类

- Breaking Change
- Dependencies
- Bug Fixes
- Others

### 示例

通过 `kratos changelog dev` 生成的文本，只需简单修改即可作为 **release** 版本发布的说明

```
### New Features
- feat(cmd): add kratos changelog command (#1140)
- feat(examples): add  benchmark example (#1134)
- feat: add int/int32/Stringer support when get atomicValue (#1130)
### Others
- add form encoding (#1138)
- upgrade otel to v1 rc1 (#1132)
- http stop should use ctx (#1131)
```
