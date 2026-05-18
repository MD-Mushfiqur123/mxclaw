import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const channelDescriptions = {
  "channel-telegram": "Telegram bot channel plugin via Bot API",
  "channel-slack": "Slack app channel plugin via Socket Mode",
  "channel-signal": "Signal channel plugin via signal-cli REST API",
  "channel-imessage": "iMessage channel plugin via BlueBubbles server (macOS only)",
  "channel-irc": "IRC channel plugin via raw TCP socket",
  "channel-googlechat": "Google Chat channel plugin via REST API",
  "channel-teams": "Microsoft Teams channel plugin via Bot Framework",
  "channel-feishu": "Feishu/Lark channel plugin via Open API",
  "channel-line": "LINE channel plugin via Messaging API",
  "channel-mattermost": "Mattermost channel plugin via WebSocket API",
  "channel-nextcloud": "Nextcloud Talk channel plugin via OCS API",
  "channel-synology": "Synology Chat channel plugin via REST API polling",
  "channel-tlon": "Tlon/Urbit channel plugin via HTTP SSE and poke",
  "channel-twitch": "Twitch channel plugin via IRC",
  "channel-zalo": "Zalo OA channel plugin via Open REST API",
  "channel-wechat": "WeChat Official Account channel plugin via REST API",
};

const providerDescriptions = {
  "provider-openai": "OpenAI provider plugin for MxClaw",
  "provider-anthropic": "Anthropic Claude provider plugin for MxClaw",
  "provider-azure": "Azure OpenAI provider plugin for MxClaw",
  "provider-bedrock": "AWS Bedrock provider plugin for MxClaw",
  "provider-cloudflare": "Cloudflare Workers AI provider plugin for MxClaw",
  "provider-cohere": "Cohere provider plugin for MxClaw",
  "provider-deepseek": "DeepSeek provider plugin for MxClaw",
  "provider-fireworks": "Fireworks AI provider plugin for MxClaw",
  "provider-gemini": "Google Gemini provider plugin for MxClaw",
  "provider-groq": "Groq provider plugin for MxClaw",
  "provider-huggingface": "Hugging Face Inference provider plugin for MxClaw",
  "provider-lmstudio": "LM Studio provider plugin for MxClaw (local models)",
  "provider-mistral": "Mistral AI provider plugin for MxClaw",
  "provider-ollama": "Ollama provider plugin for MxClaw (local models)",
  "provider-perplexity": "Perplexity provider plugin for MxClaw",
  "provider-replicate": "Replicate provider plugin for MxClaw",
  "provider-requesty": "Requesty AI provider plugin for MxClaw",
  "provider-together": "Together AI provider plugin for MxClaw",
  "provider-xai": "xAI (Grok) provider plugin for MxClaw",
};

let count = 0;
for (const [dir, desc] of Object.entries(channelDescriptions)) {
  const pkgPath = path.join(ROOT, "packages", dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    console.log(`  ⏭️  ${dir} — already exists`);
    continue;
  }
  const pkg = {
    name: `@mxclaw/${dir}`,
    version: "0.1.0",
    description: desc,
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": { import: "./dist/index.js", types: "./dist/index.d.ts" },
      "./manifest.json": "./manifest.json",
    },
    scripts: { build: "tsc", dev: "tsc --watch", clean: "rimraf dist" },
    dependencies: { "@mxclaw/core": "workspace:*", uuid: "^11.0.0" },
    devDependencies: { rimraf: "^6.0.0", typescript: "^5.7.0" },
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  console.log(`  ✅ ${dir}`);
  count++;
}

for (const [dir, desc] of Object.entries(providerDescriptions)) {
  const pkgPath = path.join(ROOT, "packages", dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    console.log(`  ⏭️  ${dir} — already exists`);
    continue;
  }
  const pkg = {
    name: `@mxclaw/${dir}`,
    version: "0.1.0",
    description: desc,
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": { import: "./dist/index.js", types: "./dist/index.d.ts" },
      "./manifest.json": "./manifest.json",
    },
    scripts: { build: "tsc", dev: "tsc --watch", clean: "rimraf dist" },
    dependencies: { "@mxclaw/core": "workspace:*" },
    devDependencies: { rimraf: "^6.0.0", typescript: "^5.7.0" },
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  console.log(`  ✅ ${dir}`);
  count++;
}

console.log(`\n📦 Created ${count} package.json files`);
