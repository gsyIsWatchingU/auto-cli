import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { log } from '../utils/index.js';
import type { TemplateDefinition } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 加载所有可用模板
 */
export async function loadTemplates(): Promise<TemplateDefinition[]> {
  const templatesDir = path.join(__dirname, '../../templates');
  const templates: TemplateDefinition[] = [];

  // 确保模板目录存在
  await fs.ensureDir(templatesDir);

  const entries = await fs.readdir(templatesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const templateDef = await loadTemplateDefinition(entry.name);
      if (templateDef) {
        templates.push(templateDef);
      }
    }
  }

  // 加载远程模板
  const remoteTemplates = await loadRemoteTemplates();
  templates.push(...remoteTemplates);

  return templates;
}

/**
 * 加载单个模板定义
 */
async function loadTemplateDefinition(
  templateName: string
): Promise<TemplateDefinition | null> {
  try {
    const templateDir = path.join(__dirname, '../../templates', templateName);
    const defPath = path.join(templateDir, 'index.js');

    if (!(await fs.pathExists(defPath))) {
      // 尝试 TypeScript
      const tsDefPath = path.join(templateDir, 'index.ts');
      if (await fs.pathExists(tsDefPath)) {
        // 动态导入 TS 文件（需要 tsx）
        const def = await import(tsDefPath);
        return def.default || def;
      }
      return null;
    }

    const def = await import(defPath);
    return def.default || def;
  } catch (error) {
    log.warn(`加载模板 "${templateName}" 失败：${error instanceof Error ? error.message : error}`);
    return null;
  }
}

/**
 * 加载远程模板
 */
async function loadRemoteTemplates(): Promise<TemplateDefinition[]> {
  const configPath = path.join(__dirname, '../../.template-config.json');

  if (!(await fs.pathExists(configPath))) {
    return [];
  }

  try {
    const config = await fs.readJson(configPath);
    const remoteTemplates: TemplateDefinition[] = [];

    if (config.templates) {
      for (const template of config.templates) {
        remoteTemplates.push({
          meta: {
            name: template.name,
            description: template.description || '远程模板',
            version: template.version || '1.0.0',
            type: 'custom',
          },
          questions: [],
          files: [],
        });
      }
    }

    return remoteTemplates;
  } catch {
    return [];
  }
}

/**
 * 加载指定模板
 */
export async function loadTemplate(
  templateName: string
): Promise<{ path: string; definition: TemplateDefinition | null }> {
  // 检查是否是远程模板
  const configPath = path.join(__dirname, '../../.template-config.json');

  if (await fs.pathExists(configPath)) {
    const config = await fs.readJson(configPath);
    const remoteTemplate = config.templates?.find((t: any) => t.name === templateName);

    if (remoteTemplate) {
      // 下载远程模板
      const { downloadRemoteTemplate } = await import('./remote.js');
      const templatePath = await downloadRemoteTemplate(templateName, remoteTemplate.url, remoteTemplate.branch);
      return { path: templatePath, definition: null };
    }
  }

  // 本地模板 - 使用 files 子目录
  const templateBasePath = path.join(__dirname, '../../templates', templateName);
  const templatePath = path.join(templateBasePath, 'files');

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`模板 "${templateName}" 不存在`);
  }

  const definition = await loadTemplateDefinition(templateName);

  return { path: templatePath, definition };
}

/**
 * 获取模板的问题列表
 */
export async function getTemplateQuestions(
  templateName: string
): Promise<any[]> {
  const templateDir = path.join(__dirname, '../../templates', templateName);
  const questionsPath = path.join(templateDir, 'questions.js');

  if (await fs.pathExists(questionsPath)) {
    const questions = await import(questionsPath);
    return questions.default || questions;
  }

  return [];
}
