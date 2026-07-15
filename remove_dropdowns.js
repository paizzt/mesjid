const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/pages/dashboard');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
    let filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Pattern 1: {masjidList.length > 1 && ( <CustomSelect>...</CustomSelect> )}
    content = content.replace(/\{masjidList\.length\s*>\s*1\s*&&\s*\([\s\S]*?<\/CustomSelect>\s*\)\}/g, '');
    
    // Pattern 2: {masjidList.length > 1 && ( <select>...</select> )}
    content = content.replace(/\{masjidList\.length\s*>\s*1\s*&&\s*\([\s\S]*?<\/select>\s*\)\}/g, '');

    // Pattern 3: <div ...><label>Masjid:</label><CustomSelect>...</CustomSelect></div>
    content = content.replace(/<div[^>]*>\s*<label[^>]*>Masjid:?<\/label>\s*<CustomSelect[\s\S]*?<\/CustomSelect>\s*<\/div>/g, '');

    // Pattern 4: <div ...><label>Masjid:</label><select>...</select></div>
    content = content.replace(/<div[^>]*>\s*<label[^>]*>Masjid:?<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log('Modified ' + f);
    }
});
console.log('Done');
