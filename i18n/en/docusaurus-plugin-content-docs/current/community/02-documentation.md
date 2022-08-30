---
id: documentation
title: Documentation Guide
description: Documentation Guide
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

This document is maintained in the repository [go-kratos/go-kratos.dev](https://github.com/go-kratos/go-kratos.dev) using the [docusaurus](https://docusaurus.io/) as a document system. When repository content is updated, Github Actions will be automatically triggered to build and deploy documents.

## Add/modify Documents

First fork document repository, and clone to local.

You can then add or modify the appropriate documents under the corresponding subdirectory in the docs directory. The document format is Markdown and supports some extended syntax, as well as specifically supported syntax
[Docusaurus: Markdown Features](https://docusaurus.io/docs/markdown-features)

Note the following:

- Subheadings of the body of the document should use a second or lower level of the title, i.e. `##` or `###` and so on, to avoid using a level 1 title.
- For other pages within the document, references can be made directly by something like`[document in a subfolder](subfolder/doc3.md)`
- If you add a new document, follow the instructions below to modify the sidebar so that the document can appear in the sidebar.

After committing to Github, create a Pull Request to the 'main' branch, waiting for merging by the maintenance team.

## Modify the sidebar

The entries for the sidebar are maintained in the file [sidebars.js](https://github.com/go-kratos/go-kratos.dev/blob/main/sidebars.js) If you need to modify the sidebar, edit this file.
Put subpath of `docs` and doc id into this .json file.

Please refer to the specific configuration method of this file [Docusaurus: Sidebar](https://docusaurus.io/docs/sidebar)

## Document translation

If you want to maintain multilingual translations, clone the document repository to local.

The corresponding language directory is in the `i18n` directory, such as the English version in `i18n/en/docusaurus-plugin-content-docs/current`, you can find or create a file corresponding to the `docs` directory, note that the id should be the same as the id of the corresponding file in `docs`. Once the appropriate document has been translated, it can be submitted.

Please refer to the advanced use of document translation [Docusaurus: i18n - Using git](https://docusaurus.io/docs/i18n/git)

## Document Specification

- The contents remain intact, with functional components fully represented. Simple examples or their links should be attached. Such efforts shall be made to guide the users and offer them answers as they read this materials.
- For code indentation, it needs to set space indent before duplication.
- The hierarchical directory should take the form of [Google AIP](https://google.aip.dev/121).
- What is lined with the numeral and the English is the Chinese characters with space,more [Chinese Copywriting Guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines).
- Reduce the diff before commit to ease the workload of the auditor.Recommand to use formatter such as **Prettier** to format.
- It's different to **End Of Line(EOL)** in multi-platforms.You can set to **End Of Line(EOL)** config to **LF(\n)** in editor to prevent a large number of errors in commit.
- Kratos shall begin with a capital letter “K”.
