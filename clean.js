const fs = require('fs');
const path = require('path');

// Function to remove directory recursively
const removeDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✅ Removed ${dir}`);
  }
};

// Remove node_modules
removeDir(path.join(process.cwd(), 'node_modules'));

// Remove package-lock.json
const packageLockPath = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  fs.unlinkSync(packageLockPath);
  console.log('✅ Removed package-lock.json');
}