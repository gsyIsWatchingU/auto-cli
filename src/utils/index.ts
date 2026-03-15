import chalk from 'chalk';
import ora from 'ora';
import { ProjectConfig, TemplateQuestion, ProjectConfig as Answer } from '../types/index.js';

/**
 * 日志工具
 */
export const log = {
  info: (msg: string) => {
    console.log(chalk.blue('ℹ'), msg);
  },
  success: (msg: string) => {
    console.log(chalk.green('✔'), msg);
  },
  error: (msg: string) => {
    console.log(chalk.red('✖'), msg);
  },
  warn: (msg: string) => {
    console.log(chalk.yellow('⚠'), msg);
  },
  step: (msg: string) => {
    console.log(chalk.cyan('➜'), msg);
  },
};

/**
 * 创建 spinner 加载动画
 */
export function createSpinner(text: string) {
  return ora({
    text: chalk.cyan(text),
    color: 'cyan',
    spinner: 'dots',
  }).start();
}

/**
 * 睡眠指定毫秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 验证项目名称
 */
export function validateProjectName(name: string): boolean | string {
  if (!name || name.trim().length === 0) {
    return '项目名称不能为空';
  }

  if (name.length > 214) {
    return '项目名称过长';
  }

  // npm 包名验证
  const npmValidation = /^[a-z0-9-~][a-z0-9-._~]*$/.test(name);
  if (!npmValidation) {
    return '项目名称只能包含小写字母、数字、连字符和下划线';
  }

  if (name.startsWith('-') || name.endsWith('-')) {
    return '项目名称不能以连字符开头或结尾';
  }

  return true;
}

/**
 * 格式化包名为可显示的格式
 */
export function formatPackageName(name: string): string {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 获取默认作者名（从 git config）
 */
export async function getDefaultAuthor(): Promise<string> {
  try {
    const { execSync } = await import('child_process');
    const name = execSync('git config user.name', {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    return name || 'developer';
  } catch {
    return 'developer';
  }
}

/**
 * 检查目录是否为空
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  const fs = await import('fs-extra');
  const files = await fs.readdir(dirPath);
  return files.length === 0;
}

/**
 * 检查目录是否存在
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  const fs = await import('fs-extra');
  return fs.pathExists(dirPath);
}

/**
 * 获取可用模板问题列表
 */
export function getTemplateQuestions(
  templateQuestions: TemplateQuestion[]
): TemplateQuestion[] {
  return templateQuestions;
}
