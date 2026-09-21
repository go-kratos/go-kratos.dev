---
id: contribution
title: 贡献指南
description: 如何向 Kratos 报告问题和贡献代码
---

Kratos 通过 GitHub issue 和 pull request 开发框架。开始前先搜索已有 issue 和
pull request，并让一个 pull request 只处理一项完整且连贯的变更。

## 报告缺陷

使用仓库的 bug report 模板。一份有效报告应包含：

- Kratos 模块与版本、Go 版本和操作系统；
- 能复现问题的最小代码或仓库；
- 准确的命令、输入、实际结果和预期结果；
- 移除凭据和个人数据后的日志或 stack trace；
- 问题是否能在最新支持版本或 `main` 上复现。

问题咨询和配置问题有各自的 issue 模板。需要私下披露的安全问题不能提交为公开
issue，应遵守仓库安全策略。

## 提议新功能

较大的功能会经过 proposal、feature 和实现三个阶段。先创建 proposal issue，
说明用户问题、期望行为、备选方案、兼容性影响和相关资料。社区同意方向后，再用
feature issue 描述具体 API 与实现，并把实现 pull request 同时关联到两者。

投入大型修改前应先讨论公开 API 和行为。新增核心依赖、改变传输语义或引入破坏性
变化时，需要更清楚地说明动机，因为每个 Kratos 服务都可能承担后续维护成本。

## 准备代码变更

Fork 仓库，从最新 `main` 创建分支，并完成解决问题所需的最小完整变更。

```bash
git checkout -b fix/http-timeout
make clean
make lint
make test
```

`make clean` 通过仓库工具整理模块，`make lint` 运行配置的 linter，`make test`
运行模块测试。为改变的行为补充针对性测试，并重新生成受影响的 Protobuf 代码。
核心 CI 测试 Go 1.25.x 和 1.26.x，因此代码必须在两条支持版本线上编译。

仓库包含多个嵌套 Go 模块，尤其是 `contrib` 目录。应在 pull request 修改的每个
模块中运行检查，不要更新无关模块文件或生成产物。

## 提交 pull request

按照 pull request 模板说明具体问题、变更后的行为、验证方式、兼容性影响和关联
issue。工作未完成时先开 draft。调用方需要修改代码时必须给出迁移说明；公开行为
变化时同步更新英文和中文文档。

审阅者应能通过描述和测试复现修复。若重构会遮蔽需要审阅的行为，应把它拆开。

## Commit 与 pull request 标题

Kratos 使用 Conventional Commit 风格：

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer]
```

常用 type 包括：

| Type | 用途 |
| --- | --- |
| `feat` | 新行为 |
| `fix` | 缺陷修复 |
| `deps` | 依赖变化 |
| `break` 或 `!` | 破坏性变化 |
| `docs` | 只修改文档 |
| `refactor` | 不改变行为的代码重构 |
| `test` | 新增或修正测试 |
| `chore` | 维护工作与示例 |
| `ci` | CI 配置 |

常用 scope 包括 `transport`、`middleware`、`config`、`cmd` 和 `examples`。描述应
使用祈使句现在时，保持简洁，结尾不加句号。

```text
fix(transport/http): honor shutdown deadline
```

Body 用于解释动机和行为细节。不兼容变更使用 `BREAKING CHANGE:` footer；能完整
解决某个 issue 时使用 `Fixes #1234`。

## Release note

维护者可使用 `kratos changelog dev` 收集上次发布后的变化，并归类为破坏性变化、
依赖、缺陷修复和其他变化。生成文本只是起点；发布前应检查链接、改写不清楚的
条目，并补充迁移指南。

只修改文档时，请继续阅读[文档贡献指南](/zh-cn/docs/community/documentation/)。
