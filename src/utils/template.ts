import ejs from 'ejs';
import type { ProjectConfig } from '../types/index.js';

/**
 * 处理 EJS 模板文件
 */
export async function processTemplateFile(
  content: string,
  config: ProjectConfig
): Promise<string> {
  try {
    // 检查是否是 EJS 模板
    if (content.includes('<%') || content.includes('%>')) {
      return ejs.render(content, config);
    }

    // 如果不是 EJS 模板，直接返回
    return content;
  } catch (error) {
    // 如果渲染失败，返回原始内容
    console.warn('EJS 渲染失败:', error instanceof Error ? error.message : error);
    return content;
  }
}

/**
 * 渲染文件名（处理 EJS 模板文件名）
 */
export function renderFilename(
  filename: string,
  config: ProjectConfig
): string {
  if (filename.endsWith('.ejs')) {
    try {
      const rendered = ejs.render(filename, config);
      return rendered.replace(/\.ejs$/, '');
    } catch {
      return filename.replace(/\.ejs$/, '');
    }
  }
  return filename;
}
