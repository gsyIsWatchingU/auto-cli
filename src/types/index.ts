/**
 * CLI 核心类型定义
 */

// 项目模板类型
export type TemplateType = 'vue' | 'react' | 'node' | 'custom';

// 项目配置接口
export interface ProjectConfig {
  name: string;
  template: TemplateType;
  description: string;
  author: string;
  // 功能选项
  typescript?: boolean;
  eslint?: boolean;
  prettier?: boolean;
  commitlint?: boolean;
  husky?: boolean;
  // 状态管理
  pinia?: boolean;
  vuex?: boolean;
  redux?: boolean;
  // 测试
  vitest?: boolean;
  jest?: boolean;
  // 其他
  router?: boolean;
  api?: boolean;
}

// 模板元数据
export interface TemplateMeta {
  name: string;
  description: string;
  version: string;
  type: TemplateType;
  icon?: string;
}

// 模板问题定义
export interface TemplateQuestion {
  type: 'text' | 'confirm' | 'select' | 'multiselect';
  name: string;
  message: string;
  choices?: Array<{ value: string; label: string }>;
  initial?: any;
  validate?: (value: any) => boolean | string;
}

// 模板定义
export interface TemplateDefinition {
  meta: TemplateMeta;
  questions: TemplateQuestion[];
  files: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// 插件钩子上下文
export interface PluginContext {
  projectName: string;
  projectPath: string;
  config: ProjectConfig;
  templatePath: string;
  spinner?: any;
}

// 插件定义
export interface Plugin {
  name: string;
  version?: string;
  description?: string;
  hooks: {
    beforeCreate?: (ctx: PluginContext) => Promise<void> | void;
    afterCreate?: (ctx: PluginContext) => Promise<void> | void;
    beforeInstall?: (ctx: PluginContext) => Promise<void> | void;
    afterInstall?: (ctx: PluginContext) => Promise<void> | void;
  };
}

// CLI 配置
export interface CLIConfig {
  defaultTemplate?: TemplateType;
  defaultAuthor?: string;
  registry?: string;
  plugins?: string[];
}

// 远程模板信息
export interface RemoteTemplate {
  name: string;
  url: string;
  description?: string;
  type?: 'github' | 'gitlab' | 'npm';
  branch?: string;
}

// 创建命令选项
export interface CreateCommandOptions {
  template?: string;
  typescript?: boolean;
  eslint?: boolean;
  prettier?: boolean;
  commitlint?: boolean;
  force?: boolean;
  verbose?: boolean;
}
