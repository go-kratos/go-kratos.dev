# Starlight Starter Kit: Basics

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

```
npm create astro@latest -- --template starlight
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Glacier theme

The English (`/`) and Chinese (`/zh-cn/`) homepages use Glacier, with matching Starlight documentation and blog styles. New visitors start in light mode; existing dark and system preferences are retained. Search, localized navigation, code copying, and mobile navigation use Starlight's existing functionality.

Production theme styles live in `src/styles/global.css` and `src/styles/glacier-landing.css`. Homepage content and shared architecture artwork live in `src/components/glacier/`.

## Theme design previews

Run `pnpm dev` and open `http://localhost:4321/theme-lab/` to compare three visual directions:

| Theme | Landing page | Documentation |
| :--- | :--- | :--- |
| Obsidian — 深空薄荷 | `/theme-lab/obsidian/` | `/theme-lab/obsidian/docs/` |
| Glacier — 冰川蓝图 | `/theme-lab/glacier/` | `/theme-lab/glacier/docs/` |
| Ultraviolet — 紫外轨道 | `/theme-lab/ultraviolet/` | `/theme-lab/ultraviolet/docs/` |

The preview toolbar switches themes while preserving the current page type. Documentation samples render the existing Chinese v3 quick-start content. Other documentation links lead to the current site. The three original design studies remain available for comparison, independently of the production Glacier theme; they are excluded from the sitemap and marked `noindex`.

Shared theme tokens and responsive styles live in `src/styles/theme-lab.css`, theme metadata and diagrams in `src/components/theme-lab/`, and preview routes in `src/pages/theme-lab/`.

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
