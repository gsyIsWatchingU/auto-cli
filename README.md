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

## 使用

### 创建项目

```bash
# 交互式创建项目
gsy-cli create my-project

# 使用指定模板
gsy-cli create my-project --template vue

# 使用远程模板
gsy-cli create my-project --template github:username/template-repo

# 非交互模式
gsy-cli create my-project --template react --typescript --eslint --prettier
```

### 命令列表

```bash
gsy-cli create <name>    # 创建新项目
gsy-cli list             # 列出可用模板
gsy-cli add <template>   # 添加远程模板
gsy-cli config           # 配置 CLI 选项
gsy-cli --help           # 查看帮助
```

## 模板选项

创建项目时会根据模板的问题列表进行交互式问答：

- TypeScript 支持
- 代码检查 (ESLint)
- 代码格式化 (Prettier)
- Git 提交规范 (Commitlint + Husky)
- 状态管理 (Pinia/Vuex/Redux)
- 测试框架 (Vitest/Jest)

## 插件开发

```typescript
// plugin.ts
import type { Plugin } from 'gsy-team-cli';

const myPlugin: Plugin = {
  name: 'my-plugin',
  hooks: {
    beforeCreate(ctx) {
      console.log('创建项目前执行');
    },
    afterCreate(ctx) {
      console.log('创建项目后执行');
    }
  }
};

export default myPlugin;
```

## 许可证

MIT
