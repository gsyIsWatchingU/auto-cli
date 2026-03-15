#!/usr/bin/env node
import {
  addRemoteTemplate,
  createSpinner,
  formatPackageName,
  getDefaultAuthor,
  log,
  validateProjectName
} from "./chunk-LTGCKWKB.js";

// src/cli.ts
import { Command as Command6 } from "commander";

// src/commands/create.ts
import { Command as Command2 } from "commander";
import prompts from "prompts";

// src/commands/create-project.ts
import "commander";
import path3 from "path";
import fs3 from "fs-extra";
import { spawn } from "child_process";

// src/templates/index.ts
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
async function loadTemplates() {
  const templatesDir = path.join(__dirname, "../../templates");
  const templates = [];
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
  const remoteTemplates = await loadRemoteTemplates();
  templates.push(...remoteTemplates);
  return templates;
}
async function loadTemplateDefinition(templateName) {
  try {
    const templateDir = path.join(__dirname, "../../templates", templateName);
    const defPath = path.join(templateDir, "index.js");
    if (!await fs.pathExists(defPath)) {
      const tsDefPath = path.join(templateDir, "index.ts");
      if (await fs.pathExists(tsDefPath)) {
        const def2 = await import(tsDefPath);
        return def2.default || def2;
      }
      return null;
    }
    const def = await import(defPath);
    return def.default || def;
  } catch (error) {
    log.warn(`\u52A0\u8F7D\u6A21\u677F "${templateName}" \u5931\u8D25\uFF1A${error instanceof Error ? error.message : error}`);
    return null;
  }
}
async function loadRemoteTemplates() {
  const configPath = path.join(__dirname, "../../.template-config.json");
  if (!await fs.pathExists(configPath)) {
    return [];
  }
  try {
    const config = await fs.readJson(configPath);
    const remoteTemplates = [];
    if (config.templates) {
      for (const template of config.templates) {
        remoteTemplates.push({
          meta: {
            name: template.name,
            description: template.description || "\u8FDC\u7A0B\u6A21\u677F",
            version: template.version || "1.0.0",
            type: "custom"
          },
          questions: [],
          files: []
        });
      }
    }
    return remoteTemplates;
  } catch {
    return [];
  }
}
async function loadTemplate(templateName) {
  const configPath = path.join(__dirname, "../../.template-config.json");
  if (await fs.pathExists(configPath)) {
    const config = await fs.readJson(configPath);
    const remoteTemplate = config.templates?.find((t) => t.name === templateName);
    if (remoteTemplate) {
      const { downloadRemoteTemplate } = await import("./remote-AXAWQ6JY.js");
      const templatePath2 = await downloadRemoteTemplate(templateName, remoteTemplate.url, remoteTemplate.branch);
      return { path: templatePath2, definition: null };
    }
  }
  const templateBasePath = path.join(__dirname, "../../templates", templateName);
  const templatePath = path.join(templateBasePath, "files");
  if (!await fs.pathExists(templatePath)) {
    throw new Error(`\u6A21\u677F "${templateName}" \u4E0D\u5B58\u5728`);
  }
  const definition = await loadTemplateDefinition(templateName);
  return { path: templatePath, definition };
}

// src/plugins/index.ts
import path2 from "path";
import fs2 from "fs-extra";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
async function loadPlugins() {
  const plugins = [];
  const builtinPlugins = await loadBuiltinPlugins();
  plugins.push(...builtinPlugins);
  const userPlugins = await loadUserPlugins();
  plugins.push(...userPlugins);
  return plugins;
}
async function loadBuiltinPlugins() {
  const pluginsDir = path2.join(__dirname2, "../plugins/builtin");
  const plugins = [];
  if (!await fs2.pathExists(pluginsDir)) {
    return plugins;
  }
  const entries = await fs2.readdir(pluginsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      try {
        const pluginPath = path2.join(pluginsDir, entry.name, "index.js");
        if (await fs2.pathExists(pluginPath)) {
          const plugin = await import(pluginPath);
          plugins.push(plugin.default || plugin);
        }
      } catch (error) {
        log.warn(`\u52A0\u8F7D\u5185\u7F6E\u63D2\u4EF6 "${entry.name}" \u5931\u8D25\uFF1A${error instanceof Error ? error.message : error}`);
      }
    }
  }
  return plugins;
}
async function loadUserPlugins() {
  const configPath = path2.join(__dirname2, "../../.gsy-cli-config.json");
  const plugins = [];
  if (!await fs2.pathExists(configPath)) {
    return plugins;
  }
  try {
    const config = await fs2.readJson(configPath);
    const pluginPaths = config.plugins || [];
    for (const pluginPath of pluginPaths) {
      try {
        const resolvedPath = path2.resolve(process.cwd(), pluginPath);
        if (await fs2.pathExists(resolvedPath)) {
          const plugin = await import(resolvedPath);
          plugins.push(plugin.default || plugin);
        }
      } catch (error) {
        log.warn(`\u52A0\u8F7D\u7528\u6237\u63D2\u4EF6 "${pluginPath}" \u5931\u8D25\uFF1A${error instanceof Error ? error.message : error}`);
      }
    }
  } catch (error) {
    log.warn(`\u52A0\u8F7D\u63D2\u4EF6\u914D\u7F6E\u5931\u8D25\uFF1A${error instanceof Error ? error.message : error}`);
  }
  return plugins;
}

// src/commands/create-project.ts
async function createProject(config, options = {}) {
  const projectPath = path3.resolve(process.cwd(), config.name);
  const exists = await fs3.pathExists(projectPath);
  if (exists && !options.force) {
    if ((await fs3.readdir(projectPath)).length > 0) {
      log.error(`\u76EE\u5F55 "${config.name}" \u5DF2\u5B58\u5728\u4E14\u4E0D\u4E3A\u7A7A`);
      log.info("\u4F7F\u7528 --force \u9009\u9879\u5F3A\u5236\u8986\u76D6");
      process.exit(1);
    }
  }
  await fs3.ensureDir(projectPath);
  const plugins = await loadPlugins();
  const pluginContext = {
    projectName: config.name,
    projectPath,
    config,
    templatePath: ""
  };
  for (const plugin of plugins) {
    if (plugin.hooks.beforeCreate) {
      await plugin.hooks.beforeCreate(pluginContext);
    }
  }
  const spinner = createSpinner("\u6B63\u5728\u52A0\u8F7D\u6A21\u677F...");
  const template = await loadTemplate(config.template);
  spinner.succeed("\u6A21\u677F\u52A0\u8F7D\u5B8C\u6210");
  pluginContext.templatePath = template.path;
  for (const plugin of plugins) {
    if (plugin.hooks.beforeInstall) {
      await plugin.hooks.beforeInstall(pluginContext);
    }
  }
  spinner.start("\u6B63\u5728\u590D\u5236\u6A21\u677F\u6587\u4EF6...");
  await copyTemplateFiles(template.path, projectPath, config);
  spinner.succeed("\u6A21\u677F\u6587\u4EF6\u590D\u5236\u5B8C\u6210");
  spinner.start("\u6B63\u5728\u751F\u6210 package.json...");
  await generatePackageJson(projectPath, config, template);
  spinner.succeed("package.json \u751F\u6210\u5B8C\u6210");
  spinner.start("\u6B63\u5728\u751F\u6210\u914D\u7F6E\u6587\u4EF6...");
  await generateConfigFiles(projectPath, config);
  spinner.succeed("\u914D\u7F6E\u6587\u4EF6\u751F\u6210\u5B8C\u6210");
  for (const plugin of plugins) {
    if (plugin.hooks.afterInstall) {
      await plugin.hooks.afterInstall(pluginContext);
    }
  }
  if (options.installDeps) {
    spinner.start("\u6B63\u5728\u5B89\u88C5\u4F9D\u8D56...");
    await installDependencies(projectPath);
    spinner.succeed("\u4F9D\u8D56\u5B89\u88C5\u5B8C\u6210");
  }
  if (config.commitlint && config.husky !== false) {
    spinner.start("\u6B63\u5728\u521D\u59CB\u5316 Git...");
    await initGit(projectPath);
    spinner.succeed("Git \u521D\u59CB\u5316\u5B8C\u6210");
  }
  for (const plugin of plugins) {
    if (plugin.hooks.afterCreate) {
      await plugin.hooks.afterCreate(pluginContext);
    }
  }
}
async function copyTemplateFiles(templatePath, projectPath, config) {
  const fs5 = await import("fs-extra");
  const { processTemplateFile } = await import("./template-AMLWLSQ2.js");
  async function copyDir(src, dest) {
    await fs5.ensureDir(dest);
    const entries = await fs5.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path3.join(src, entry.name);
      const destPath = path3.join(dest, entry.name);
      if (shouldSkipFile(entry.name, config)) {
        continue;
      }
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        const content = await fs5.readFile(srcPath, "utf-8");
        const processed = await processTemplateFile(content, config);
        const finalDest = destPath.replace(/\.ejs$/, "");
        await fs5.writeFile(finalDest, processed);
      }
    }
  }
  await copyDir(templatePath, projectPath);
}
function shouldSkipFile(filename, config) {
  if (!config.typescript) {
    if (filename === "tsconfig.json.ejs" || filename === "tsconfig.json") {
      return true;
    }
  }
  if (!config.eslint) {
    if (filename === ".eslintrc.cjs.ejs" || filename === ".eslintrc.js") {
      return true;
    }
  }
  if (!config.prettier) {
    if (filename === ".prettierrc.ejs" || filename === ".prettierrc") {
      return true;
    }
  }
  if (!config.commitlint) {
    if (filename === ".commitlintrc.cjs.ejs" || filename === "commitlint.config.js") {
      return true;
    }
  }
  return false;
}
async function generatePackageJson(projectPath, config, template) {
  const fs5 = await import("fs-extra");
  const pkgPath = path3.join(projectPath, "package.json");
  const pkg = {
    name: config.name,
    version: "1.0.0",
    description: config.description,
    author: config.author,
    type: config.typescript ? "module" : "commonjs",
    scripts: await getScripts(config),
    dependencies: template.dependencies || {},
    devDependencies: template.devDependencies || {}
  };
  if (config.typescript) {
    pkg.devDependencies.typescript = "^5.3.0";
    pkg.devDependencies["@types/node"] = "^20.10.0";
  }
  if (config.eslint) {
    pkg.devDependencies.eslint = "^8.56.0";
    if (config.typescript) {
      pkg.devDependencies["@typescript-eslint/parser"] = "^6.13.0";
      pkg.devDependencies["@typescript-eslint/eslint-plugin"] = "^6.13.0";
    }
  }
  if (config.prettier) {
    pkg.devDependencies.prettier = "^3.1.0";
    if (config.eslint) {
      pkg.devDependencies["eslint-config-prettier"] = "^9.1.0";
    }
  }
  if (config.commitlint) {
    pkg.devDependencies.husky = "^8.0.3";
    pkg.devDependencies.commitlint = "^18.4.0";
    pkg.devDependencies["@commitlint/config-conventional"] = "^18.4.0";
  }
  if (config.pinia) {
    pkg.dependencies.pinia = "^2.1.7";
  }
  if (config.vitest) {
    pkg.devDependencies.vitest = "^1.1.0";
  }
  if (config.jest) {
    pkg.devDependencies.jest = "^29.7.0";
    pkg.devDependencies["ts-jest"] = "^29.1.0";
  }
  await fs5.writeJson(pkgPath, pkg, { spaces: 2 });
}
async function getScripts(config) {
  const scripts = {};
  if (config.template === "vue") {
    scripts.dev = "vite";
    scripts.build = "vue-tsc && vite build";
    scripts.preview = "vite preview";
  } else if (config.template === "react") {
    scripts.dev = "vite";
    scripts.build = "tsc && vite build";
    scripts.preview = "vite preview";
  } else if (config.template === "node") {
    scripts.dev = "tsx watch src/index.ts";
    scripts.build = "tsc";
    scripts.start = "node dist/index.js";
  }
  if (config.eslint) {
    scripts.lint = "eslint src --ext .ts,.tsx";
  }
  if (config.prettier) {
    scripts.format = 'prettier --write "src/**/*.{ts,tsx,js,jsx}"';
  }
  if (config.vitest) {
    scripts.test = "vitest";
  }
  if (config.jest) {
    scripts.test = "jest";
  }
  if (config.commitlint) {
    scripts.prepare = "husky install";
  }
  return scripts;
}
async function generateConfigFiles(projectPath, config) {
  const fs5 = await import("fs-extra");
  const gitignore = getGitignore(config);
  await fs5.writeFile(path3.join(projectPath, ".gitignore"), gitignore);
  if (config.commitlint) {
    await fs5.ensureDir(path3.join(projectPath, ".husky"));
    const commitMsg = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
`;
    await fs5.writeFile(path3.join(projectPath, ".husky/commit-msg"), commitMsg);
  }
}
function getGitignore(config) {
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
async function installDependencies(projectPath) {
  return new Promise((resolve, reject) => {
    const install = spawn("npm", ["install"], {
      cwd: projectPath,
      stdio: "ignore"
    });
    install.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install \u5931\u8D25\uFF0C\u9000\u51FA\u7801\uFF1A${code}`));
      }
    });
  });
}
async function initGit(projectPath) {
  return new Promise((resolve, reject) => {
    const git = spawn("git", ["init"], {
      cwd: projectPath,
      stdio: "ignore"
    });
    git.on("close", (code) => {
      if (code === 0) {
        const husky = spawn("npx", ["husky", "install"], {
          cwd: projectPath,
          stdio: "ignore"
        });
        husky.on("close", (code2) => {
          if (code2 === 0) {
            resolve();
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

// src/commands/create.ts
var createCommand = new Command2("create").description("\u521B\u5EFA\u65B0\u9879\u76EE").argument("<name>", "\u9879\u76EE\u540D\u79F0").option("-t, --template <template>", "\u4F7F\u7528\u6307\u5B9A\u6A21\u677F").option("--typescript", "\u4F7F\u7528 TypeScript").option("--eslint", "\u96C6\u6210 ESLint").option("--prettier", "\u96C6\u6210 Prettier").option("--commitlint", "\u96C6\u6210 Commitlint").option("--force", "\u5F3A\u5236\u8986\u76D6\u5DF2\u5B58\u5728\u7684\u76EE\u5F55").option("-v, --verbose", "\u8F93\u51FA\u8BE6\u7EC6\u65E5\u5FD7").action(async (name, options) => {
  try {
    const validation = validateProjectName(name);
    if (validation !== true) {
      log.error(validation);
      process.exit(1);
    }
    const defaultAuthor = await getDefaultAuthor();
    const templates = await loadTemplates();
    let selectedTemplate;
    if (options.template) {
      selectedTemplate = templates.find(
        (t) => t.meta.name === options.template
      );
      if (!selectedTemplate) {
        log.error(`\u6A21\u677F "${options.template}" \u4E0D\u5B58\u5728`);
        log.info("\u53EF\u7528\u6A21\u677F\uFF1A" + templates.map((t) => t.meta.name).join(", "));
        process.exit(1);
      }
    }
    const answers = await prompts([
      // 项目模板选择
      {
        type: options.template || templates.length === 1 ? null : "select",
        name: "template",
        message: "\u9009\u62E9\u9879\u76EE\u6A21\u677F",
        choices: templates.map((t) => ({
          value: t.meta.name,
          title: t.meta.name + (t.meta.description ? ` - ${t.meta.description}` : "")
        })),
        initial: 0
      },
      // 项目描述
      {
        type: "text",
        name: "description",
        message: "\u9879\u76EE\u63CF\u8FF0",
        initial: formatPackageName(name)
      },
      // 作者
      {
        type: "text",
        name: "author",
        message: "\u4F5C\u8005",
        initial: defaultAuthor
      },
      // TypeScript
      {
        type: "confirm",
        name: "typescript",
        message: "\u662F\u5426\u4F7F\u7528 TypeScript?",
        initial: options.typescript ?? true
      },
      // ESLint
      {
        type: "confirm",
        name: "eslint",
        message: "\u662F\u5426\u96C6\u6210 ESLint?",
        initial: options.eslint ?? true
      },
      // Prettier
      {
        type: "confirm",
        name: "prettier",
        message: "\u662F\u5426\u96C6\u6210 Prettier?",
        initial: options.prettier ?? true
      },
      // Commitlint + Husky
      {
        type: "confirm",
        name: "commitlint",
        message: "\u662F\u5426\u96C6\u6210 Git \u63D0\u4EA4\u89C4\u8303 (Commitlint + Husky)?",
        initial: options.commitlint ?? true
      },
      // 状态管理
      {
        type: (prev) => prev.template === "vue" ? "select" : null,
        name: "stateManagement",
        message: "\u9009\u62E9\u72B6\u6001\u7BA1\u7406\u65B9\u6848",
        choices: [
          { value: "none", title: "\u4E0D\u4F7F\u7528\u72B6\u6001\u7BA1\u7406" },
          { value: "pinia", title: "Pinia (\u63A8\u8350)" },
          { value: "vuex", title: "Vuex" }
        ],
        initial: 1
      },
      // 测试框架
      {
        type: "select",
        name: "test",
        message: "\u9009\u62E9\u6D4B\u8BD5\u6846\u67B6",
        choices: [
          { value: "none", title: "\u4E0D\u4F7F\u7528\u6D4B\u8BD5\u6846\u67B6" },
          { value: "vitest", title: "Vitest (\u63A8\u8350)" },
          { value: "jest", title: "Jest" }
        ],
        initial: 1
      },
      // 是否安装依赖
      {
        type: "confirm",
        name: "installDeps",
        message: "\u662F\u5426\u7ACB\u5373\u5B89\u88C5\u4F9D\u8D56?",
        initial: true
      }
    ], {
      onCancel: () => {
        log.warn("\u64CD\u4F5C\u5DF2\u53D6\u6D88");
        process.exit(1);
      }
    });
    const config = {
      name,
      template: selectedTemplate?.meta.name || answers.template || "vue",
      description: answers.description || formatPackageName(name),
      author: answers.author || defaultAuthor,
      typescript: answers.typescript ?? options.typescript ?? true,
      eslint: answers.eslint ?? options.eslint ?? true,
      prettier: answers.prettier ?? options.prettier ?? true,
      commitlint: answers.commitlint ?? options.commitlint ?? true,
      pinia: answers.stateManagement === "pinia",
      vuex: answers.stateManagement === "vuex",
      vitest: answers.test === "vitest",
      jest: answers.test === "jest",
      router: true,
      api: true
    };
    await createProject(config, {
      ...options,
      installDeps: answers.installDeps
    });
    log.success(`\u9879\u76EE "${name}" \u521B\u5EFA\u6210\u529F!`);
    log.info(`\u8FD0\u884C\u4EE5\u4E0B\u547D\u4EE4\u5F00\u59CB\u5F00\u53D1:`);
    console.log(`  cd ${name}`);
    if (answers.installDeps) {
      console.log("  npm run dev");
    } else {
      console.log("  npm install");
      console.log("  npm run dev");
    }
  } catch (error) {
    log.error(
      error instanceof Error ? error.message : "\u521B\u5EFA\u9879\u76EE\u5931\u8D25"
    );
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
});

// src/commands/list.ts
import { Command as Command3 } from "commander";
var listCommand = new Command3("list").description("\u5217\u51FA\u53EF\u7528\u6A21\u677F").action(async () => {
  try {
    const templates = await loadTemplates();
    if (templates.length === 0) {
      log.info("\u6CA1\u6709\u627E\u5230\u53EF\u7528\u7684\u6A21\u677F");
      return;
    }
    log.info("\u53EF\u7528\u6A21\u677F:");
    console.log();
    for (const template of templates) {
      const icon = template.meta.icon || "\u{1F4E6}";
      console.log(`  ${icon} ${template.meta.name}`);
      if (template.meta.description) {
        console.log(`     ${template.meta.description}`);
      }
      console.log();
    }
  } catch (error) {
    log.error(
      error instanceof Error ? error.message : "\u52A0\u8F7D\u6A21\u677F\u5217\u8868\u5931\u8D25"
    );
    process.exit(1);
  }
});

// src/commands/add.ts
import { Command as Command4 } from "commander";
var addCommand = new Command4("add").description("\u6DFB\u52A0\u8FDC\u7A0B\u6A21\u677F").argument("<name>", "\u6A21\u677F\u540D\u79F0").argument("<url>", "\u6A21\u677F\u4ED3\u5E93 URL (\u5982\uFF1Agithub:user/repo)").option("-b, --branch <branch>", "\u5206\u652F\u540D\u79F0", "main").action(async (name, url, options) => {
  try {
    const spinner = createSpinner("\u6B63\u5728\u6DFB\u52A0\u8FDC\u7A0B\u6A21\u677F...");
    await addRemoteTemplate(name, url, options.branch);
    spinner.succeed(`\u6A21\u677F "${name}" \u6DFB\u52A0\u6210\u529F`);
    log.info(`\u4F7F\u7528\u65B9\u5F0F\uFF1Agsy-cli create my-project --template ${name}`);
  } catch (error) {
    log.error(
      error instanceof Error ? error.message : "\u6DFB\u52A0\u6A21\u677F\u5931\u8D25"
    );
    process.exit(1);
  }
});

// src/commands/config.ts
import { Command as Command5 } from "commander";

// src/utils/config.ts
import path4 from "path";
import fs4 from "fs-extra";
import { fileURLToPath as fileURLToPath3 } from "url";
var __dirname3 = path4.dirname(fileURLToPath3(import.meta.url));
var CONFIG_DIR = path4.join(
  process.env.APPDATA || process.env.HOME || "",
  ".gsy-cli"
);
var CONFIG_FILE = path4.join(CONFIG_DIR, "config.json");
async function loadConfig() {
  if (!await fs4.pathExists(CONFIG_FILE)) {
    return {};
  }
  try {
    return await fs4.readJson(CONFIG_FILE);
  } catch {
    return {};
  }
}
async function saveConfig(config) {
  await fs4.ensureDir(CONFIG_DIR);
  await fs4.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

// src/commands/config.ts
var configCommand = new Command5("config").description("\u914D\u7F6E CLI \u9009\u9879").option("-l, --list", "\u5217\u51FA\u6240\u6709\u914D\u7F6E").option("-g, --get <key>", "\u83B7\u53D6\u914D\u7F6E\u503C").option("-s, --set <key=value>", "\u8BBE\u7F6E\u914D\u7F6E\u503C").option("-r, --remove <key>", "\u5220\u9664\u914D\u7F6E").action(async (options) => {
  try {
    const config = await loadConfig();
    if (options.list) {
      log.info("\u5F53\u524D\u914D\u7F6E:");
      console.log(JSON.stringify(config, null, 2));
      return;
    }
    if (options.get) {
      const value = config[options.get];
      if (value !== void 0) {
        console.log(value);
      } else {
        log.info(`\u914D\u7F6E "${options.get}" \u4E0D\u5B58\u5728`);
      }
      return;
    }
    if (options.set) {
      const [key, ...valueParts] = options.set.split("=");
      const value = valueParts.join("=");
      if (!key || value === void 0) {
        log.error("\u683C\u5F0F\u9519\u8BEF\uFF0C\u8BF7\u4F7F\u7528\uFF1A-s key=value");
        process.exit(1);
      }
      config[key] = value;
      await saveConfig(config);
      log.success(`\u914D\u7F6E "${key}" \u5DF2\u8BBE\u7F6E`);
      return;
    }
    if (options.remove) {
      delete config[options.remove];
      await saveConfig(config);
      log.success(`\u914D\u7F6E "${options.remove}" \u5DF2\u5220\u9664`);
      return;
    }
    configCommand.outputHelp();
  } catch (error) {
    log.error(
      error instanceof Error ? error.message : "\u914D\u7F6E\u64CD\u4F5C\u5931\u8D25"
    );
    process.exit(1);
  }
});

// package.json
var package_default = {
  name: "gsy-team-cli",
  version: "1.0.0",
  description: "\u4F01\u4E1A\u7EA7\u56E2\u961F\u811A\u624B\u67B6 CLI \u5DE5\u5177 - \u5FEB\u901F\u521B\u5EFA\u6807\u51C6\u5316\u9879\u76EE",
  type: "module",
  bin: {
    "gsy-cli": "./dist/index.js"
  },
  main: "./dist/index.js",
  types: "./dist/types/index.d.ts",
  files: [
    "dist",
    "templates"
  ],
  scripts: {
    dev: "tsx src/index.ts",
    build: "tsup src/index.ts --format esm --dts --clean",
    prepublishOnly: "npm run build",
    lint: "eslint src --ext .ts",
    format: 'prettier --write "src/**/*.ts"',
    test: "vitest",
    prepare: "husky install"
  },
  keywords: [
    "cli",
    "scaffold",
    "starter",
    "template",
    "team",
    "enterprise"
  ],
  author: "",
  license: "MIT",
  dependencies: {
    chalk: "^5.3.0",
    commander: "^12.1.0",
    ora: "^8.0.1",
    prompts: "^2.4.2",
    "fs-extra": "^11.2.0",
    axios: "^1.6.0",
    tar: "^6.2.0",
    glob: "^10.3.0",
    ejs: "^3.1.9",
    "validate-npm-package-name": "^5.0.0"
  },
  devDependencies: {
    "@types/node": "^20.10.0",
    "@types/fs-extra": "^11.0.4",
    "@types/prompts": "^2.4.8",
    "@types/ejs": "^3.1.5",
    "@types/tar": "^6.1.10",
    "@types/validate-npm-package-name": "^4.0.2",
    typescript: "^5.3.0",
    tsup: "^8.0.0",
    tsx: "^4.7.0",
    eslint: "^8.56.0",
    prettier: "^3.1.0",
    husky: "^8.0.3",
    commitlint: "^18.4.0",
    "@commitlint/config-conventional": "^18.4.0",
    vitest: "^1.1.0"
  },
  engines: {
    node: ">=18.0.0"
  }
};

// src/cli.ts
function createCLI() {
  const program = new Command6();
  program.name("gsy-cli").description("\u4F01\u4E1A\u7EA7\u56E2\u961F\u811A\u624B\u67B6 CLI \u5DE5\u5177").version(package_default.version);
  program.addCommand(createCommand);
  program.addCommand(listCommand);
  program.addCommand(addCommand);
  program.addCommand(configCommand);
  return program;
}

// src/index.ts
async function main() {
  const cli = createCLI();
  cli.parse();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
