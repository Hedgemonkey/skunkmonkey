// Simple script to copy the Vite manifest.json file to the static root directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths
const viteManifestPath = path.resolve(__dirname, '../staticfiles/.vite/manifest.json');
const staticManifestPath = path.resolve(__dirname, '../static/manifest.json');
const staticFilesManifestPath = path.resolve(__dirname, '../staticfiles/manifest.json');

// Check if the .vite manifest exists
if (fs.existsSync(viteManifestPath)) {
  console.log('Copying Vite manifest.json to static directory...');

  // Read the manifest file
  const originalManifest = JSON.parse(fs.readFileSync(viteManifestPath, 'utf8'));

  // Transform the manifest to use simple keys for entry points
  const transformedManifest = {};

  Object.entries(originalManifest).forEach(([key, value]) => {
    // Map specific entry points to simple names
    if (key.includes('src/core/js/main.js') ||
        key.includes('frontend/src/core/js/main.js')) {
      transformedManifest['main'] = value;
    }
    else if (key.includes('src/core/js/messages.js') ||
             key.includes('frontend/src/core/js/messages.js')) {
      transformedManifest['messages'] = value;
    }
    else if (key.includes('src/common/js/image_cropper.js') ||
             key.includes('frontend/src/common/js/image_cropper.js')) {
      transformedManifest['imageCropper'] = value;
    }
    else if (key.includes('src/common/js/api-client.js') ||
             key.includes('frontend/src/common/js/api-client.js')) {
      transformedManifest['apiClient'] = value;
    }
    else if (key.includes('src/home/js/home.js') ||
             key.includes('frontend/src/home/js/home.js')) {
      transformedManifest['home'] = value;
    }
    else {
      // Keep other entries as is
      transformedManifest[key] = value;
    }
  });

  // Convert back to JSON
  const manifestJson = JSON.stringify(transformedManifest, null, 2);

  // Write it to the static directory root
  fs.writeFileSync(staticManifestPath, manifestJson);
  console.log('Transformed manifest file copied to static directory');

  // Also write to staticfiles if it exists
  if (fs.existsSync(path.resolve(__dirname, '../staticfiles'))) {
    fs.writeFileSync(staticFilesManifestPath, manifestJson);
    console.log('Transformed manifest file copied to staticfiles directory');
  }
} else {
  console.error('Error: Vite manifest.json not found at', viteManifestPath);
}

// Path to the manifest file
const manifestPath = path.resolve(__dirname, '../staticfiles/manifest.json');

// Read the manifest file
try {
  console.log('Post-build script: Processing Vite manifest...');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);

  // Updated manifest to match Django-Vite expected format
  const newManifest = {};

  // Iterate through each entry in the original manifest
  Object.keys(manifest).forEach(key => {
    const item = manifest[key];
    if (key.includes('src/') && key.endsWith('.js')) {
      // Extract entry point name from file path (src/core/js/main.js => main)
      const parts = key.split('/');
      const entryName = parts[parts.length - 1].replace('.js', '');

      // Add to new manifest with proper format
      newManifest[entryName] = {
        file: item.file,
        css: item.css || []
      };
    }
  });

  // Write the updated manifest back to file
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2), 'utf8');
  console.log('Post-build script: Manifest updated successfully for Django-Vite compatibility');
} catch (error) {
  console.error('Post-build script error:', error);
  process.exit(1);
}
