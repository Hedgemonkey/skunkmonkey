#!/bin/bash
# Script to clean up and consolidate package.json files

echo "Consolidating package.json files for DirectAdmin deployment..."

# Backup original files
cp package.json package.json.bak
cp package.prod.json package.prod.json.bak

# Create a clean package.json based on package.prod.json
node -e '
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(process.cwd(), "package.json");
const pkgProdPath = path.join(process.cwd(), "package.prod.json");

// Read both package files
const pkg = require(pkgPath);
const pkgProd = require(pkgProdPath);

// Create consolidated package
const newPkg = {
  name: pkgProd.name || pkg.name,
  description: pkgProd.description || pkg.description,
  version: pkgProd.version || pkg.version,
  main: pkgProd.main || pkg.main,

  // Include all dependencies
  dependencies: { ...pkgProd.dependencies },

  // Keep only relevant development dependencies
  devDependencies: { "vite": pkg.devDependencies.vite },

  // Keep essential scripts
  scripts: {
    "dev": "vite --config frontend/vite.config.js",
    "build": "vite build --config frontend/vite.config.js",
    "preview": "vite preview --config frontend/vite.config.js"
  },

  // Keep repository info if available
  repository: pkg.repository,
  author: pkg.author,
  license: pkg.license,

  // Keep only if not empty
  bugs: pkg.bugs,
  homepage: pkg.homepage
};

// Write the consolidated package.json
fs.writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2));
console.log("Created consolidated package.json");
'

echo "Package files consolidated!"
echo "You can now remove package.prod.json:"
echo "  rm package.prod.json package.prod.json.bak"
echo ""
