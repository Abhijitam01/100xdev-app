const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputIcon = path.join(__dirname, '../assets/icon-100xdev.webp');
const outputDir = path.join(__dirname, '../assets');

console.log('Converting icon-100xdev.webp to required formats...');

// Try using electron-icon-maker if available
try {
  console.log('Attempting to use electron-icon-maker...');
  execSync(`npx --yes electron-icon-maker --input=${inputIcon} --output=${outputDir}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('Icon conversion completed successfully!');
} catch (error) {
  console.log('electron-icon-maker not available, manual conversion needed.');
  console.log('Please convert icon-100xdev.webp to:');
  console.log('  - assets/icon.png (512x512 for Linux)');
  console.log('  - assets/icon.ico (for Windows)');
  console.log('  - assets/icon.icns (for macOS)');
  console.log('\nYou can use: npx electron-icon-maker --input=assets/icon-100xdev.webp --output=assets');
  process.exit(1);
}

