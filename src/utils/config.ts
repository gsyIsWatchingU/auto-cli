import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG_DIR = path.join(
  process.env.APPDATA || process.env.HOME || '',
  '.gsy-cli'
);
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * 加载配置
 */
export async function loadConfig(): Promise<any> {
  if (!(await fs.pathExists(CONFIG_FILE))) {
    return {};
  }

  try {
    return await fs.readJson(CONFIG_FILE);
  } catch {
    return {};
  }
}

/**
 * 保存配置
 */
export async function saveConfig(config: any): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

/**
 * 获取配置项
 */
export async function getConfig<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
  const config = await loadConfig();
  return config[key] ?? defaultValue;
}

/**
 * 设置配置项
 */
export async function setConfig(key: string, value: any): Promise<void> {
  const config = await loadConfig();
  config[key] = value;
  await saveConfig(config);
}
