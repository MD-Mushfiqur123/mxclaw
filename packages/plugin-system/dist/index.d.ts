import type { ChannelPlugin, ProviderPlugin, VoicePlugin, MxClawConfig } from "@mxclaw/core";
export interface PluginRegistry {
    channels: Map<string, ChannelPlugin>;
    providers: Map<string, ProviderPlugin>;
    voices: Map<string, VoicePlugin>;
    pluginErrors: Array<{
        plugin: string;
        error: string;
    }>;
}
export declare function createPluginRegistry(): PluginRegistry;
export declare function loadPlugins(config: MxClawConfig, registry: PluginRegistry): Promise<void>;
export declare function getChannelPlugin(registry: PluginRegistry, channelType: string): ChannelPlugin | undefined;
export declare function getProviderPlugin(registry: PluginRegistry, providerName: string): ProviderPlugin | undefined;
export declare function getVoicePlugin(registry: PluginRegistry, voiceProvider: string): VoicePlugin | undefined;
//# sourceMappingURL=index.d.ts.map