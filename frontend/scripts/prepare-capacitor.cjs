const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'out');
const indexFile = path.join(outputDir, 'index.html');

if (!fs.existsSync(indexFile)) {
  console.warn('No exported Next.js build output found at out/index.html; skipping Capacitor web preparation.');
  process.exit(0);
}

console.log('Capacitor web assets ready at out/index.html');
