import { MODEL_SUPPLEMENTARY } from './modelLibrary.supplementary';

import type { InferenceModel } from '../inferenceService';
import type { Model, ModelFilterState, SortKey } from './modelLibrary.types';

/**
 * Merge a single InferenceModel entry with its supplementary metadata.
 * Supplementary fields fill in defaults; any field present in supplementary
 * overrides the default value.
 */
export function mergeInferenceModel(m: InferenceModel): Model {
  const supp = MODEL_SUPPLEMENTARY[m.id] ?? {};

  return {
    contextLengthK: 0,
    description: '',
    descriptionShort: '',
    inputModes: [],
    isServerless: false,
    outputModes: [],
    parametersB: 0,
    priceInputPerMillion: 0,
    priceOutputPerMillion: 0,
    providerLogo: '',
    providerName: 'Unknown',
    releasedAt: '',
    supportedLanguages: [],
    title: m.id,
    updatedAt: '',
    useCaseTags: [],
    ...supp,
    id: m.id,
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
