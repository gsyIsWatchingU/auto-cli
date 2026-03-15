// src/utils/template.ts
import ejs from "ejs";
async function processTemplateFile(content, config) {
  try {
    if (content.includes("<%") || content.includes("%>")) {
      return ejs.render(content, config);
    }
    return content;
  } catch (error) {
    console.warn("EJS \u6E32\u67D3\u5931\u8D25:", error instanceof Error ? error.message : error);
    return content;
  }
}
function renderFilename(filename, config) {
  if (filename.endsWith(".ejs")) {
    try {
      const rendered = ejs.render(filename, config);
      return rendered.replace(/\.ejs$/, "");
    } catch {
      return filename.replace(/\.ejs$/, "");
    }
  }
  return filename;
}
export {
  processTemplateFile,
  renderFilename
};
