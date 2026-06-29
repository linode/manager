export interface ModelCapability {
  description: string;
  label: string;
}

export interface Model {
  contextLengthK: number;
  description: string;
  descriptionShort: string;
  id: string;
  inputModes: ModelCapability[];
  isServerless: boolean;
  outputModes: ModelCapability[];
  parametersB: number;
  priceInputPerMillion: number;
  priceOutputPerMillion: number;
  providerLogo: string;
  providerName: string;
  releasedAt: string;
  supportedLanguages: string[];
  title: string;
  updatedAt: string;
  useCaseTags: ModelCapability[];
}

export interface ModelFilterState {
  inputModes: string[];
  isServerless: boolean;
  languages: string[];
  maxContextLengthK: null | number;
  maxParametersB: null | number;
  minContextLengthK: number;
  minParametersB: number;
  outputModes: string[];
  providerLabel: null | string;
  searchQuery: string;
  useCaseTags: string[];
}

export type SortKey =
  | 'contextLength_asc'
  | 'contextLength_desc'
  | 'parameters_asc'
  | 'parameters_desc'
  | 'releaseDate_desc'
  | 'updateDate_desc';
