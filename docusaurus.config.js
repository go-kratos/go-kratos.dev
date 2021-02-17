module.exports = {
  title: 'Kratos',
  tagline: 'A Go framework for microservices.',
  url: 'https://v2.go-kratos.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'go-kratos',
  projectName: 'go-kratos.dev',
  themeConfig: {
    sidebarCollapsible: false,
    navbar: {
      title: 'Kratos',
      // logo: {
      //   alt: 'Kratos Logo',
      //   src: 'img/logo.svg',
      // },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://pkg.go.dev/github.com/go-kratos/kratos/v2/',
          label: 'API',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'right' },
        {
          href: 'https://github.com/go-kratos/kratos',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Guides',
              to: 'docs/',
            },
            {
              label: 'v1 Docs',
              href: 'http://v1.go-kratos.dev/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/BWzJsUJ',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/go-kratos/kratos',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} go-kratos.dev`,
    },
    prism: {
      additionalLanguages: ['protobuf', 'toml'],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/go-kratos/go-kratos.dev/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/go-kratos/go-kratos.dev/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en", "zh"],
      },
    ],
  ],
};
