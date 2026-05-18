import fs from 'fs';
import path from 'path';
import { globSync } from 'fs'; // Wait, Node 20 doesn't have globSync built-in. I'll use simple recursion.

function findPackages(dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      const fullPath = path.join(dir, entry.name);
      if (fs.existsSync(path.join(fullPath, 'package.json'))) {
        result.push(fullPath);
      } else {
        result.push(...findPackages(fullPath));
      }
    }
  }
  return result;
}

const packages = findPackages(path.join(process.cwd(), 'packages'));

for (const pkg of packages) {
  const pkgJsonPath = path.join(pkg, 'package.json');
  let content = fs.readFileSync(pkgJsonPath, 'utf8');
  if (content.includes('@mxclaw/$1')) {
    console.log(`Fixing ${pkgJsonPath}`);
    // Find all imports
    const srcDir = path.join(pkg, 'src');
    const mxclawDeps = new Set();
    
    function scanImports(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) scanImports(fullPath);
        else if (entry.isFile() && fullPath.endsWith('.ts')) {
          const code = fs.readFileSync(fullPath, 'utf8');
          const matches = code.matchAll(/from\s+['"]@mxclaw\/([^'"]+)['"]/g);
          for (const match of matches) {
            mxclawDeps.add(`@mxclaw/${match[1]}`);
          }
          // Also dynamic imports
          const dynMatches = code.matchAll(/import\(['"]@mxclaw\/([^'"]+)['"]\)/g);
          for (const match of dynMatches) {
            mxclawDeps.add(`@mxclaw/${match[1]}`);
          }
        }
      }
    }
    
    scanImports(srcDir);
    
    const pkgJson = JSON.parse(content);
    if (pkgJson.dependencies) {
      // Remove all @mxclaw/$1
      for (const key of Object.keys(pkgJson.dependencies)) {
        if (key.includes('$1')) {
          delete pkgJson.dependencies[key];
        }
      }
      // Add found deps
      for (const dep of mxclawDeps) {
        pkgJson.dependencies[dep] = 'workspace:*';
      }
    }
    
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  }
}
console.log('Done!');
