export const themes = [
  { id: 'obsidian', number: '01', name: 'Obsidian', label: '深空薄荷', descriptor: 'PRECISION / MODULAR / FOCUSED', description: '深色石墨与薄荷绿，让代码和架构成为主角。紧凑、清晰，带有开发者工作台的精密感。', headline: ['让复杂的系统，', '从简单开始。'], en: 'Build with clarity.', accent: '#8ceac0' },
  { id: 'glacier', number: '02', name: 'Glacier', label: '冰川蓝图', descriptor: 'OPEN / STRUCTURED / CALM', description: '干净的冰白色、工程蓝和宽松留白。像一份精心设计的技术蓝图，让探索与阅读都更轻松。', headline: ['构建服务的能力，', '留给创造的空间。'], en: 'Space to build.', accent: '#295de0' },
  { id: 'ultraviolet', number: '03', name: 'Ultraviolet', label: '紫外轨道', descriptor: 'EXPRESSIVE / CONNECTED / BOLD', description: '午夜紫与柔和荧光交织，用轨道和大字排版呈现系统之间的连接。更鲜明，也更有品牌感。', headline: ['连接每一个服务，', '释放每一种可能。'], en: 'Make the connection.', accent: '#c1a2ff' },
] as const;
export type Theme = typeof themes[number];
