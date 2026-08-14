const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/pages/dashboard');
const registerFile = path.join(__dirname, 'frontend/src/pages/Register.tsx');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    // Check if sweetalert2 is imported
    if (!content.includes("import Swal from 'sweetalert2'")) {
        // Insert after the last import
        const importRegex = /^import\s+.*?;?\s*$/gm;
        let match;
        let lastMatchEnd = 0;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatchEnd = importRegex.lastIndex;
        }
        if (lastMatchEnd > 0) {
            content = content.substring(0, lastMatchEnd) + "\nimport Swal from 'sweetalert2';" + content.substring(lastMatchEnd);
            modified = true;
        }
    }

    // Replace alert('message') or alert(`message`)
    const alertRegex = /alert\((['"`])(.*?)\1\);?/g;
    if (alertRegex.test(content)) {
        content = content.replace(alertRegex, "Swal.fire({ icon: 'info', title: $1$2$1, timer: 1500, showConfirmButton: false })");
        modified = true;
    }
    
    // Replace alert(error.response?.data?.message || 'Gagal...')
    const alertDynRegex = /alert\((error\.response\?\.data\?\.message\s*\|\|\s*['"`].*?['"`])\);?/g;
    if (alertDynRegex.test(content)) {
        content = content.replace(alertDynRegex, "Swal.fire({ icon: 'error', title: $1 })");
        modified = true;
    }
    
    // Custom replace for alert(`User berhasil...`) in Verifikasi.tsx
    const alertBacktick = /alert\((`User berhasil \$\{.*?\}?`)\);?/g;
    if (alertBacktick.test(content)) {
        content = content.replace(alertBacktick, "Swal.fire({ icon: 'success', title: $1, timer: 1500, showConfirmButton: false })");
        modified = true;
    }

    // Fix confirms:
    // Format 1: if (!confirm('...')) return;
    const confirmRegex1 = /if\s*\(!confirm\((['"`].*?['"`])\)\)\s*return;/g;
    if (confirmRegex1.test(content)) {
        content = content.replace(confirmRegex1, `const result = await Swal.fire({ title: $1, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya', cancelButtonText: 'Batal', confirmButtonColor: '#10B981', cancelButtonColor: '#EF4444' });\n    if (!result.isConfirmed) return;`);
        modified = true;
    }

    // Format 2: if (window.confirm('...')) { ... try/catch }
    const confirmRegex2 = /if\s*\((?:window\.)?confirm\((['"`].*?['"`])\)\)\s*\{/g;
    if (confirmRegex2.test(content)) {
        content = content.replace(confirmRegex2, `const result = await Swal.fire({ title: $1, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya', cancelButtonText: 'Batal', confirmButtonColor: '#10B981', cancelButtonColor: '#EF4444' });\n    if (result.isConfirmed) {`);
        modified = true;
    }

    if (modified) {
        // Simple heuristic to change some icon: 'info' to success or error if string contains words like 'berhasil' or 'gagal'
        content = content.replace(/Swal\.fire\(\{\s*icon:\s*'info',\s*title:\s*(['"`].*?berhasil.*?['"`])/gi, "Swal.fire({ icon: 'success', title: $1");
        content = content.replace(/Swal\.fire\(\{\s*icon:\s*'info',\s*title:\s*(['"`].*?gagal.*?['"`])/gi, "Swal.fire({ icon: 'error', title: $1");

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', path.basename(filePath));
    }
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.forEach(f => processFile(path.join(dir, f)));
processFile(registerFile);

console.log('Refactoring complete.');
