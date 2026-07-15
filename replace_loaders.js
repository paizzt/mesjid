const fs = require('fs');
const path = require('path');

const css = `
/* Custom Loader */
.loader {
  height: 40px;
  aspect-ratio: 1.5;
  --c:no-repeat linear-gradient(currentColor 0 0);
  background: var(--c), var(--c), var(--c), var(--c);
  background-size: 33.4% 50%;
  animation: l6 2s infinite linear;
  margin: 0 auto;
}
@keyframes l6 {
  0%    {background-position:0 0,50% 0,0 100%,50% 100%}
  12.5% {background-position:0 0,100% 0,0 100%,50% 100%}
  25%   {background-position:0 0,100% 0,0 100%,50% 0}
  37.5% {background-position:0 0,100% 0,50% 100%,50% 0}
  50%   {background-position:0 100%,100% 0,50% 100%,50% 0}
  62.5% {background-position:0 100%,100% 0,50% 100%,0 0}
  75%   {background-position:0 100%,100% 100%,50% 100%,0 0}
  87.5% {background-position:0 100%,100% 100%,50% 0,0 0}
  100%  {background-position:0 100%,50% 100%,50% 0,0 0}
}
`;

fs.appendFileSync(path.join(__dirname, 'frontend/src/index.css'), css);

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

walk(path.join(__dirname, 'frontend/src'), (filePath) => {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace <Loader2 ... animate-spin ... />
        content = content.replace(/<Loader2[^>]*animate-spin[^>]*\/>/g, '<div className="loader"></div>');
        
        // Replace <div className="animate-spin ..."></div>
        content = content.replace(/<div[^>]*className="[^"]*animate-spin[^"]*"[^>]*><\/div>/g, '<div className="loader"></div>');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log('Updated: ' + filePath);
        }
    }
});
console.log('Done!');
