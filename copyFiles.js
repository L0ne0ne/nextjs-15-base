const fs = require('fs');
const path = require('path');

// Function to copy directories recursively
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true }); // Create destination directory if it doesn't exist
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join(__dirname, '.next/static');
const staticDest = path.join(__dirname, '.next/standalone/.next/static');
console.log(`Copying ${staticSrc} to ${staticDest}...`);
copyRecursiveSync(staticSrc, staticDest);

// Copy public to .next/standalone/public
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(__dirname, '.next/standalone/public');
console.log(`Copying ${publicSrc} to ${publicDest}...`);
copyRecursiveSync(publicSrc, publicDest);

console.log('Copying completed successfully.');
