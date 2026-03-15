import { Command } from 'commander';
import { log } from '../utils/index.js';
import { loadConfig, saveConfig } from '../utils/config.js';

/**
 * 配置命令
 */
export const configCommand = new Command('config')
  .description('配置 CLI 选项')
  .option('-l, --list', '列出所有配置')
  .option('-g, --get <key>', '获取配置值')
  .option('-s, --set <key=value>', '设置配置值')
  .option('-r, --remove <key>', '删除配置')
  .action(async (options: {
    list?: boolean;
    get?: string;
    set?: string;
    remove?: string;
  }) => {
    try {
      const config = await loadConfig();

      if (options.list) {
        log.info('当前配置:');
        console.log(JSON.stringify(config, null, 2));
        return;
      }

      if (options.get) {
        const value = config[options.get as keyof typeof config];
        if (value !== undefined) {
          console.log(value);
        } else {
          log.info(`配置 "${options.get}" 不存在`);
        }
        return;
      }

      if (options.set) {
        const [key, ...valueParts] = options.set.split('=');
        const value = valueParts.join('=');
        if (!key || value === undefined) {
          log.error('格式错误，请使用：-s key=value');
          process.exit(1);
        }
        (config as any)[key] = value;
        await saveConfig(config);
        log.success(`配置 "${key}" 已设置`);
        return;
      }

      if (options.remove) {
        delete (config as any)[options.remove];
        await saveConfig(config);
        log.success(`配置 "${options.remove}" 已删除`);
        return;
      }

      // 没有任何选项时，显示帮助
      configCommand.outputHelp();
    } catch (error) {
      log.error(
        error instanceof Error ? error.message : '配置操作失败'
      );
      process.exit(1);
    }
  });
