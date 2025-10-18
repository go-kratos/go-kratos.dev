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
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
        "en": {
          label: "English",
          lang: "en",
        },
      },
      components: {
        // 重写默认的 `Header` 组件。
        Header: "./src/components/Header.astro",
      },
      plugins: [
        starlightSidebarTopics([
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
            link: "/docs/blades/",
            items: [
              { label: "Blades", autogenerate: { directory: "/docs/blades/" } },
            ],
          },
        ]),
      ],
    }),
  ],
});
