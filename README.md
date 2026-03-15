# 企业级团队脚手架 CLI 工具

快速创建标准化、符合团队规范的企业级项目。

## 特性

- 🚀 **快速初始化** - 一行命令创建新项目
- 📦 **内置模板** - Vue/React/Node.js 等多种模板
- 🎯 **团队规范** - 自动集成 ESLint、Prettier、Commitlint
- 🔌 **插件系统** - 灵活扩展，满足定制化需求
- 🌐 **远程模板** - 支持拉取远程仓库模板
- ⚙️ **高度可定制** - 模板问题系统，动态生成项目结构

## 安装

```bash
npm install -g gsy-team-cli
```

## 项目启动方式

### 开发模式

```bash
# 克隆项目
git clone <repository-url>
cd auto-cli

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建发布版本
npm run build
```

### 本地调试

```bash
# 直接运行源码（无需构建）
npx tsx src/index.ts create my-project

# 或链接到全局
npm link
gsy-cli create my-project
```

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js (>=18.0.0)
- **命令行框架**: [Commander.js](https://github.com/tj/commander.js)
- **交互式问答**: [Prompts](https://github.com/terkelg/prompts)
- **文件操作**: [fs-extra](https://github.com/jprichardson/node-fs-extra)
- **模板引擎**: [EJS](https://github.com/mde/ejs)
- **HTTP 客户端**: [Axios](https://github.com/axios/axios)
- **构建工具**: [tsup](https://github.com/egoist/tsup)
- **代码规范**: ESLint + Prettier + Husky + Commitlint
- **测试框架**: Vitest

## 项目结构

```
auto-cli/
├── src/
│   ├── commands/           # CLI 命令实现
│   │   ├── create.ts      # 创建项目命令
│   │   ├── create-project.ts  # 项目创建核心逻辑
│   │   ├── list.ts        # 列出模板命令
│   │   ├── add.ts         # 添加远程模板命令
│   │   └── config.ts      # 配置命令
│   ├── templates/          # 内置模板
│   │   ├── vue/           # Vue3 模板
│   │   ├── react/         # React 模板
│   │   ├── node/          # Node.js 模板
│   │   ├── index.ts       # 模板加载器
│   │   └── remote.ts      # 远程模板下载
│   ├── plugins/           # 插件系统
│   │   ├── index.ts       # 插件加载器
│   │   └── builtin/       # 内置插件
│   ├── utils/             # 工具函数
│   │   ├── index.ts       # 通用工具
│   │   ├── template.ts    # 模板处理
│   │   ├── download.ts    # 下载工具
│   │   └── config.ts      # 配置管理
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts       # 核心类型
│   ├── cli.ts             # CLI 主程序
│   └── index.ts           # 入口文件
├── templates/             # 模板文件目录
├── dist/                  # 构建输出
├── package.json
└── tsconfig.json
```

## 项目功能

### 核心功能

1. **交互式项目创建** - 支持命令行参数和交互式问答两种模式
2. **多模板支持** - 内置 Vue3、React、Node.js 三种模板
3. **远程模板** - 支持从 GitHub/GitLab 拉取远程模板
4. **动态配置** - 支持 TypeScript、ESLint、Prettier、Commitlint 等工具按需配置
5. **插件系统** - 提供 `beforeCreate`、`afterCreate`、`beforeInstall`、`afterInstall` 生命周期钩子
6. **状态管理选择** - Vue 项目支持 Pinia/Vuex 选择
7. **测试框架集成** - 支持 Vitest/Jest
8. **Git 提交规范** - 集成 Husky + Commitlint

### 命令列表

```bash
gsy-cli create <name>    # 创建新项目
gsy-cli list             # 列出可用模板
gsy-cli add <template>   # 添加远程模板
gsy-cli config           # 配置 CLI 选项
gsy-cli --help           # 查看帮助
```

## 项目重难点（值得学习的地方）

### 1. 插件系统设计

参考 `src/plugins/index.ts`，实现了灵活的插件加载机制：

- 支持内置插件和用户插件
- 提供完整的生命周期钩子
- 基于配置文件的插件注册机制

### 2. 模板系统架构

参考 `src/templates/index.ts`，实现了可扩展的模板系统：

- 动态加载本地和远程模板
- 模板元数据和问题定义
- 基于 EJS 的模板渲染

### 3. 交互式问答与命令行参数融合

参考 `src/commands/create.ts`，实现了：

- 命令行参数优先
- 未指定时进入交互式问答
- 智能默认值和条件渲染

### 4. 项目创建流水线

参考 `src/commands/create-project.ts`，实现了清晰的任务流水线：

- 插件钩子执行
- 模板文件复制与处理
- 动态 package.json 生成
- 条件性配置文件生成
- 依赖安装与 Git 初始化

### 5. TypeScript 类型系统

参考 `src/types/index.ts`，提供了完整的类型定义：

- 插件接口设计
- 模板定义类型
- 配置选项类型
- 命令行参数类型

### 6. 工具函数封装

参考 `src/utils/index.ts`，封装了常用工具：

- 彩色日志输出
- Loading 动画
- 项目名称验证
- Git 配置读取

## 许可证

MIT
