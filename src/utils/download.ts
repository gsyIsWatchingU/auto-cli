import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import tar from 'tar';

/**
 * 下载并解压远程模板
 */
export async function downloadAndExtract(
  baseUrl: string,
  destPath: string,
  branch: string = 'main'
): Promise<void> {
  const tempDir = path.join(destPath, '..');
  const tempFile = path.join(tempDir, `template-${Date.now()}.tar.gz`);

  try {
    // 下载 tarball
    const url = `${baseUrl}/${branch}.tar.gz`;
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    // 写入临时文件
    const writer = createWriteStream(tempFile);
    await pipeline(response.data, writer);

    // 解压
    await fs.ensureDir(destPath);
    await tar.x({
      file: tempFile,
      cwd: tempDir,
      strip: 1,
    });

    // 移动到目标位置
    const extractedDir = path.join(tempDir, path.basename(destPath));
    if (await fs.pathExists(extractedDir)) {
      await fs.move(extractedDir, destPath, { overwrite: true });
    }

    // 清理临时文件
    await fs.remove(tempFile);
  } catch (error) {
    // 清理临时文件
    if (await fs.pathExists(tempFile)) {
      await fs.remove(tempFile);
    }
    throw error;
  }
}

/**
 * 从 npm 下载模板
 */
export async function downloadFromNpm(
  packageName: string,
  destPath: string
): Promise<void> {
  const tempDir = path.join(destPath, '..');
  const tempFile = path.join(tempDir, `npm-${Date.now()}.tgz`);

  try {
    // 获取包信息
    const registryUrl = 'https://registry.npmjs.org';
    const packageUrl = `${registryUrl}/${packageName}`;

    const response = await axios.get(packageUrl);
    const latestVersion = response.data['dist-tags'].latest;
    const tarballUrl = response.data.versions[latestVersion].dist.tarball;

    // 下载
    const tarballResponse = await axios.get(tarballUrl, {
      responseType: 'stream',
    });

    const writer = createWriteStream(tempFile);
    await pipeline(tarballResponse.data, writer);

    // 解压
    await fs.ensureDir(destPath);
    await tar.x({
      file: tempFile,
      cwd: tempDir,
      strip: 1,
    });

    // 清理
    await fs.remove(tempFile);
  } catch (error) {
    if (await fs.pathExists(tempFile)) {
      await fs.remove(tempFile);
    }
    throw error;
  }
}
