import { Command } from 'commander';
import prompts from 'prompts';
import { createProject } from './create-project.js';
import { loadTemplates } from '../templates/index.js';
import {
  log,
  validateProjectName,
  getDefaultAuthor,
  formatPackageName,
} from '../utils/index.js';
import type { ProjectConfig, TemplateDefinition, CreateCommandOptions } from '../types/index.js';

/**
 * 创建命令
 */
export const createCommand = new Command('create')
  .description('创建新项目')
  .argument('<name>', '项目名称')
  .option('-t, --template <template>', '使用指定模板')
  .option('--typescript', '使用 TypeScript')
  .option('--eslint', '集成 ESLint')
  .option('--prettier', '集成 Prettier')
  .option('--commitlint', '集成 Commitlint')
  .option('--force', '强制覆盖已存在的目录')
  .option('-v, --verbose', '输出详细日志')
  .action(async (name: string, options: CreateCommandOptions) => {
    try {
      // 验证项目名称
      const validation = validateProjectName(name);
      if (validation !== true) {
        log.error(validation);
        process.exit(1);
      }

      // 获取默认作者
      const defaultAuthor = await getDefaultAuthor();

      // 加载可用模板
      const templates = await loadTemplates();

      // 如果指定了模板，验证是否存在
      let selectedTemplate: TemplateDefinition | undefined;
      if (options.template) {
        selectedTemplate = templates.find(
          (t) => t.meta.name === options.template
        );
        if (!selectedTemplate) {
          log.error(`模板 "${options.template}" 不存在`);
          log.info('可用模板：' + templates.map((t) => t.meta.name).join(', '));
          process.exit(1);
        }
      }

      // 交互式问答
      const answers = await prompts([
        // 项目模板选择
        {
          type: options.template || templates.length === 1 ? null : 'select',
          name: 'template',
          message: '选择项目模板',
          choices: templates.map((t) => ({
            value: t.meta.name,
            title: t.meta.name + (t.meta.description ? ` - ${t.meta.description}` : ''),
          })),
          initial: 0,
        },
        // 项目描述
        {
          type: 'text',
          name: 'description',
          message: '项目描述',
          initial: formatPackageName(name),
        },
        // 作者
        {
          type: 'text',
          name: 'author',
          message: '作者',
          initial: defaultAuthor,
        },
        // TypeScript
        {
          type: 'confirm',
          name: 'typescript',
          message: '是否使用 TypeScript?',
          initial: options.typescript ?? true,
        },
        // ESLint
        {
          type: 'confirm',
          name: 'eslint',
          message: '是否集成 ESLint?',
          initial: options.eslint ?? true,
        },
        // Prettier
        {
          type: 'confirm',
          name: 'prettier',
          message: '是否集成 Prettier?',
          initial: options.prettier ?? true,
        },
        // Commitlint + Husky
        {
          type: 'confirm',
          name: 'commitlint',
          message: '是否集成 Git 提交规范 (Commitlint + Husky)?',
          initial: options.commitlint ?? true,
        },
        // 状态管理
        {
          type: (prev) =>
            prev.template === 'vue' ? 'select' : null,
          name: 'stateManagement',
          message: '选择状态管理方案',
          choices: [
            { value: 'none', title: '不使用状态管理' },
            { value: 'pinia', title: 'Pinia (推荐)' },
            { value: 'vuex', title: 'Vuex' },
          ],
          initial: 1,
        },
        // 测试框架
        {
          type: 'select',
          name: 'test',
          message: '选择测试框架',
          choices: [
            { value: 'none', title: '不使用测试框架' },
            { value: 'vitest', title: 'Vitest (推荐)' },
            { value: 'jest', title: 'Jest' },
          ],
          initial: 1,
        },
        // 是否安装依赖
        {
          type: 'confirm',
          name: 'installDeps',
          message: '是否立即安装依赖?',
          initial: true,
        },
      ], {
        onCancel: () => {
          log.warn('操作已取消');
          process.exit(1);
        },
      });

      // 合并配置
      const config: ProjectConfig = {
        name,
        template: (selectedTemplate?.meta.name || answers.template || 'vue') as ProjectConfig['template'],
        description: answers.description || formatPackageName(name),
        author: answers.author || defaultAuthor,
        typescript: answers.typescript ?? options.typescript ?? true,
        eslint: answers.eslint ?? options.eslint ?? true,
        prettier: answers.prettier ?? options.prettier ?? true,
        commitlint: answers.commitlint ?? options.commitlint ?? true,
        pinia: answers.stateManagement === 'pinia',
        vuex: answers.stateManagement === 'vuex',
        vitest: answers.test === 'vitest',
        jest: answers.test === 'jest',
        router: true,
        api: true,
      };

      // 创建项目
      await createProject(config, {
        ...options,
        installDeps: answers.installDeps,
      });

      log.success(`项目 "${name}" 创建成功!`);
      log.info(`运行以下命令开始开发:`);
      console.log(`  cd ${name}`);
      if (answers.installDeps) {
        console.log('  npm run dev');
      } else {
        console.log('  npm install');
        console.log('  npm run dev');
      }
    } catch (error) {
      log.error(
        error instanceof Error ? error.message : '创建项目失败'
      );
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });
