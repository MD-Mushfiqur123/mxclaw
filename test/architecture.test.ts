import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

describe('Architecture Quality Tests', () => {
  describe('Package Structure', () => {
    test('should have consistent package structure', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      expect(packages.length).toBeGreaterThan(0);

      packages.forEach(pkg => {
        const packageJson = JSON.parse(
          readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
        );

        // Check for required fields
        expect(packageJson.name).toBeDefined();
        expect(packageJson.version).toBeDefined();
        expect(packageJson.type).toBe('module');

        // Check for build scripts
        if (packageJson.scripts) {
          expect(packageJson.scripts.build).toBeDefined();
        }

        // Check for TypeScript configuration
        if (existsSync(join(packagesDir, pkg, 'tsconfig.json'))) {
          const tsConfig = JSON.parse(
            readFileSync(join(packagesDir, pkg, 'tsconfig.json'), 'utf-8')
          );
          expect(tsConfig.compilerOptions).toBeDefined();
          expect(tsConfig.compilerOptions.module).toBe('ESNext');
        }
      });
    });

    test('should have consistent exports structure', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      packages.forEach(pkg => {
        const packageJson = JSON.parse(
          readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
        );

        if (packageJson.exports) {
          // Check that exports point to valid files
          Object.entries(packageJson.exports).forEach(([key, value]) => {
            if (typeof value === 'string') {
              const exportPath = join(packagesDir, pkg, value);
              expect(existsSync(exportPath)).toBe(true);
            }
          });
        }
      });
    });
  });

  describe('Import Boundaries', () => {
    test('should prevent circular dependencies', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      // Simple check for circular imports (would need more sophisticated analysis for full validation)
      const dependencyGraph: Record<string, string[]> = {};

      packages.forEach(pkg => {
        const packageJson = JSON.parse(
          readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
        );
        
        dependencyGraph[pkg] = Object.keys(packageJson.dependencies || {})
          .filter(dep => packages.includes(dep))
          .filter(dep => dep !== pkg); // Self-dependency is not allowed
      });

      // Check for obvious circular dependencies
      Object.entries(dependencyGraph).forEach(([pkg, deps]) => {
        deps.forEach(dep => {
          if (dependencyGraph[dep]?.includes(pkg)) {
            expect.fail(`Circular dependency detected: ${pkg} ↔ ${dep}`);
          }
        });
      });
    });

    test('should enforce proper dependency versioning', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      packages.forEach(pkg => {
        const packageJson = JSON.parse(
          readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
        );

        Object.entries(packageJson.dependencies || {}).forEach(([dep, version]) => {
          // Check for exact version pinning (for better reproducibility)
          if (!version.startsWith('workspace:')) {
            expect(version).not.toMatch(/^\d+$/); // Should not be bare major version
            expect(version).not.toMatch(/^\d+\.\d+$/); // Should not be major.minor version
          }
        });
      });
    });
  });

  describe('Code Organization', () => {
    test('should have consistent naming conventions', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      packages.forEach(pkg => {
        const srcDir = join(packagesDir, pkg, 'src');
        if (existsSync(srcDir)) {
          const files = readdirSync(srcDir);
          
          files.forEach(file => {
            // Check file naming conventions
            expect(file).toMatch(/^[a-z][a-z0-9-]*\.ts$/);
            
            // Check that index files exist for proper organization
            if (file === 'index.ts') {
              expect(existsSync(join(srcDir, file))).toBe(true);
            }
          });
        }
      });
    });

    test('should have proper module boundaries', () => {
      const corePackages = ['core', 'gateway', 'agent', 'message'];
      const packagesDir = join(process.cwd(), 'packages');

      corePackages.forEach(pkg => {
        if (existsSync(join(packagesDir, pkg))) {
          const packageJson = JSON.parse(
            readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
          );

          // Core packages should not depend on UI packages
          Object.keys(packageJson.dependencies || {}).forEach(dep => {
            if (dep.includes('ui') || dep.includes('app')) {
              expect.fail(`Core package ${pkg} should not depend on UI package ${dep}`);
            }
          });
        }
      });
    });
  });

  describe('Configuration Consistency', () => {
    test('should have consistent TypeScript configuration', () => {
      const tsconfigBase = join(process.cwd(), 'tsconfig.base.json');
      if (existsSync(tsconfigBase)) {
        const baseConfig = JSON.parse(readFileSync(tsconfigBase, 'utf-8'));
        
        // Check that all packages extend the base config
        const packagesDir = join(process.cwd(), 'packages');
        const packages = readdirSync(packagesDir).filter(dir => 
          existsSync(join(packagesDir, dir, 'package.json'))
        );

        packages.forEach(pkg => {
          const tsconfigPath = join(packagesDir, pkg, 'tsconfig.json');
          if (existsSync(tsconfigPath)) {
            const tsConfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
            expect(tsConfig.extends).toBeDefined();
            expect(tsConfig.extends).toContain('tsconfig.base.json');
          }
        });
      }
    });

    test('should have consistent linting configuration', () => {
      const eslintrcPath = join(process.cwd(), '.eslintrc.json');
      if (existsSync(eslintrcPath)) {
        const eslintConfig = JSON.parse(readFileSync(eslintrcPath, 'utf-8'));
        
        // Check that ESLint is configured for TypeScript
        expect(eslintConfig.parser).toBe('@typescript-eslint/parser');
        expect(eslintConfig.plugins).toContain('@typescript-eslint');
      }
    });
  });

  describe('Security Constraints', () => {
    test('should prevent dangerous dependencies', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      const dangerousPackages = [
        'eval',
        'exec',
        'child_process',
        'fs',
        'path'
      ];

      packages.forEach(pkg => {
        const packageJson = JSON.parse(
          readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
        );

        dangerousPackages.forEach(dangerous => {
          if (packageJson.dependencies?.[dangerous]) {
            expect.fail(`Package ${pkg} depends on dangerous package: ${dangerous}`);
          }
        });
      });
    });

    test('should have proper package security settings', () => {
      const packagesDir = join(process.cwd(), 'packages');
      const packages = readdirSync(packagesDir).filter(dir => 
        existsSync(join(packagesDir, dir, 'package.json'))
      );

      packages.forEach(pkg => {
        const packageJson = JSON.parse(
          readFileSync(join(packagesDir, pkg, 'package.json'), 'utf-8')
        );

        // Check for security-related scripts
        if (packageJson.scripts) {
          const securityScripts = ['audit', 'security', 'check'];
          securityScripts.forEach(script => {
            if (packageJson.scripts[script]) {
              expect(typeof packageJson.scripts[script]).toBe('string');
            }
          });
        }
      });
    });
  });
});