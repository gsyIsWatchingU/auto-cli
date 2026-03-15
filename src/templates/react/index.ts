import type { TemplateDefinition } from '../../types/index.js';

const template: TemplateDefinition = {
  meta: {
    name: 'react',
    description: 'React 18 + Vite 企业级模板',
    version: '1.0.0',
    type: 'react',
    icon: '🔵',
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
      message: '是否集成 React Router?',
      initial: true,
    },
    {
      type: 'select',
      name: 'stateManagement',
      message: '选择状态管理方案',
      choices: [
        { value: 'none', label: '不使用' },
        { value: 'redux', label: 'Redux Toolkit' },
        { value: 'zustand', label: 'Zustand' },
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
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'react-router-dom': '^6.20.0',
    'axios': '^1.6.0',
  },
  devDependencies: {
    'vite': '^5.0.0',
    '@vitejs/plugin-react': '^4.2.0',
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
  },
};

export default template;
