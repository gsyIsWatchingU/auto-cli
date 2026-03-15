import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { log } from '../utils/index.js';
import type { Plugin } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 加载所有插件
 */
export async function loadPlugins(): Promise<Plugin[]> {
  const plugins: Plugin[] = [];

  // 1. 加载内置插件
  const builtinPlugins = await loadBuiltinPlugins();
  plugins.push(...builtinPlugins);

  // 2. 加载用户配置的插件
  const userPlugins = await loadUserPlugins();
  plugins.push(...userPlugins);

  return plugins;
}

/**
 * 加载内置插件
 */
async function loadBuiltinPlugins(): Promise<Plugin[]> {
  const pluginsDir = path.join(__dirname, '../plugins/builtin');
  const plugins: Plugin[] = [];

  if (!(await fs.pathExists(pluginsDir))) {
    return plugins;
  }

  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      try {
        const pluginPath = path.join(pluginsDir, entry.name, 'index.js');
        if (await fs.pathExists(pluginPath)) {
          const plugin = await import(pluginPath);
          plugins.push(plugin.default || plugin);
        }
      } catch (error) {
        log.warn(`加载内置插件 "${entry.name}" 失败：${error instanceof Error ? error.message : error}`);
      }
    }
  }

  return plugins;
}

/**
 * 加载用户配置的插件
 */
async function loadUserPlugins(): Promise<Plugin[]> {
  const configPath = path.join(__dirname, '../../.gsy-cli-config.json');
  const plugins: Plugin[] = [];

  if (!(await fs.pathExists(configPath))) {
    return plugins;
  }

  try {
    const config = await fs.readJson(configPath);
    const pluginPaths = config.plugins || [];

    for (const pluginPath of pluginPaths) {
      try {
        const resolvedPath = path.resolve(process.cwd(), pluginPath);
        if (await fs.pathExists(resolvedPath)) {
          const plugin = await import(resolvedPath);
          plugins.push(plugin.default || plugin);
        }
      } catch (error) {
        log.warn(`加载用户插件 "${pluginPath}" 失败：${error instanceof Error ? error.message : error}`);
      }
    }
  } catch (error) {
    log.warn(`加载插件配置失败：${error instanceof Error ? error.message : error}`);
  }

  return plugins;
}

/**
 * 注册插件
 */
export async function registerPlugin(plugin: Plugin): Promise<void> {
  const configPath = path.join(process.cwd(), '.gsy-cli-config.json');

  let config: any = { plugins: [] };
  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath);
  }

  if (!config.plugins) {
    config.plugins = [];
  }

  // 检查是否已注册
  if (config.plugins.some((p: any) => p.name === plugin.name)) {
    log.warn(`插件 "${plugin.name}" 已注册`);
    return;
  }

  config.plugins.push(plugin.name);
  await fs.writeJson(configPath, config, { spaces: 2 });
}
