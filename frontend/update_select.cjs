const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/pages').filter(f => f.endsWith('.tsx'));
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<select') && !content.includes('CustomSelect')) {
    // Replace tags
    content = content.replace(/<select/g, '<CustomSelect');
    content = content.replace(/<\/select>/g, '</CustomSelect>');
    
    // Add import
    const depth = file.split(path.sep).length - 3; // src/pages is length 3, file is inside. wait, split by path.sep.
    // e.g. src/pages/Dashboard.tsx -> length 3 (src, pages, Dashboard.tsx) -> depth 0
    // src/pages/dashboard/Aset.tsx -> length 4 -> depth 1
    
    const parts = file.split(path.sep);
    const isRootPage = parts.length === 3;
    const importPath = isRootPage ? '../components/CustomSelect' : '../../components/CustomSelect';
    const importStmt = `import { CustomSelect } from '${importPath}';\n`;
    
    // Find last import
    const lastImportIdx = content.lastIndexOf('import ');
    if (lastImportIdx !== -1) {
      const nextLineIdx = content.indexOf('\n', lastImportIdx) + 1;
      content = content.slice(0, nextLineIdx) + importStmt + content.slice(nextLineIdx);
      fs.writeFileSync(file, content);
      console.log('Replaced in ' + file);
      changedCount++;
    }
  }
});

console.log('Finished. Changed ' + changedCount + ' files.');
