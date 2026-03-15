// src/utils/download.ts
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import tar from "tar";
async function downloadAndExtract(baseUrl, destPath, branch = "main") {
  const tempDir = path.join(destPath, "..");
  const tempFile = path.join(tempDir, `template-${Date.now()}.tar.gz`);
  try {
    const url = `${baseUrl}/${branch}.tar.gz`;
    const response = await axios.get(url, {
      responseType: "stream"
    });
    const writer = createWriteStream(tempFile);
    await pipeline(response.data, writer);
    await fs.ensureDir(destPath);
    await tar.x({
      file: tempFile,
      cwd: tempDir,
      strip: 1
    });
    const extractedDir = path.join(tempDir, path.basename(destPath));
    if (await fs.pathExists(extractedDir)) {
      await fs.move(extractedDir, destPath, { overwrite: true });
    }
    await fs.remove(tempFile);
  } catch (error) {
    if (await fs.pathExists(tempFile)) {
      await fs.remove(tempFile);
    }
    throw error;
  }
}
async function downloadFromNpm(packageName, destPath) {
  const tempDir = path.join(destPath, "..");
  const tempFile = path.join(tempDir, `npm-${Date.now()}.tgz`);
  try {
    const registryUrl = "https://registry.npmjs.org";
    const packageUrl = `${registryUrl}/${packageName}`;
    const response = await axios.get(packageUrl);
    const latestVersion = response.data["dist-tags"].latest;
    const tarballUrl = response.data.versions[latestVersion].dist.tarball;
    const tarballResponse = await axios.get(tarballUrl, {
      responseType: "stream"
    });
    const writer = createWriteStream(tempFile);
    await pipeline(tarballResponse.data, writer);
    await fs.ensureDir(destPath);
    await tar.x({
      file: tempFile,
      cwd: tempDir,
      strip: 1
    });
    await fs.remove(tempFile);
  } catch (error) {
    if (await fs.pathExists(tempFile)) {
      await fs.remove(tempFile);
    }
    throw error;
  }
}
export {
  downloadAndExtract,
  downloadFromNpm
};
