import { isMSWEnabled } from 'src/dev-tools/utils';

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
 * Best-effort mapping from a model id/label to a slug recognised by the
 * local `modelIcon` / `providerIcon` switch in `utils.ts`. Used as a
 * fallback when the API returns no `model_icon` and no supplementary entry
 * exists, so the UI still renders a family-specific SVG instead of the
 * default (Google) fallback.
 */
export const modelSlugFromId = (id: string): string => {
  const s = id.toLowerCase();
  if (s.includes('gemma')) return 'gemma4';
  if (s.includes('llama') && s.includes('nemotron')) return 'nemotron';
  if (s.includes('nemotron')) return 'nemotron';
  if (s.includes('llama')) return 'metaLlama';
  if (s.includes('deepseek')) return 'deepseek';
  if (s.includes('qwen')) return 'qwen';
  if (s.includes('kimi') || s.includes('moonshot')) return 'moonshot';
  if (s.includes('glm')) return 'glm5';
  if (s.includes('gpt') || s.includes('openai')) return 'openai';
  return '';
};

/**
 * Merge a single InferenceModel entry with its supplementary metadata.
 * In development/mock mode, supplementary data fills in fields not provided
 * by the API (like pricing, etc.). Provider logos are always used from
 * supplementary data since the API doesn't provide them.
 */
export function mergeInferenceModel(m: InferenceModel): Model {
  const logoData = MODEL_SUPPLEMENTARY[m.id] ?? {};

  // Only use supplementary data when MSW is enabled (mock mode). With MSW off
  // we hit the real API and must not leak stale mock text/pricing/icons.
  const supp = isMSWEnabled ? logoData : {};

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
  // Description/highlights come from the API's `more_info`; strip
  // supplementary copies so stale mock text can't leak through.
  delete suppFiltered.description;
  delete suppFiltered.descriptionLong;
  delete suppFiltered.descriptionShort;
  delete suppFiltered.highlights;
  // Dates come from the API; strip supplementary copies so they can't leak.
  delete suppFiltered.releasedAt;
  delete suppFiltered.updatedAt;

  // Map API `prices` rows (by id) to the flat per-million fields used in the UI.
  const priceByRow = (rowId: string) =>
    m.prices?.find((p) => p.id === rowId)?.price?.hourly ?? undefined;
  const priceInput = priceByRow('price_per_million_tokens_input');
  const priceOutput = priceByRow('price_per_million_tokens_output');
  const priceCached = priceByRow('price_per_million_tokens_cached');

  return {
    // Defaults for fields not in API
    descriptionShort: '',
    isServerless: false,
    supportedLanguages: [],
    // Supplementary overrides (only in dev mode)
    ...suppFiltered,
    // API data takes precedence for fields it provides
    contextLengthK: contextLengthK || suppFiltered.contextLengthK || 0,
    description: m.description || '',
    descriptionLong: m.more_info?.long_description,
    highlights: m.more_info?.highlights,
    id: m.id,
    inputModes:
      inputModes.length > 0 ? inputModes : (suppFiltered.inputModes ?? []),
    outputModes:
      outputModes.length > 0 ? outputModes : (suppFiltered.outputModes ?? []),
    parametersB:
      m.parameters?.parameter_count_billions ?? suppFiltered.parametersB ?? 0,
    playgroundAvailable: m.playground_available ?? false,
    releasedAt: m.version_info?.release_date ?? m.created_at ?? '',
    totalParams: m.parameters?.total_params,
    updatedAt: m.updated_at ?? '',
    // Pricing only from API (via `prices` rows, with legacy
    // `price_per_million_tokens` fallback). Not from supplementary.
    priceInputCachedPerMillion:
      priceCached ?? suppFiltered.priceInputCachedPerMillion,
    priceInputPerMillion: priceInput ?? undefined,
    priceOutputPerMillion: priceOutput ?? undefined,
    // Icons from API, falling back to supplementary mock data. When the API
    // returns an empty `provider_icon` / `model_icon`, fall back to a slug
    // derived from the provider name so the local `providerIcon` / `modelIcon`
    // switch in `utils.ts` can still resolve a bundled SVG.
    modelLogo:
      m.model_icon ||
      suppFiltered.modelLogo ||
      modelSlugFromId(m.id || m.label || '') ||
      (m.provider?.name ?? '').toLowerCase(),
    providerLogo:
      m.provider?.provider_icon ||
      suppFiltered.providerLogo ||
      (m.provider?.name ?? '').toLowerCase(),
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

/** Build a strictly-ascending, log-spaced set of tick values spanning [min, max]. */
function computeLogTickValues(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];

  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const raw = Array.from({ length: count }, (_, i) =>
    Math.round(Math.exp(logMin + ((logMax - logMin) * i) / (count - 1)))
  );
  raw[0] = min;
  raw[raw.length - 1] = max;

  // Dedup any ticks that rounded to the same value, keeping strict ascent.
  return raw.filter((value, i) => i === 0 || value > raw[i - 1]);
}

/** Derive slider tick values for context length (K tokens) across a model list. */
export function getContextTickValues(models: Model[]): number[] {
  const values = models.map((m) => m.contextLengthK);
  if (values.length === 0) return [8, 32, 128, 256];

  const min = Math.min(...values);
  const max = Math.max(...values);
  return computeLogTickValues(min, max);
}

/** Derive slider tick values for parameter count (billions) across a model list. */
export function getParameterTickValues(models: Model[]): number[] {
  const values = models.map((m) => m.parametersB);
  if (values.length === 0) return [1, 8, 70, 1000];

  const min = Math.min(...values);
  const max = Math.max(...values);
  return computeLogTickValues(min, max);
}

/**
 * Move tags matching a pinned label to the front (in their original relative
 * order), leaving the rest in place. Returns the same array reference when
 * nothing would change.
 */
export function pinUseCaseTags<T extends { label: string }>(
  tags: T[],
  pinnedLabels: string[]
): T[] {
  if (pinnedLabels.length === 0) return tags;

  const pinnedSet = new Set(pinnedLabels);
  if (!tags.some((t) => pinnedSet.has(t.label))) return tags;

  const pinned = tags.filter((t) => pinnedSet.has(t.label));
  const rest = tags.filter((t) => !pinnedSet.has(t.label));
  return [...pinned, ...rest];
}
