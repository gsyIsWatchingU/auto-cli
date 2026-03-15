// src/templates/remote.ts
import path from "path";
import fs from "fs-extra";

// src/utils/index.ts
import chalk from "chalk";
import ora from "ora";
var log = {
  info: (msg) => {
    console.log(chalk.blue("\u2139"), msg);
  },
  success: (msg) => {
    console.log(chalk.green("\u2714"), msg);
  },
  error: (msg) => {
    console.log(chalk.red("\u2716"), msg);
  },
  warn: (msg) => {
    console.log(chalk.yellow("\u26A0"), msg);
  },
  step: (msg) => {
    console.log(chalk.cyan("\u279C"), msg);
  }
};
function createSpinner(text) {
  return ora({
    text: chalk.cyan(text),
    color: "cyan",
    spinner: "dots"
  }).start();
}
function validateProjectName(name) {
  if (!name || name.trim().length === 0) {
    return "\u9879\u76EE\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
  }
  if (name.length > 214) {
    return "\u9879\u76EE\u540D\u79F0\u8FC7\u957F";
  }
  const npmValidation = /^[a-z0-9-~][a-z0-9-._~]*$/.test(name);
  if (!npmValidation) {
    return "\u9879\u76EE\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u8FDE\u5B57\u7B26\u548C\u4E0B\u5212\u7EBF";
  }
  if (name.startsWith("-") || name.endsWith("-")) {
    return "\u9879\u76EE\u540D\u79F0\u4E0D\u80FD\u4EE5\u8FDE\u5B57\u7B26\u5F00\u5934\u6216\u7ED3\u5C3E";
  }
  return true;
}
function formatPackageName(name) {
  return name.split(/[-_]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
async function getDefaultAuthor() {
  try {
    const { execSync } = await import("child_process");
    const name = execSync("git config user.name", {
      encoding: "utf8",
      stdio: "pipe"
    }).trim();
    return name || "developer";
  } catch {
    return "developer";
  }
}

// src/templates/remote.ts
var CLI_DATA_DIR = path.join(process.env.APPDATA || process.env.HOME || "", ".gsy-cli");
var TEMPLATES_DIR = path.join(CLI_DATA_DIR, "templates");
async function addRemoteTemplate(name, url, branch = "main") {
  const configPath = path.join(__dirname, "../../.template-config.json");
  let config = { templates: [] };
  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath);
  }
  const existing = config.templates?.find((t) => t.name === name);
  if (existing) {
    throw new Error(`\u6A21\u677F "${name}" \u5DF2\u5B58\u5728`);
  }
  config.templates.push({ name, url, branch });
  await fs.writeJson(configPath, config, { spaces: 2 });
}
async function downloadRemoteTemplate(name, url, branch = "main") {
  const spinner = createSpinner(`\u6B63\u5728\u4E0B\u8F7D\u6A21\u677F "${name}"...`);
  await fs.ensureDir(TEMPLATES_DIR);
  const templatePath = path.join(TEMPLATES_DIR, name);
  try {
    const repoInfo = parseRepoUrl(url);
    const { downloadAndExtract } = await import("./download-K3HS3QMU.js");
    await downloadAndExtract(repoInfo.url, templatePath, branch);
    spinner.succeed(`\u6A21\u677F "${name}" \u4E0B\u8F7D\u5B8C\u6210`);
    return templatePath;
  } catch (error) {
    spinner.fail(`\u4E0B\u8F7D\u6A21\u677F\u5931\u8D25\uFF1A${error instanceof Error ? error.message : error}`);
    throw error;
  }
}
function parseRepoUrl(url) {
  if (url.startsWith("github:")) {
    const repo = url.replace("github:", "");
    return { url: `https://github.com/${repo}/archive/refs/heads`, type: "github" };
  }
  if (url.startsWith("gitlab:")) {
    const repo = url.replace("gitlab:", "");
    return { url: `https://gitlab.com/${repo}/-/archive`, type: "gitlab" };
  }
  if (url.startsWith("http")) {
    return { url, type: "other" };
  }
  return { url: `https://github.com/${url}/archive/refs/heads`, type: "github" };
}
async function removeRemoteTemplate(name) {
  const configPath = path.join(__dirname, "../../.template-config.json");
  if (!await fs.pathExists(configPath)) {
    throw new Error("\u6CA1\u6709\u627E\u5230\u6A21\u677F\u914D\u7F6E");
  }
  const config = await fs.readJson(configPath);
  config.templates = config.templates?.filter((t) => t.name !== name) || [];
  await fs.writeJson(configPath, config, { spaces: 2 });
  const templatePath = path.join(TEMPLATES_DIR, name);
  if (await fs.pathExists(templatePath)) {
    await fs.remove(templatePath);
  }
}

export {
  log,
  createSpinner,
  validateProjectName,
  formatPackageName,
  getDefaultAuthor,
  addRemoteTemplate,
  downloadRemoteTemplate,
  removeRemoteTemplate
};
