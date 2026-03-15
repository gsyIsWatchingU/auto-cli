import type { TemplateDefinition } from '../../types/index.js';

const template: TemplateDefinition = {
  meta: {
    name: 'vue',
    description: 'Vue 3 + Vite 企业级模板',
    version: '1.0.0',
    type: 'vue',
    icon: '🟢',
  },
  questions: [
    {
      type: 'confirm',
      name: 'typescript',
      message: '是否使用 TypeScript?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'router',
      message: '是否集成 Vue Router?',
      initial: true,
    },
    {
      type: 'select',
      name: 'stateManagement',
      message: '选择状态管理方案',
      choices: [
        { value: 'none', label: '不使用' },
        { value: 'pinia', label: 'Pinia (推荐)' },
        { value: 'vuex', label: 'Vuex' },
      ],
      initial: 1,
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: '是否集成 ESLint?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'prettier',
      message: '是否集成 Prettier?',
      initial: true,
    },
    {
      type: 'select',
      name: 'test',
      message: '选择测试框架',
      choices: [
        { value: 'none', label: '不使用' },
        { value: 'vitest', label: 'Vitest' },
        { value: 'jest', label: 'Jest' },
      ],
      initial: 1,
    },
    {
      type: 'confirm',
      name: 'api',
      message: '是否集成 API 请求封装 (Axios)?',
      initial: true,
    },
  ],
  files: [
    'src/**/*',
    'public/**/*',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    '.eslintrc.cjs',
    '.prettierrc',
    '.gitignore',
  ],
  dependencies: {
    'vue': '^3.4.0',
    'vue-router': '^4.2.0',
    'axios': '^1.6.0',
  },
  devDependencies: {
    'vite': '^5.0.0',
    '@vitejs/plugin-vue': '^5.0.0',
    'vite-plugin-vue-devtools': '^7.0.0',
  },
};

export default template;
