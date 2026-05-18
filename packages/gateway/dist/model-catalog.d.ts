/**
 * Model Catalog — capability discovery for all supported models.
 *
 * Mirrors OpenClaw's `src/model-catalog/` with pre-seeded knowledge
 * of model capabilities across all 17+ providers.
 */
export interface ModelCapabilities {
    id: string;
    provider: string;
    displayName: string;
    contextWindow: number;
    maxOutput: number;
    supportsVision: boolean;
    supportsTools: boolean;
    supportsStreaming: boolean;
    supportsJson: boolean;
    pricing?: {
        inputPer1M: number;
        outputPer1M: number;
    };
    releaseDate?: string;
}
/**
 * Get all models in the catalog.
 */
export declare function getAllModels(): ModelCapabilities[];
/**
 * Get models for a specific provider.
 */
export declare function getModelsForProvider(provider: string): ModelCapabilities[];
/**
 * Look up a specific model by ID.
 */
export declare function getModel(modelId: string): ModelCapabilities | undefined;
/**
 * Find the cheapest model that meets the given requirements.
 */
export declare function recommendModel(requirements: {
    needsVision?: boolean;
    needsTools?: boolean;
    minContext?: number;
    maxPricePer1M?: number;
}): ModelCapabilities | undefined;
/**
 * Get models grouped by provider for UI display.
 */
export declare function getModelsByProvider(): Record<string, ModelCapabilities[]>;
//# sourceMappingURL=model-catalog.d.ts.map