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
  pricing?: { inputPer1M: number; outputPer1M: number };
  releaseDate?: string;
}

// ── Pre-seeded model catalog ─────────────────────────────────────────

const CATALOG: ModelCapabilities[] = [
  // OpenAI
  { id: "gpt-4.1", provider: "openai", displayName: "GPT-4.1", contextWindow: 1_047_576, maxOutput: 32_768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2, outputPer1M: 8 }, releaseDate: "2025-04" },
  { id: "gpt-4.1-mini", provider: "openai", displayName: "GPT-4.1 Mini", contextWindow: 1_047_576, maxOutput: 32_768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.4, outputPer1M: 1.6 }, releaseDate: "2025-04" },
  { id: "gpt-4.1-nano", provider: "openai", displayName: "GPT-4.1 Nano", contextWindow: 1_047_576, maxOutput: 32_768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.1, outputPer1M: 0.4 }, releaseDate: "2025-04" },
  { id: "gpt-4o", provider: "openai", displayName: "GPT-4o", contextWindow: 128_000, maxOutput: 16_384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2.5, outputPer1M: 10 } },
  { id: "gpt-4o-mini", provider: "openai", displayName: "GPT-4o Mini", contextWindow: 128_000, maxOutput: 16_384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },
  { id: "o3", provider: "openai", displayName: "o3", contextWindow: 200_000, maxOutput: 100_000, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 10, outputPer1M: 40 }, releaseDate: "2025-04" },
  { id: "o4-mini", provider: "openai", displayName: "o4-mini", contextWindow: 200_000, maxOutput: 100_000, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 1.1, outputPer1M: 4.4 }, releaseDate: "2025-04" },

  // Anthropic
  { id: "claude-opus-4-20250514", provider: "anthropic", displayName: "Claude Opus 4", contextWindow: 200_000, maxOutput: 32_000, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 15, outputPer1M: 75 }, releaseDate: "2025-05" },
  { id: "claude-sonnet-4-20250514", provider: "anthropic", displayName: "Claude Sonnet 4", contextWindow: 200_000, maxOutput: 64_000, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 3, outputPer1M: 15 }, releaseDate: "2025-05" },
  { id: "claude-haiku-4-5-20251001", provider: "anthropic", displayName: "Claude Haiku 4.5", contextWindow: 200_000, maxOutput: 8_192, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.8, outputPer1M: 4 }, releaseDate: "2025-10" },

  // Google
  { id: "gemini-2.5-pro", provider: "gemini", displayName: "Gemini 2.5 Pro", contextWindow: 1_000_000, maxOutput: 65_536, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 1.25, outputPer1M: 10 } },
  { id: "gemini-2.5-flash", provider: "gemini", displayName: "Gemini 2.5 Flash", contextWindow: 1_000_000, maxOutput: 65_536, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },

  // DeepSeek
  { id: "deepseek-chat", provider: "deepseek", displayName: "DeepSeek V3", contextWindow: 64_000, maxOutput: 8_192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.27, outputPer1M: 1.1 } },
  { id: "deepseek-reasoner", provider: "deepseek", displayName: "DeepSeek R1", contextWindow: 64_000, maxOutput: 8_192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: false, pricing: { inputPer1M: 0.55, outputPer1M: 2.19 } },

  // Groq
  { id: "llama-3.3-70b-versatile", provider: "groq", displayName: "Llama 3.3 70B", contextWindow: 128_000, maxOutput: 32_768, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.59, outputPer1M: 0.79 } },
  { id: "llama-4-scout-17b-16e-instruct", provider: "groq", displayName: "Llama 4 Scout 17B", contextWindow: 131_072, maxOutput: 8_192, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.11, outputPer1M: 0.34 }, releaseDate: "2025-04" },

  // Mistral
  { id: "mistral-large-latest", provider: "mistral", displayName: "Mistral Large", contextWindow: 128_000, maxOutput: 8_192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2, outputPer1M: 6 } },

  // Cohere
  { id: "command-a", provider: "cohere", displayName: "Command A", contextWindow: 256_000, maxOutput: 8_192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2.5, outputPer1M: 10 }, releaseDate: "2025-03" },

  // xAI
  { id: "grok-3", provider: "xai", displayName: "Grok 3", contextWindow: 131_072, maxOutput: 16_384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 3, outputPer1M: 15 } },

  // Perplexity
  { id: "sonar-pro", provider: "perplexity", displayName: "Sonar Pro", contextWindow: 200_000, maxOutput: 8_192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: false, pricing: { inputPer1M: 3, outputPer1M: 15 } },

  // Requesty (router — model list varies by user's enabled models)
  { id: "gpt-4o", provider: "requesty", displayName: "GPT-4o (via Requesty)", contextWindow: 128_000, maxOutput: 16_384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
  { id: "claude-sonnet-4-20250514", provider: "requesty", displayName: "Claude Sonnet 4 (via Requesty)", contextWindow: 200_000, maxOutput: 64_000, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },

  // Hugging Face
  { id: "meta-llama/Llama-3.3-70B-Instruct", provider: "huggingface", displayName: "Llama 3.3 70B Instruct", contextWindow: 128_000, maxOutput: 8_192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
  { id: "Qwen/Qwen2.5-72B-Instruct", provider: "huggingface", displayName: "Qwen 2.5 72B Instruct", contextWindow: 131_072, maxOutput: 8_192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", provider: "huggingface", displayName: "Mistral 7B Instruct", contextWindow: 32_768, maxOutput: 4_096, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },

  // Local
  { id: "any", provider: "ollama", displayName: "Ollama (Local)", contextWindow: 128_000, maxOutput: 4_096, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
  { id: "any", provider: "lmstudio", displayName: "LM Studio (Local)", contextWindow: 128_000, maxOutput: 4_096, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true },
];

/**
 * Get all models in the catalog.
 */
export function getAllModels(): ModelCapabilities[] {
  return [...CATALOG];
}

/**
 * Get models for a specific provider.
 */
export function getModelsForProvider(provider: string): ModelCapabilities[] {
  return CATALOG.filter((m) => m.provider === provider);
}

/**
 * Look up a specific model by ID.
 */
export function getModel(modelId: string): ModelCapabilities | undefined {
  return CATALOG.find((m) => m.id === modelId);
}

/**
 * Find the cheapest model that meets the given requirements.
 */
export function recommendModel(requirements: {
  needsVision?: boolean;
  needsTools?: boolean;
  minContext?: number;
  maxPricePer1M?: number;
}): ModelCapabilities | undefined {
  return CATALOG
    .filter((m) => {
      if (requirements.needsVision && !m.supportsVision) return false;
      if (requirements.needsTools && !m.supportsTools) return false;
      if (requirements.minContext && m.contextWindow < requirements.minContext) return false;
      if (requirements.maxPricePer1M && m.pricing && m.pricing.inputPer1M > requirements.maxPricePer1M) return false;
      return true;
    })
    .sort((a, b) => (a.pricing?.inputPer1M ?? Infinity) - (b.pricing?.inputPer1M ?? Infinity))[0];
}

/**
 * Get models grouped by provider for UI display.
 */
export function getModelsByProvider(): Record<string, ModelCapabilities[]> {
  const grouped: Record<string, ModelCapabilities[]> = {};
  for (const model of CATALOG) {
    if (!grouped[model.provider]) grouped[model.provider] = [];
    grouped[model.provider]!.push(model);
  }
  return grouped;
}
