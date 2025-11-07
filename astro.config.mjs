// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightSidebarTopics from "starlight-sidebar-topics";
import starlightBlog from "starlight-blog";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://go-kratos.dev",
  base: "/",
  output: "static",
  integrations: [
    starlight({
      title: "Kratos",
      logo: {
        src: "./src/assets/logo.svg",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/go-kratos/kratos",
        },
      ],
      customCss: ["./src/styles/global.css"],
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        "zh-cn": {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      components: {
        Header: "./src/components/Header.astro",
      },
      expressiveCode: {
        tabWidth: 4,
      },
      plugins: [
        starlightBlog(),
        starlightSidebarTopics(
          [
            {
              label: "Kratos Framework",
              link: "/docs/",
              items: [
                {
                  label: "intro",
                  translations: { "zh-CN": "简介" },
                  autogenerate: { directory: "/docs/intro" },
                },
                {
                  label: "getting-started",
                  translations: { "zh-CN": "快速开始" },
                  autogenerate: { directory: "/docs/getting-started" },
                },
                {
                  label: "guide",
                  translations: { "zh-CN": "指南" },
                  autogenerate: { directory: "/docs/guide" },
                },
                {
                  label: "component",
                  translations: { "zh-CN": "组件" },
                  autogenerate: { directory: "/docs/component" },
                },
                {
                  label: "devops",
                  translations: { "zh-CN": "运维" },
                  autogenerate: { directory: "/docs/devops" },
                },
                {
                  label: "community",
                  translations: { "zh-CN": "社区" },
                  autogenerate: { directory: "/docs/community" },
                },
              ],
            },
            {
              label: "Blades Agent",
              link: "/blades/",
              items: [
                {
                  label: "Get started",
                  autogenerate: { directory: "/blades/get-started" },
                },
                {
                  label: "Tutorials",
                  autogenerate: { directory: "/blades/tutorial" },
                },
                {
                  label: "Agent Patterns",
                  autogenerate: { directory: "/blades/agent-patterns" },
                },
                { label: "Graph Workflows", link: "/blades/graph-state" },
                {
                  label: "Model Providers",
                  autogenerate: { directory: "/blades/model-providers" },
                },
                { label: "Evaluation", link: "/blades/evaluate" },
              ],
            },
          ],
          { exclude: ["**/blog/**"] }
        ),
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
