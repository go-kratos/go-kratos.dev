module.exports = {
  docs: [
    {
      type: 'category',
      label: '快速开始',
      collapsed: false,
      items: [
        'intro/overview',
        'getting-started/start',
        'intro/layout',
        'getting-started/usage',
        'getting-started/examples',
        'getting-started/plugin',
        'intro/faq'
      ],
    },
    {
      type: 'category',
      label: '框架组件',
      collapsed: false,
      items: [
        'component/api',
        'component/errors',
        'component/config',
        'component/log',
        'component/metrics',
        'component/registry',
        'component/encoding',
        'component/metadata',
        {
          type: 'category',
          label: 'Middleware',
          items: [
            'component/middleware/overview',
            'component/middleware/logging',
            'component/middleware/metrics',
            'component/middleware/recovery',
            'component/middleware/tracing',
            'component/middleware/validate',
          ],
        },
        {
          type: 'category',
          label: 'Transport',
          items: [
            'component/transport/overview',
            'component/transport/http',
            'component/transport/grpc',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '用户指南',
      collapsed: false,
      items: [
        'guide/api-protobuf',
        'guide/openapi',
        'guide/wire',
        'guide/ent',
      ],
    },
    {
      type: 'category',
      label: '运维指南',
      collapsed: false,
      items: [
        'devops/docker',
      ],
    },
    {
      type: 'category',
      label: '开源社区',
      collapsed: false,
      items: [
        'community/contribution',
      ],
    },
  ],
};
