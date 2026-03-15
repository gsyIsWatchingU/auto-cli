import type { TemplateDefinition } from '../../types/index.js';

const template: TemplateDefinition = {
  meta: {
    name: 'node',
    description: 'Node.js TypeScript 企业级模板',
    version: '1.0.0',
    type: 'node',
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
      message: '是否集成 Express 框架?',
      initial: true,
    },
  ],
  files: [
    'src/**/*',
    'tests/**/*',
    'tsconfig.json',
    'vite.config.ts',
    '.eslintrc.cjs',
    '.prettierrc',
    '.gitignore',
  ],
  dependencies: {
    'express': '^4.18.0',
    'cors': '^2.8.5',
    'dotenv': '^16.3.0',
  },
  devDependencies: {
    '@types/express': '^4.17.0',
    '@types/cors': '^2.8.0',
    '@types/node': '^20.10.0',
    'tsx': '^4.7.0',
  },
};

export default template;
