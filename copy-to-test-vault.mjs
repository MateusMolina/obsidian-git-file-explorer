import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

// Define source and destination paths
const pluginName = 'git-file-explorer';
const sourceDir = '.';
const targetDir = join('test-vault', '.obsidian', 'plugins', pluginName);

// Files to copy
const filesToCopy = [
  'main.js',
  'styles.css',
  'manifest.json'
];

async function copyPluginFiles() {
  try {
    // Create target directory if it doesn't exist
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }

    // Copy each file
    for (const file of filesToCopy) {
      const sourcePath = join(sourceDir, file);
      const targetPath = join(targetDir, file);

      await copyFile(sourcePath, targetPath);
      console.log(`Copied ${file} to test vault`);
    }

    console.log('Successfully copied plugin files to test vault!');
  } catch (error) {
    console.error('Error copying plugin files:', error);
  }
}

// Execute the copy function
copyPluginFiles();