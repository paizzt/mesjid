const fs = require('fs');
const path = require('path');

const dir = './src/pages/dashboard';
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(dir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('CustomSelect')) {
    // We inserted "import { CustomSelect } from '../../components/CustomSelect';\n"
    // potentially breaking another import. Let's find it.
    
    // First, let's remove the badly inserted import. We can just remove ALL CustomSelect imports.
    content = content.replace(/import \{ CustomSelect \} from '.*?';\n?/g, '');
    
    // Now just split by line and add it at line 2.
    let lines = content.split('\n');
    lines.splice(1, 0, "import { CustomSelect } from '../../components/CustomSelect';");
    
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Fixed imports in ' + file);
  }
});
