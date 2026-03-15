import type { Plugin } from '../../../types/index.js';

/**
 * 示例插件 - 展示如何开发插件
 */
const examplePlugin: Plugin = {
  name: 'example-plugin',
  version: '1.0.0',
  description: '示例插件，展示插件系统功能',
  hooks: {
    async beforeCreate(ctx) {
      console.log(`[Example Plugin] 准备创建项目：${ctx.projectName}`);
    },
    async afterCreate(ctx) {
      console.log(`[Example Plugin] 项目 "${ctx.projectName}" 创建完成！`);
      console.log(`[Example Plugin] 项目路径：${ctx.projectPath}`);
    },
    async beforeInstall(ctx) {
      console.log('[Example Plugin] 准备安装模板文件...');
    },
    async afterInstall(ctx) {
      console.log('[Example Plugin] 模板文件安装完成！');
    },
  },
};

export default examplePlugin;
