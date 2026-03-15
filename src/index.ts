#!/usr/bin/env node

import { createCLI } from './cli.js';

/**
 * CLI 主入口
 */
async function main() {
  const cli = createCLI();
  cli.parse();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
