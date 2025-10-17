// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightSidebarTopics from "starlight-sidebar-topics";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Kratos",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/go-kratos/kratos",
        },
      ],
      customCss: [
        "./src/styles/global.css",
      ],
      locales: {
        // 为此网站设置英语为默认语言。
        root: {
          label: "English",
          lang: "en",
        },
        // 简体中文文档在 `src/content/docs/zh-cn/` 中。
        "zh-cn": {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      components: {
        // 重写默认的 `Header` 组件。
        Header: "./src/components/Header.astro",
      },
      plugins: [
        starlightSidebarTopics([
          {
            label: "Kratos",
            link: "/kratos/",
            items: [
              {
                label: "intro",
                translations: { "zh-CN": "简介" },
                autogenerate: { directory: "/kratos/intro" },
              },
              {
                label: "getting-started",
                translations: { "zh-CN": "快速开始" },
                autogenerate: { directory: "/kratos/getting-started" },
              },
              {
                label: "guide",
                translations: { "zh-CN": "指南" },
                autogenerate: { directory: "/kratos/guide" },
              },
              {
                label: "component",
                translations: { "zh-CN": "组件" },
                autogenerate: { directory: "/kratos/component" },
              },
              {
                label: "devops",
                translations: { "zh-CN": "运维" },
                autogenerate: { directory: "/kratos/devops" },
              },
              {
                label: "community",
                translations: { "zh-CN": "社区" },
                autogenerate: { directory: "/kratos/community" },
              },
            ],
          },
          {
            label: "Blades",
            link: "/blades/",
            items: [
              { label: "Blades", autogenerate: { directory: "/en/blades/" } },
            ],
          },
        ]),
      ],
    }),
  ],
});
