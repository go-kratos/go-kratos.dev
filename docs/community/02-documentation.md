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

然后在 docs 目录中的对应子目录下可以添加或修改相应的文档。文档格式为 Markdown，并支持一些扩展的语法，具体支持的语法请参考 [Docusaurus: Markdown Features](https://docusaurus.io/docs/markdown-features)

注意下列事项：

- 文档正文的子标题请使用二级或更低等级的标题，即`##`或`###`等，避免使用一级标题。
- 对于文档内其它页面可以直接通过类似`[document in a subfolder](subfolder/doc3.md)`进行引用
- 如果添加了新的文档，请按照后文的说明进行侧边栏的修改，以便文档能够展示在侧边栏中。

提交到 Github 后，向源仓库`main`分支发起 Pull Request, 等待维护团队合并。

## 修改侧边栏

侧边栏的条目维护在文件 [sidebars.js](https://github.com/go-kratos/go-kratos.dev/blob/main/sidebars.js) 中，如果需要修改侧边栏，请编辑此文件。
将`docs`下面的目录名和文档 id 填入 json 中。

该文件的具体配置方法请参考 [Docusaurus: Sidebar](https://docusaurus.io/docs/sidebar)

## 文档翻译

如果您要维护多语言翻译，请将文档仓库 clone 到本地。

在`i18n`目录下的对应语言目录，如英文版本在`i18n/en/docusaurus-plugin-content-docs/current`可以找到或创建与`docs`目录对应的文件，注意 id 要与`docs`中对应文件的 id 相同。进行相应的文档翻译后提交即可。

具体文档翻译功能的扩展使用，请参考 [Docusaurus: i18n - Using git](https://docusaurus.io/docs/i18n/git)

## 文档规范

- 内容要完整，需要充分体现组件的功能，并附带简要的示例或者示例的链接。力求达到用户看文档即可答疑。
- 代码的缩进，一定要设置为空格缩进再复制。
- 层级目录采用 [Google AIP](https://google.aip.dev/121) 结构。
- 对于中文内容部分，数字和英文两边是中文要加空格，具体参照[中文文案排版](https://github.com/sparanoid/chinese-copywriting-guidelines)。
- 在 commit 前尽量减少 diff，以减轻 review 的负担。推荐使用 **Prettier** 之类的 formatter 进行格式化。
- 因为各个平台默认的 EOL 不相同，为了防止 commit 时出现大面积的 diff，请统一将编辑器的 **End Of Line(EOL)** 选项改为 **LF(\n)**。
- Kratos 统一写法。K 大写。
- 翻译完自己读一遍，要通顺，要能理解。不追求严格一致，可以意译。review 的时候也会检验。不会翻译的词汇可以不翻译，review 的时候会查看。翻译完还是要自己先 review 一遍，不要出现遗漏段落。
