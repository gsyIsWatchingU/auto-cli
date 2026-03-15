import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { listCommand } from './commands/list.js';
import { addCommand } from './commands/add.js';
import { configCommand } from './commands/config.js';
import pkg from '../package.json' assert { type: 'json' };

/**
 * 创建 CLI 主程序
 */
export function createCLI(): Command {
  const program = new Command();

  program
    .name('gsy-cli')
    .description('企业级团队脚手架 CLI 工具')
    .version(pkg.version);

  // create 命令
  program.addCommand(createCommand);

  // list 命令
  program.addCommand(listCommand);

  // add 命令
  program.addCommand(addCommand);

  // config 命令
  program.addCommand(configCommand);

  return program;
}
