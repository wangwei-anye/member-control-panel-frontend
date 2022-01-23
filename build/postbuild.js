/**
 * build完成后执行
 */

const fs = require('fs-extra');
const path = require('path');
const distPath = path.resolve(__dirname, '../dist');
const timestamp = new Date().getTime();

// 处理入口文件，防止缓存
const fixEntry = () => {
  // 处理入口html
  const entryHtmlPath = path.resolve(distPath, 'index.html');
  const entryHtmlContent = fs.readFileSync(entryHtmlPath, 'utf-8');
  fs.writeFile(stampSource(entryHtmlContent), entryHtmlContent, () => {});

  // 处理入口js
  try {
    const entryJSName = entryHtmlContent.match(/src\.[0-9a-f]+.js/i)[0];
    const entryJSPath = path.resolve(distPath, entryJSName);
    const entryJSContent = fs.readFileSync(entryJSPath, 'utf-8');
    fs.writeFile(stampSource(entryJSContent), entryJSContent, () => {});
  } catch (err) {}
}

// 给资源打时间戳
const stampSource = (content) => {
  return content.replace(/(["'])([^"']+\.[0-9a-f]{8})\.(\w+)\b/g, (m, s1, s2, s3) => {
    const oldName = `${s2}.${s3}`;
    const newName = `${s2}-${timestamp}.${s3}`;
    const oldPath = path.resolve(distPath, oldName);
    const newPath = path.resolve(distPath, newName);
    fs.move(oldPath, newPath);
    return `${s1}${newName}`;
  });
}

module.exports = { fixEntry };
