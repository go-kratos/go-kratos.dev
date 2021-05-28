module.exports = {
  docs: [
    {
      type: 'category',
      label: '简介',
      items: [
        'intro/overview',
        'intro/layout',
        'intro/changelog'
      ],
    },
    {
      type: 'category',
      label: '快速上手',
      items: [
        'getting-started/start',
        'getting-started/usage',
        'getting-started/wire',
        'getting-started/data',
        'getting-started/faq'
      ],
    },
    {
      type: 'category',
      label: '用户指南',
      items: [
        'guide/api-protobuf',
        'guide/openapi',
      ],
    },
    {
      type: 'category',
      label: '插件',
      items: [
        'plugin/overview',
      ],
    },
    {
      type: 'category',
      label: '框架组件',
      items: [
        'component/api',
        'component/errors',
        'component/config',
        'component/logging',
        'component/metrics',
        'component/tracing',
        'component/registry',
        'component/middleware',
        'component/transport',
      ],
    },
  ],
};
