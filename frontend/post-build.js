// Simple script to copy the Vite manifest.json file to the static root directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths
const viteManifestPath = path.resolve(__dirname, '../static/.vite/manifest.json');
const staticManifestPath = path.resolve(__dirname, '../static/manifest.json');
const staticFilesManifestPath = path.resolve(__dirname, '../staticfiles/manifest.json');

// Check if the .vite manifest exists
if (fs.existsSync(viteManifestPath)) {
  console.log('Copying Vite manifest.json to static directory...');
  
  // Read the manifest file
  const manifest = fs.readFileSync(viteManifestPath, 'utf8');
  
  // Write it to the static directory root
  fs.writeFileSync(staticManifestPath, manifest);
  console.log('Manifest file copied to static directory');
  
  // Also write to staticfiles if it exists
  if (fs.existsSync(path.resolve(__dirname, '../staticfiles'))) {
    fs.writeFileSync(staticFilesManifestPath, manifest);
    console.log('Manifest file copied to staticfiles directory');
  }
} else {
  console.error('Error: Vite manifest.json not found at', viteManifestPath);
}