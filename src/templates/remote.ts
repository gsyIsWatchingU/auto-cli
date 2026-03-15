import path from 'path';
import fs from 'fs-extra';
import { log, createSpinner } from '../utils/index.js';
import type { RemoteTemplate } from '../types/index.js';

const CLI_DATA_DIR = path.join(process.env.APPDATA || process.env.HOME || '', '.gsy-cli');
const TEMPLATES_DIR = path.join(CLI_DATA_DIR, 'templates');

/**
 * 添加远程模板配置
 */
export async function addRemoteTemplate(
  name: string,
  url: string,
  branch: string = 'main'
): Promise<void> {
  const configPath = path.join(__dirname, '../../.template-config.json');

  let config: any = { templates: [] };
  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath);
  }

  // 检查是否已存在
  const existing = config.templates?.find((t: any) => t.name === name);
  if (existing) {
    throw new Error(`模板 "${name}" 已存在`);
  }

  config.templates.push({ name, url, branch });
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * 下载远程模板
 */
export async function downloadRemoteTemplate(
  name: string,
  url: string,
  branch: string = 'main'
): Promise<string> {
  const spinner = createSpinner(`正在下载模板 "${name}"...`);

  await fs.ensureDir(TEMPLATES_DIR);
  const templatePath = path.join(TEMPLATES_DIR, name);

  try {
    // 解析 URL
    const repoInfo = parseRepoUrl(url);

    // 下载并解压
    const { downloadAndExtract } = await import('../utils/download.js');
    await downloadAndExtract(repoInfo.url, templatePath, branch);

    spinner.succeed(`模板 "${name}" 下载完成`);
    return templatePath;
  } catch (error) {
    spinner.fail(`下载模板失败：${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

/**
 * 解析仓库 URL
 */
function parseRepoUrl(url: string): { url: string; type: 'github' | 'gitlab' | string } {
  // GitHub: user/repo 或 github:user/repo
  if (url.startsWith('github:')) {
    const repo = url.replace('github:', '');
    return { url: `https://github.com/${repo}/archive/refs/heads`, type: 'github' };
  }

  if (url.startsWith('gitlab:')) {
    const repo = url.replace('gitlab:', '');
    return { url: `https://gitlab.com/${repo}/-/archive`, type: 'gitlab' };
  }

  // 完整 URL
  if (url.startsWith('http')) {
    return { url, type: 'other' };
  }

  // 默认 GitHub
  return { url: `https://github.com/${url}/archive/refs/heads`, type: 'github' };
}

/**
 * 删除远程模板
 */
export async function removeRemoteTemplate(name: string): Promise<void> {
  const configPath = path.join(__dirname, '../../.template-config.json');

  if (!(await fs.pathExists(configPath))) {
    throw new Error('没有找到模板配置');
  }

  const config = await fs.readJson(configPath);
  config.templates = config.templates?.filter((t: any) => t.name !== name) || [];
  await fs.writeJson(configPath, config, { spaces: 2 });

  // 删除下载的模板
  const templatePath = path.join(TEMPLATES_DIR, name);
  if (await fs.pathExists(templatePath)) {
    await fs.remove(templatePath);
  }
}
