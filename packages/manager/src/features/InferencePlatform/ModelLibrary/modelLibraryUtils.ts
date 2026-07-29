import { MODEL_SUPPLEMENTARY } from './modelLibrary.supplementary';

import type { Model, ModelFilterState, SortKey } from './modelLibrary.types';
import type { InferenceModel } from '@linode/api-v4';

/**
 * Descriptions for common use cases. Used for tooltips in the UI.
 */
const USE_CASE_DESCRIPTIONS: Record<string, string> = {
  agentic: 'Autonomous AI agents that can plan, reason, and execute tasks',
  chat: 'Conversational interactions and dialogue systems',
  chatbots: 'Building conversational AI assistants and chatbots',
  'code-assistance':
    'Code review, debugging, refactoring, and programming help',
  'code-generation': 'Generating code from natural language descriptions',
  coding: 'Code generation, completion, and programming assistance',
  'content-generation':
    'Creating articles, marketing copy, and creative content',
  'data-extraction': 'Extracting structured information from unstructured text',
  embedding: 'Converting text to vector representations for similarity search',
  'function-calling':
    'Invoking external tools and APIs based on natural language',
  general: 'General-purpose text generation and conversation',
  'image-understanding': 'Analyzing and describing visual content',
  'long-context':
    'Processing and reasoning over large documents and extended conversations',
  multilingual: 'Support for multiple languages and translation',
  rag: 'Retrieval-Augmented Generation for knowledge-based responses',
  reasoning: 'Enhanced logical reasoning and problem-solving',
  'semantic-search': 'Finding semantically similar content and documents',
  'structured-output': 'Generating JSON, XML, or other structured formats',
  summarization: 'Condensing long texts into concise summaries',
  'tool-use': 'Using external tools and executing actions',
  vision: 'Processing and understanding images',
};

/**
 * Convert API strings to ModelCapability format with optional descriptions.
 */
function toCapabilities(
  items: string[],
  descriptionMap: Record<string, string> = {}
): { description: string; label: string }[] {
  return items.map((item) => ({
    description: descriptionMap[item] ?? '',
    // Format label: "semantic-search" -> "Semantic Search"
    label: item
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  }));
}

/**
 * Merge a single InferenceModel entry with its supplementary metadata.
 * In development/mock mode, supplementary data fills in fields not provided
 * by the API (like pricing, etc.). Provider logos are always used from
 * supplementary data since the API doesn't provide them.
 */
export function mergeInferenceModel(m: InferenceModel): Model {
  // Always get logo data (API doesn't provide logos)
  const logoData = MODEL_SUPPLEMENTARY[m.id] ?? {};

  // Only use full supplementary data in development/mock mode
  const supp = import.meta.env.DEV ? logoData : {};

  // Convert context_window from tokens to K (thousands)
  const contextLengthK = m.parameters?.context_window
    ? Math.round(m.parameters.context_window / 1000)
    : 0;

  // Convert use_cases strings to ModelCapability format with descriptions
  const useCaseTags = m.use_cases
    ? toCapabilities(m.use_cases, USE_CASE_DESCRIPTIONS)
    : [];

  // Convert modalities to ModelCapability format
  const inputModes = m.modalities?.input
    ? toCapabilities(m.modalities.input)
    : [];
  const outputModes = m.modalities?.output
    ? toCapabilities(m.modalities.output)
    : [];

  // Exclude fields that should only come from API (not supplementary)
  const suppFiltered = { ...supp };
  delete suppFiltered.priceInputPerMillion;
  delete suppFiltered.priceOutputPerMillion;
  delete suppFiltered.supportedLanguages;

  return {
    // Defaults for fields not in API
    descriptionShort: '',
    isServerless: false,
    releasedAt: '',
    supportedLanguages: [],
    updatedAt: '',
    // Supplementary overrides (only in dev mode)
    ...suppFiltered,
    // API data takes precedence for fields it provides
    contextLengthK: contextLengthK || suppFiltered.contextLengthK || 0,
    description: m.description || suppFiltered.description || '',
    id: m.id,
    inputModes:
      inputModes.length > 0 ? inputModes : (suppFiltered.inputModes ?? []),
    outputModes:
      outputModes.length > 0 ? outputModes : (suppFiltered.outputModes ?? []),
    parametersB:
      m.parameters?.parameter_count_billions ?? suppFiltered.parametersB ?? 0,
    playgroundAvailable: m.playground_available ?? false,
    // Pricing only from API (not from supplementary)
    priceInputPerMillion: m.price_input_per_million,
    priceOutputPerMillion: m.price_output_per_million,
    // Logo always from supplementary (API doesn't provide it)
    providerLogo: logoData.providerLogo ?? '',
    providerName: m.provider?.name || suppFiltered.providerName || 'Unknown',
    title: m.label || suppFiltered.title || m.id,
    useCaseTags:
      useCaseTags.length > 0 ? useCaseTags : (suppFiltered.useCaseTags ?? []),
  };
}

/** Apply all active filters to the model list. */
export function applyModelFilters(
  models: Model[],
  filters: ModelFilterState
): Model[] {
  return models.filter((m) => {
    // 1. Search query — split on commas/colons, AND logic: every term must match
    if (filters.searchQuery) {
      const terms = filters.searchQuery
        .split(/[,:]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const useCaseLabels = m.useCaseTags.map((t) => t.label).join(' ');
      const haystack =
        `${m.title} ${m.providerName} ${useCaseLabels}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return false;
    }

    // 2. Serverless toggle
    // if (filters.isServerless && !m.isServerless) return false;

    // 3. Languages — AND logic: model must support every selected language
    if (filters.languages.length > 0) {
      const hasAll = filters.languages.every((lang) =>
        m.supportedLanguages.includes(lang)
      );
      if (!hasAll) return false;
    }

    // 4. Provider
    if (filters.providerLabel && m.providerName !== filters.providerLabel)
      return false;

    // 5. Parameter range
    if (m.parametersB < filters.minParametersB) return false;
    if (
      filters.maxParametersB !== null &&
      m.parametersB > filters.maxParametersB
    )
      return false;

    // 6. Context length range
    if (m.contextLengthK < filters.minContextLengthK) return false;
    if (
      filters.maxContextLengthK !== null &&
      m.contextLengthK > filters.maxContextLengthK
    )
      return false;

    // 7. Input modes — AND logic: model must support every selected input mode
    if (filters.inputModes.length > 0) {
      const modelInputLabels = m.inputModes.map((mode) => mode.label);
      const hasAll = filters.inputModes.every((mode) =>
        modelInputLabels.includes(mode)
      );
      if (!hasAll) return false;
    }

    // 8. Output modes — AND logic: model must support every selected output mode
    if (filters.outputModes.length > 0) {
      const modelOutputLabels = m.outputModes.map((mode) => mode.label);
      const hasAll = filters.outputModes.every((mode) =>
        modelOutputLabels.includes(mode)
      );
      if (!hasAll) return false;
    }

    // 9. Use-case tags — AND logic: model must have every selected tag
    if (filters.useCaseTags.length > 0) {
      const modelTagLabels = m.useCaseTags.map((t) => t.label);
      const hasAll = filters.useCaseTags.every((t) =>
        modelTagLabels.includes(t)
      );
      if (!hasAll) return false;
    }

    return true;
  });
}

/** Sort a model list by the given sort key (never mutates the input array). */
export function applyModelSort(models: Model[], sortKey: SortKey): Model[] {
  const sorted = [...models];
  switch (sortKey) {
    case 'contextLength_asc':
      return sorted.sort((a, b) => a.contextLengthK - b.contextLengthK);
    case 'contextLength_desc':
      return sorted.sort((a, b) => b.contextLengthK - a.contextLengthK);
    case 'parameters_asc':
      return sorted.sort((a, b) => a.parametersB - b.parametersB);
    case 'parameters_desc':
      return sorted.sort((a, b) => b.parametersB - a.parametersB);
    case 'releaseDate_desc':
      return sorted.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    case 'updateDate_desc':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

/** Derive unique, sorted provider names from a model list. */
export function getProviders(models: Model[]): string[] {
  return Array.from(new Set(models.map((m) => m.providerName))).sort();
}

/** Derive the union of all supported languages across a model list, sorted. */
export function getLanguages(models: Model[]): string[] {
  const all = models.flatMap((m) => m.supportedLanguages);
  return Array.from(new Set(all)).sort();
}

/** Derive the union of all input mode labels across a model list, sorted. */
export function getInputModes(models: Model[]): string[] {
  const all = models.flatMap((m) => m.inputModes.map((mode) => mode.label));
  return Array.from(new Set(all)).sort();
}

/** Derive the union of all output mode labels across a model list, sorted. */
export function getOutputModes(models: Model[]): string[] {
  const all = models.flatMap((m) => m.outputModes.map((mode) => mode.label));
  return Array.from(new Set(all)).sort();
}

/** Derive unique, sorted use-case tag labels across a model list. */
export function getUseCaseTags(models: Model[]): string[] {
  const all = models.flatMap((m) => m.useCaseTags.map((t) => t.label));
  return Array.from(new Set(all)).sort();
}
