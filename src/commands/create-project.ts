import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import { log, createSpinner } from '../utils/index.js';
import { loadTemplate } from '../templates/index.js';
import { loadPlugins } from '../plugins/index.js';
import type { ProjectConfig } from '../types/index.js';

interface CreateOptions {
  force?: boolean;
  verbose?: boolean;
  installDeps?: boolean;
}

/**
 * 创建项目主逻辑
 */
export async function createProject(
  config: ProjectConfig,
  options: CreateOptions = {}
): Promise<void> {
  const projectPath = path.resolve(process.cwd(), config.name);

  // 检查目录是否已存在
  const exists = await fs.pathExists(projectPath);
  if (exists && !options.force) {
    if ((await fs.readdir(projectPath)).length > 0) {
      log.error(`目录 "${config.name}" 已存在且不为空`);
      log.info('使用 --force 选项强制覆盖');
      process.exit(1);
    }
  }

  // 创建项目目录
  await fs.ensureDir(projectPath);

  // 加载插件
  const plugins = await loadPlugins();
  const pluginContext = {
    projectName: config.name,
    projectPath,
    config,
    templatePath: '',
  };

  // 执行 beforeCreate 钩子
  for (const plugin of plugins) {
    if (plugin.hooks.beforeCreate) {
      await plugin.hooks.beforeCreate(pluginContext);
    }
  }

  // 加载模板
  const spinner = createSpinner('正在加载模板...');
  const template = await loadTemplate(config.template);
  spinner.succeed('模板加载完成');

  pluginContext.templatePath = template.path;

  // 执行 beforeInstall 钩子
  for (const plugin of plugins) {
    if (plugin.hooks.beforeInstall) {
      await plugin.hooks.beforeInstall(pluginContext);
    }
  }

  // 复制模板文件
  spinner.start('正在复制模板文件...');
  await copyTemplateFiles(template.path, projectPath, config);
  spinner.succeed('模板文件复制完成');

  // 生成 package.json
  spinner.start('正在生成 package.json...');
  await generatePackageJson(projectPath, config, template);
  spinner.succeed('package.json 生成完成');

  // 生成配置文件
  spinner.start('正在生成配置文件...');
  await generateConfigFiles(projectPath, config);
  spinner.succeed('配置文件生成完成');

  // 执行 afterInstall 钩子
  for (const plugin of plugins) {
    if (plugin.hooks.afterInstall) {
      await plugin.hooks.afterInstall(pluginContext);
    }
  }

  // 安装依赖
  if (options.installDeps) {
    spinner.start('正在安装依赖...');
    await installDependencies(projectPath);
    spinner.succeed('依赖安装完成');
  }

  // 初始化 Git (如果需要 husky)
  if (config.commitlint && config.husky !== false) {
    spinner.start('正在初始化 Git...');
    await initGit(projectPath);
    spinner.succeed('Git 初始化完成');
  }

  // 执行 afterCreate 钩子
  for (const plugin of plugins) {
    if (plugin.hooks.afterCreate) {
      await plugin.hooks.afterCreate(pluginContext);
    }
  }
}

/**
 * 复制模板文件
 */
async function copyTemplateFiles(
  templatePath: string,
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const fs = await import('fs-extra');
  const { processTemplateFile } = await import('../utils/template.js');

  async function copyDir(src: string, dest: string) {
    await fs.ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // 跳过不需要复制的文件
      if (shouldSkipFile(entry.name, config)) {
        continue;
      }

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        // 处理 EJS 模板
        const content = await fs.readFile(srcPath, 'utf-8');
        const processed = await processTemplateFile(content, config);
        const finalDest = destPath.replace(/\.ejs$/, '');
        await fs.writeFile(finalDest, processed);
      }
    }
  }

  await copyDir(templatePath, projectPath);
}

/**
 * 判断是否跳过文件
 */
function shouldSkipFile(filename: string, config: ProjectConfig): boolean {
  // 不使用 TypeScript 时跳过 TS 配置文件
  if (!config.typescript) {
    if (filename === 'tsconfig.json.ejs' || filename === 'tsconfig.json') {
      return true;
    }
  }

  // 不使用 ESLint 时跳过
  if (!config.eslint) {
    if (filename === '.eslintrc.cjs.ejs' || filename === '.eslintrc.js') {
      return true;
    }
  }

  // 不使用 Prettier 时跳过
  if (!config.prettier) {
    if (filename === '.prettierrc.ejs' || filename === '.prettierrc') {
      return true;
    }
  }

  // 不使用 Commitlint 时跳过
  if (!config.commitlint) {
    if (filename === '.commitlintrc.cjs.ejs' || filename === 'commitlint.config.js') {
      return true;
    }
  }

  return false;
}

/**
 * 生成 package.json
 */
async function generatePackageJson(
  projectPath: string,
  config: ProjectConfig,
  template: any
): Promise<void> {
  const fs = await import('fs-extra');
  const pkgPath = path.join(projectPath, 'package.json');

  const pkg = {
    name: config.name,
    version: '1.0.0',
    description: config.description,
    author: config.author,
    type: config.typescript ? 'module' : 'commonjs',
    scripts: await getScripts(config),
    dependencies: template.dependencies || {},
    devDependencies: template.devDependencies || {},
  };

  // 根据配置添加依赖
  if (config.typescript) {
    pkg.devDependencies.typescript = '^5.3.0';
    pkg.devDependencies['@types/node'] = '^20.10.0';
  }

  if (config.eslint) {
    pkg.devDependencies.eslint = '^8.56.0';
    if (config.typescript) {
      pkg.devDependencies['@typescript-eslint/parser'] = '^6.13.0';
      pkg.devDependencies['@typescript-eslint/eslint-plugin'] = '^6.13.0';
    }
  }

  if (config.prettier) {
    pkg.devDependencies.prettier = '^3.1.0';
    if (config.eslint) {
      pkg.devDependencies['eslint-config-prettier'] = '^9.1.0';
    }
  }

  if (config.commitlint) {
    pkg.devDependencies.husky = '^8.0.3';
    pkg.devDependencies.commitlint = '^18.4.0';
    pkg.devDependencies['@commitlint/config-conventional'] = '^18.4.0';
  }

  if (config.pinia) {
    pkg.dependencies.pinia = '^2.1.7';
  }

  if (config.vitest) {
    pkg.devDependencies.vitest = '^1.1.0';
  }

  if (config.jest) {
    pkg.devDependencies.jest = '^29.7.0';
    pkg.devDependencies['ts-jest'] = '^29.1.0';
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

/**
 * 获取脚本命令
 */
async function getScripts(config: ProjectConfig): Promise<Record<string, string>> {
  const scripts: Record<string, string> = {};

  if (config.template === 'vue') {
    scripts.dev = 'vite';
    scripts.build = 'vue-tsc && vite build';
    scripts.preview = 'vite preview';
  } else if (config.template === 'react') {
    scripts.dev = 'vite';
    scripts.build = 'tsc && vite build';
    scripts.preview = 'vite preview';
  } else if (config.template === 'node') {
    scripts.dev = 'tsx watch src/index.ts';
    scripts.build = 'tsc';
    scripts.start = 'node dist/index.js';
  }

  if (config.eslint) {
    scripts.lint = 'eslint src --ext .ts,.tsx';
  }

  if (config.prettier) {
    scripts.format = 'prettier --write "src/**/*.{ts,tsx,js,jsx}"';
  }

  if (config.vitest) {
    scripts.test = 'vitest';
  }

  if (config.jest) {
    scripts.test = 'jest';
  }

  if (config.commitlint) {
    scripts.prepare = 'husky install';
  }

  return scripts;
}

/**
 * 生成配置文件
 */
async function generateConfigFiles(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const fs = await import('fs-extra');

  // .gitignore
  const gitignore = getGitignore(config);
  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

  // Git hooks 目录
  if (config.commitlint) {
    await fs.ensureDir(path.join(projectPath, '.husky'));

    // commit-msg hook
    const commitMsg = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
`;
    await fs.writeFile(path.join(projectPath, '.husky/commit-msg'), commitMsg);
  }
}

/**
 * 获取 .gitignore 内容
 */
function getGitignore(config: ProjectConfig): string {
  const common = `# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment
.env
.env.local
.env.*.local
`;

  if (config.typescript) {
    return common + `
# TypeScript
*.tsbuildinfo
`;
  }

  return common;
}

/**
 * 安装依赖
 */
async function installDependencies(projectPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install'], {
      cwd: projectPath,
      stdio: 'ignore',
    });

    install.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install 失败，退出码：${code}`));
      }
    });
  });
}

/**
 * 初始化 Git
 */
async function initGit(projectPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const git = spawn('git', ['init'], {
      cwd: projectPath,
      stdio: 'ignore',
    });

    git.on('close', (code) => {
      if (code === 0) {
        // 安装 husky
        const husky = spawn('npx', ['husky', 'install'], {
          cwd: projectPath,
          stdio: 'ignore',
        });
        husky.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            resolve(); // 即使 husky 失败也继续
          }
        });
      } else {
        resolve(); // Git 初始化失败也继续
      }
    });
  });
}
