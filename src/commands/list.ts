import { Command } from 'commander';
import { log } from '../utils/index.js';
import { loadTemplates } from '../templates/index.js';

/**
 * 列出可用模板命令
 */
export const listCommand = new Command('list')
  .description('列出可用模板')
  .action(async () => {
    try {
      const templates = await loadTemplates();

      if (templates.length === 0) {
        log.info('没有找到可用的模板');
        return;
      }

      log.info('可用模板:');
      console.log();

      for (const template of templates) {
        const icon = template.meta.icon || '📦';
        console.log(`  ${icon} ${template.meta.name}`);
        if (template.meta.description) {
          console.log(`     ${template.meta.description}`);
        }
        console.log();
      }
    } catch (error) {
      log.error(
        error instanceof Error ? error.message : '加载模板列表失败'
      );
      process.exit(1);
    }
  });
