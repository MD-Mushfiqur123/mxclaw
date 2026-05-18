import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export function createPluginRegistry() {
    return {
        channels: new Map(),
        providers: new Map(),
        voices: new Map(),
        pluginErrors: [],
    };
}
export async function loadPlugins(config, registry) {
    const pluginNames = config.plugins ?? [];
    // Scan built-in plugins from packages directory
    const builtinPlugins = scanBuiltinPlugins();
    // Scan npm packages for mxclaw-channel-*, mxclaw-provider-*, mxclaw-voice-*
    const npmPlugins = scanNpmPlugins();
    const allPlugins = [...new Set([...builtinPlugins, ...npmPlugins, ...pluginNames])];
    for (const pluginName of allPlugins) {
        try {
            await activatePlugin(pluginName, config, registry);
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            registry.pluginErrors.push({ plugin: pluginName, error: errorMsg });
            console.error(`[plugin-system] Failed to load plugin "${pluginName}":`, errorMsg);
        }
    }
}
function scanBuiltinPlugins() {
    const plugins = [];
    const packagesDir = path.resolve(import.meta.dirname ?? ".", "../../..");
    if (!fs.existsSync(packagesDir))
        return plugins;
    const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const manifestPath = path.join(packagesDir, entry.name, "manifest.json");
        if (fs.existsSync(manifestPath)) {
            plugins.push(entry.name);
        }
    }
    return plugins;
}
function scanNpmPlugins() {
    const plugins = [];
    const prefixes = ["mxclaw-channel-", "mxclaw-provider-", "mxclaw-voice-"];
    for (const prefix of prefixes) {
        try {
            // Scan node_modules for matching packages
            const nodeModulesPath = path.resolve(import.meta.dirname ?? ".", "../../../node_modules");
            if (!fs.existsSync(nodeModulesPath))
                continue;
            const scopedPath = path.join(nodeModulesPath, "@mxclaw");
            if (fs.existsSync(scopedPath)) {
                const scoped = fs.readdirSync(scopedPath, { withFileTypes: true });
                for (const entry of scoped) {
                    if (entry.isDirectory()) {
                        const manifestPath = path.join(scopedPath, entry.name, "manifest.json");
                        if (fs.existsSync(manifestPath)) {
                            plugins.push(`@mxclaw/${entry.name}`);
                        }
                    }
                }
            }
            const entries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name.startsWith(prefix)) {
                    const manifestPath = path.join(nodeModulesPath, entry.name, "manifest.json");
                    if (fs.existsSync(manifestPath)) {
                        plugins.push(entry.name);
                    }
                }
            }
        }
        catch {
            // node_modules may not exist yet
        }
    }
    return plugins;
}
async function activatePlugin(pluginName, config, registry) {
    let manifest;
    let modulePath;
    try {
        // Try resolving as a local package first
        const localPath = path.resolve(import.meta.dirname ?? ".", "../../..", pluginName.startsWith("@") ? (pluginName.split("/")[1] ?? pluginName) : pluginName);
        const localManifest = path.join(localPath, "manifest.json");
        if (fs.existsSync(localManifest)) {
            manifest = JSON.parse(fs.readFileSync(localManifest, "utf-8"));
            modulePath = path.join(localPath, manifest.main);
        }
        else {
            // Try npm resolution
            const pkgPath = require.resolve(`${pluginName}/manifest.json`);
            manifest = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            modulePath = require.resolve(`${pluginName}/${manifest.main}`);
        }
    }
    catch {
        throw new Error(`Cannot resolve plugin "${pluginName}": manifest.json not found`);
    }
    // Check if plugin type is enabled in config
    const channelConfigs = Object.values(config.channels ?? {});
    const hasChannelOfType = channelConfigs.some((c) => c.type === pluginName);
    if (manifest.type === "channel" && !hasChannelOfType) {
        // Skip channels not configured
        return;
    }
    const mod = await import(modulePath);
    const plugin = mod.default ?? mod;
    switch (manifest.type) {
        case "channel":
            registry.channels.set(manifest.name, plugin);
            break;
        case "provider":
            registry.providers.set(manifest.name, plugin);
            break;
        case "voice":
            registry.voices.set(manifest.name, plugin);
            break;
    }
    console.log(`[plugin-system] Activated ${manifest.type} plugin: ${manifest.name} v${manifest.version}`);
}
export function getChannelPlugin(registry, channelType) {
    return registry.channels.get(channelType);
}
export function getProviderPlugin(registry, providerName) {
    return registry.providers.get(providerName);
}
export function getVoicePlugin(registry, voiceProvider) {
    return registry.voices.get(voiceProvider);
}
//# sourceMappingURL=index.js.map