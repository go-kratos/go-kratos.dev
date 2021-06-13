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
        'getting-started/faq'
      ],
    },
    {
      type: 'category',
      label: '用户指南',
      items: [
        'guide/api-protobuf',
        'guide/openapi',
        'guide/wire',
        'guide/ent',
      ],
    },
    {
      type: 'category',
      label: '代码/项目示例',
      items: [
        'example/overview',
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
            'component/transport/encoding',
          ],
        },
      ],
    },
  ],
};
