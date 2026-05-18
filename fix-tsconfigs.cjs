const fs = require('fs');
const path = require('path');

const packagesDir = path.join(process.cwd(), 'packages');
const packages = fs.readdirSync(packagesDir);

for (const pkg of packages) {
  const pkgDir = path.join(packagesDir, pkg);
  if (fs.statSync(pkgDir).isDirectory()) {
    const tsconfigPath = path.join(pkgDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      console.log(`Creating tsconfig.json in ${pkg}`);
      const content = {
        "extends": "../../tsconfig.base.json",
        "compilerOptions": {
          "outDir": "./dist",
          "rootDir": "./src"
        },
        "include": ["src"]
      };
      fs.writeFileSync(tsconfigPath, JSON.stringify(content, null, 2));
    }
  }
}
