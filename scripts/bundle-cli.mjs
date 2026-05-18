import * as esbuild from "esbuild";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const req = createRequire(import.meta.url);

const entryPoint = path.join(ROOT, "packages", "cli", "src", "index.ts");

// Read root package.json to get all dependencies — externalize them
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));
const allDeps = new Set([
  ...Object.keys(rootPkg.dependencies ?? {}),
  ...Object.keys(rootPkg.devDependencies ?? {}),
]);
// Only externalize non-mxclaw packages — bundle our workspace code
const external = ["node:*", "better-sqlite3"];
for (const dep of allDeps) {
  if (!dep.startsWith("@mxclaw/")) {
    external.push(dep);
  }
}

console.log(`📦 Bundling MxClaw CLI from ${path.relative(ROOT, entryPoint)}...`);
console.log(`   External packages: ${external.filter((e) => !e.startsWith("node:")).join(", ")}`);

const result = await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: path.join(ROOT, "dist", "cli.mjs"),
  external,
  sourcemap: false,
  minify: false,
  mainFields: ["module", "main"],
  resolveExtensions: [".ts", ".mjs", ".js", ".json"],
  tsconfig: path.join(ROOT, "packages", "cli", "tsconfig.json"),
});

if (result.errors.length > 0) {
  console.error("\n❌ Bundle failed:");
  for (const err of result.errors) console.error(`   ${err.text}`);
  for (const warn of result.warnings) console.warn(`   ⚠️ ${warn.text}`);
  process.exit(1);
}

for (const warn of result.warnings) console.warn(`   ⚠️ ${warn.text}`);

const outSize = fs.statSync(path.join(ROOT, "dist", "cli.mjs")).size;
console.log(`   ✅ dist/cli.mjs (${(outSize / 1024).toFixed(0)} KB)`);
