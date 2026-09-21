---
id: documentation
title: 文档贡献指南
description: 如何编辑和检查 Kratos 文档站点
---

文档站点维护在
[go-kratos/go-kratos.dev](https://github.com/go-kratos/go-kratos.dev)，使用
Astro 和 Starlight 构建。框架文档包含一一对应的英文与简体中文目录树。

## 设置站点

使用与部署 workflow 一致的 Node 20 和 pnpm 8：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

英文页面位于 `src/content/docs/docs`，中文页面位于
`src/content/docs/zh-cn/docs`。内容集合在 `src/content.config.ts` 中配置。

## 添加或修改页面

两种语言应使用相同相对路径和 frontmatter `id`。例如：

```text
src/content/docs/docs/component/application.md
src/content/docs/zh-cn/docs/component/application.md
```

页面标题使用 frontmatter `title`，正文小节从 `##` 开始，不要再写一级标题。站内
链接使用站点绝对路径，中文链接需要包含 locale：

```markdown
[Errors](/docs/component/errors/)
[错误处理](/zh-cn/docs/component/errors/)
```

`astro.config.mjs` 的 sidebar 配置会根据目录自动生成主题页面，普通页面会自动
出现。只有新增或重组整个章节时才修改顶层主题，并同时更新英文和中文标签。

## 编写有用的框架文档

文档应描述可观察行为和公开 API。所有说法都应以框架源码和项目模板为依据，不要
复制旧页面或过期 README。一个组件页面应说明：

- 组件负责什么，哪些工作仍由应用负责；
- 构造函数、重要选项、默认值和生命周期；
- 包含必要 import 与上下文的完整示例；
- 相关的错误、取消、并发和停止行为；
- 用户完成下一步所需的教程或组件链接。

示例应便于理解，同时保留必要的错误处理和资源清理，并使用当前 v3 模块路径。
英文与中文展示同一个例子时，代码围栏内容应完全相同，避免两边逐渐不一致。

## 运行检查

提交 pull request 前运行：

```bash
pnpm docs:verify
pnpm examples:verify
pnpm build
```

`docs:verify` 检查语言页面配对、相同 ID、对应代码块、站内链接和意外的 v2 import；
`examples:verify` 用支持的 Go 工具链编译、vet 可执行文档示例；`pnpm build` 校验
内容 schema 并渲染完整站点。

代码示例依赖生成的应用类型时，应根据用途更新完整服务教程或项目模板链接。可复用
的框架示例应放入 `examples/docs-v3`，由测试检查实际行为。

## 提交修改

Pull request 应保持聚焦，说明改善了哪个用户流程以及运行过哪些检查。框架内容需要
同时提供两种语言。分支、commit 和 pull request 约定见
[贡献指南](/zh-cn/docs/community/contribution/)。
