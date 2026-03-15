import { Command } from 'commander';
import { log, createSpinner } from '../utils/index.js';
import { addRemoteTemplate } from '../templates/remote.js';

/**
 * 添加远程模板命令
 */
export const addCommand = new Command('add')
  .description('添加远程模板')
  .argument('<name>', '模板名称')
  .argument('<url>', '模板仓库 URL (如：github:user/repo)')
  .option('-b, --branch <branch>', '分支名称', 'main')
  .action(async (name: string, url: string, options: { branch?: string }) => {
    try {
      const spinner = createSpinner('正在添加远程模板...');

      await addRemoteTemplate(name, url, options.branch);

      spinner.succeed(`模板 "${name}" 添加成功`);
      log.info(`使用方式：gsy-cli create my-project --template ${name}`);
    } catch (error) {
      log.error(
        error instanceof Error ? error.message : '添加模板失败'
      );
      process.exit(1);
    }
  });
