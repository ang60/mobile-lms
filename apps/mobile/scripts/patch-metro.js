const fs = require('fs');
const path = require('path');

const packagesToPatch = [
  'metro',
  'metro-cache',
  'metro-transform-worker',
  'metro-runtime',
];

packagesToPatch.forEach((pkgName) => {
  const pkgPath = path.join(__dirname, '..', 'node_modules', pkgName, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (!pkg.exports) {
        pkg.exports = {};
      }
      // Add wildcard exports for src directory
      pkg.exports['./src/*'] = './src/*.js';
      pkg.exports['./src/**/*'] = './src/**/*.js';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log(`✓ Patched ${pkgName}`);
    } catch (error) {
      console.warn(`⚠ Could not patch ${pkgName}:`, error.message);
    }
  }
});

