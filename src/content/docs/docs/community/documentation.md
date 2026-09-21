---
id: documentation
title: Documentation Guide
description: How to edit and check the Kratos documentation site
---

The documentation site is maintained in
[go-kratos/go-kratos.dev](https://github.com/go-kratos/go-kratos.dev) and built
with Astro and Starlight. Framework documentation has matching English and
Simplified Chinese trees.

## Set up the site

Use Node 20 and pnpm 8, matching the deployment workflow:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Edit English pages under `src/content/docs/docs` and Chinese pages under
`src/content/docs/zh-cn/docs`. The content collection is configured in
`src/content.config.ts`.

## Add or change a page

Keep the same relative path and frontmatter `id` in both languages. For example:

```text
src/content/docs/docs/component/application.md
src/content/docs/zh-cn/docs/component/application.md
```

Use the frontmatter `title` for the page title and begin body sections with
`##`; do not repeat a level-one heading. Write links as site-relative paths,
including the locale in Chinese links:

```markdown
[Errors](/docs/component/errors/)
[错误处理](/zh-cn/docs/component/errors/)
```

Topic pages are generated from directories by the sidebar configuration in
`astro.config.mjs`. An ordinary page appears automatically. Edit the configured
top-level topics only when adding or reorganizing a whole section, and update
the English and Chinese labels together.

## Write useful framework documentation

Describe observable behavior and the public API. Check claims against the
framework source and the project template rather than copying old pages or
README text. A component page should explain:

- what the component owns and what remains application responsibility;
- constructors, important options, defaults, and lifecycle;
- a complete example with the imports and surrounding setup a user needs;
- error, cancellation, concurrency, and shutdown behavior where relevant;
- links to the tutorial or component pages needed for the next step.

Keep examples small enough to understand, but preserve required error handling
and cleanup. Use current v3 module paths. When English and Chinese pages show the
same example, keep their fenced code exactly equal so they cannot drift.

## Run checks

Before opening a pull request, run:

```bash
pnpm docs:verify
pnpm examples:verify
pnpm build
```

`docs:verify` checks locale pairing, matching IDs, corresponding code blocks,
internal links, and unexpected v2 imports. `examples:verify` compiles and vets
the executable documentation examples with the supported Go toolchain.
`pnpm build` validates the content schema and renders the complete site.

If a code example depends on generated application types, update the full
service tutorial or the project template link as appropriate. Reusable
framework examples belong in `examples/docs-v3`, where tests can exercise their
actual behavior.

## Submit the change

Keep the pull request focused, explain which user workflow improves, and mention
the checks run. Include both languages for framework content. Follow the
[Contribution Guide](/docs/community/contribution/) for branch, commit, and
pull request conventions.
