---
id: documentation
title: 文档维护
description: 文档维护
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

本文档维护在 [go-kratos/go-kratos.dev](https://github.com/go-kratos/go-kratos.dev) 仓库中，采用 [docusaurus](https://docusaurus.io/) 作为文档系统。仓库内容更新后，会自动触发 Github Actions 对文档进行生成和部署。

## 添加/修改文档
首先 fork 文档仓库，并 clone 到本地。

然后在docs目录中的对应子目录下可以添加或修改相应的文档。文档格式为 Markdown，并支持一些扩展的语法，具体支持的语法请参考 [Docusaurus: Markdown Features](https://docusaurus.io/docs/markdown-features)

注意下列事项：
* 文档正文的子标题请使用二级或更低等级的标题，即`##`或`###`等，避免使用一级标题。
* 对于文档内其它页面可以直接通过类似`[document in a subfolder](subfolder/doc3.md)`进行引用
* 如果添加了新的文档，请按照后文的说明进行侧边栏的修改，以便文档能够展示在侧边栏中。

提交到Github后，向源仓库`main`分支发起 Pull Request, 等待维护团队合并。

## 修改侧边栏
侧边栏的条目维护在文件 [sidebars.js](https://github.com/go-kratos/go-kratos.dev/blob/main/sidebars.js) 中，如果需要修改侧边栏，请编辑此文件。
将`docs`下面的目录名和文档 id 填入 json 中。

该文件的具体配置方法请参考 [Docusaurus: Sidebar](https://docusaurus.io/docs/sidebar)

## 文档翻译
如果您要维护文档，请将文档仓库 clone 到本地。

在`i18n`目录下的对应语言目录如，英文版本在`i18n/en/docusaurus-plugin-content-docs/current`可以找到或创建与`docs`目录对应的文件，注意 id 要与`docs`中对应文件的 id 相同。进行相应的文档翻译后提交即可。

具体文档翻译功能的扩展使用，请参考 [Docusaurus: i18n - Using git](https://docusaurus.io/docs/i18n/git)
