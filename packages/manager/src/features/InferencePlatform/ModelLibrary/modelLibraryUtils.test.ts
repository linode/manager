import {
  applyModelFilters,
  applyModelSort,
  getInputModes,
  getLanguages,
  getOutputModes,
  getProviders,
  getUseCaseTags,
  mergeInferenceModel,
} from './modelLibraryUtils';

import type { Model, ModelFilterState } from './modelLibrary.types';
import type { InferenceModel } from '@linode/api-v4';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeInferenceModel = (
  overrides: Partial<InferenceModel> = {}
): InferenceModel => ({
  capabilities: ['chat', 'completion'],
  description: 'Test model description',
  id: 'unknown-model',
  label: 'Unknown Model',
  lifecycle_status: 'active',
  modalities: { input: ['text'], output: ['text'] },
  parameters: {
    context_window: 32768,
    max_output_tokens: 8192,
    parameter_count_billions: 8,
  },
  playground_available: true,
  provider: { id: 'test', name: 'Test' },
  regions: ['us-ord'],
  tags: [],
  type: 'text-generation',
  use_cases: [],
  ...overrides,
});

const makeModel = (overrides: Partial<Model> = {}): Model => ({
  contextLengthK: 0,
  description: '',
  descriptionShort: '',
  id: 'test-model',
  inputModes: [],
  isServerless: false,
  outputModes: [],
  parametersB: 0,
  playgroundAvailable: false,
  providerLogo: '',
  providerName: 'TestProvider',
  releasedAt: '',
  supportedLanguages: [],
  title: 'Test Model',
  updatedAt: '',
  useCaseTags: [],
  ...overrides,
});

const emptyFilters: ModelFilterState = {
  inputModes: [],
  isServerless: false,
  languages: [],
  maxContextLengthK: null,
  maxParametersB: null,
  minContextLengthK: 0,
  minParametersB: 0,
  outputModes: [],
  providerLabel: null,
  searchQuery: '',
  useCaseTags: [],
};

// ---------------------------------------------------------------------------
// mergeInferenceModel
// ---------------------------------------------------------------------------

describe('mergeInferenceModel', () => {
  it('falls back to safe defaults for an unknown model id', () => {
    const result = mergeInferenceModel(
      makeInferenceModel({ id: 'no-such-model', label: 'No Such Model' })
    );

    expect(result.id).toBe('no-such-model');
    // title comes from API label field
    expect(result.title).toBe('No Such Model');
    // providerName comes from API provider.name field
    expect(result.providerName).toBe('Test');
    expect(result.isServerless).toBe(false);
    // playgroundAvailable comes from API playground_available field
    expect(result.playgroundAvailable).toBe(true);
    // useCaseTags, inputModes, outputModes come from API
    expect(result.useCaseTags).toEqual([]);
    expect(result.inputModes).toEqual([{ description: '', label: 'Text' }]);
    expect(result.outputModes).toEqual([{ description: '', label: 'Text' }]);
  });

  it('maps playground_available from API correctly', () => {
    const resultTrue = mergeInferenceModel(
      makeInferenceModel({ playground_available: true })
    );
    expect(resultTrue.playgroundAvailable).toBe(true);

    const resultFalse = mergeInferenceModel(
      makeInferenceModel({ playground_available: false })
    );
    expect(resultFalse.playgroundAvailable).toBe(false);
  });

  it('uses API data for fields when no supplementary data exists', () => {
    const result = mergeInferenceModel(
      makeInferenceModel({
        description: 'A test model',
        id: 'new-model-from-api',
        label: 'New Model',
        modalities: { input: ['text', 'image'], output: ['text'] },
        parameters: {
          context_window: 65536,
          max_output_tokens: 8192,
          parameter_count_billions: 12,
        },
        provider: { id: 'acme', name: 'Acme Corp' },
        use_cases: ['coding', 'general'],
      })
    );

    expect(result.id).toBe('new-model-from-api');
    expect(result.title).toBe('New Model');
    expect(result.description).toBe('A test model');
    expect(result.providerName).toBe('Acme Corp');
    expect(result.contextLengthK).toBe(66); // 65536 / 1000 rounded
    expect(result.parametersB).toBe(12);
    expect(result.inputModes).toEqual([
      { description: '', label: 'Text' },
      { description: '', label: 'Image' },
    ]);
    expect(result.outputModes).toEqual([{ description: '', label: 'Text' }]);
    expect(result.useCaseTags).toEqual([
      {
        description: 'Code generation, completion, and programming assistance',
        label: 'Coding',
      },
      {
        description: 'General-purpose text generation and conversation',
        label: 'General',
      },
    ]);
  });

  it('always uses the id from the InferenceModel, not supplementary data', () => {
    // gemma-4-26b-a4b-it is a real key in MODEL_SUPPLEMENTARY
    const result = mergeInferenceModel(
      makeInferenceModel({ id: 'gemma-4-26b-a4b-it' })
    );

    expect(result.id).toBe('gemma-4-26b-a4b-it');
  });

  it('enriches a known model id with supplementary metadata', () => {
    const result = mergeInferenceModel(
      makeInferenceModel({ id: 'gemma-4-26b-a4b-it' })
    );

    expect(result.providerName).not.toBe('Unknown');
    expect(result.useCaseTags.length).toBeGreaterThan(0);
    expect(result.descriptionShort).not.toBe('');
  });
});

// ---------------------------------------------------------------------------
// applyModelFilters — search
// ---------------------------------------------------------------------------

describe('applyModelFilters — searchQuery', () => {
  const models = [
    makeModel({ id: '1', title: 'Gemma', providerName: 'Google' }),
    makeModel({ id: '2', title: 'Llama', providerName: 'Meta' }),
    makeModel({
      id: '3',
      title: 'Qwen',
      providerName: 'Alibaba',
      useCaseTags: [{ label: 'Reranking', description: '' }],
    }),
  ];

  it('returns all models when searchQuery is empty', () => {
    expect(applyModelFilters(models, emptyFilters)).toHaveLength(3);
  });

  it('filters by title (case-insensitive)', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'gemma',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by providerName (case-insensitive)', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'meta',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by useCaseTag label', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'reranking',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('applies AND logic across comma-separated terms', () => {
    // "google, gemma" — both must match
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'google, gemma',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('applies AND logic across colon-separated terms', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'alibaba:reranking',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns no results when AND terms do not all match', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'gemma, meta',
    });
    expect(result).toHaveLength(0);
  });

  it('ignores empty tokens from trailing delimiters', () => {
    // "gemma," should behave like "gemma"
    const result = applyModelFilters(models, {
      ...emptyFilters,
      searchQuery: 'gemma,',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

// ---------------------------------------------------------------------------
// applyModelFilters — individual filters
// ---------------------------------------------------------------------------

describe('applyModelFilters — languages', () => {
  const models = [
    makeModel({ id: '1', supportedLanguages: ['en', 'fr'] }),
    makeModel({ id: '2', supportedLanguages: ['en'] }),
    makeModel({ id: '3', supportedLanguages: ['de'] }),
  ];

  it('returns all models when no languages are selected', () => {
    expect(applyModelFilters(models, emptyFilters)).toHaveLength(3);
  });

  it('keeps models that support all selected languages (AND logic)', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      languages: ['en', 'fr'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('excludes models missing any selected language', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      languages: ['de'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });
});

describe('applyModelFilters — provider', () => {
  const models = [
    makeModel({ id: '1', providerName: 'Google' }),
    makeModel({ id: '2', providerName: 'Meta' }),
  ];

  it('returns all models when providerLabel is null', () => {
    expect(applyModelFilters(models, emptyFilters)).toHaveLength(2);
  });

  it('filters to matching provider only', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      providerLabel: 'Meta',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('applyModelFilters — parameter range', () => {
  const models = [
    makeModel({ id: '1', parametersB: 3 }),
    makeModel({ id: '2', parametersB: 7 }),
    makeModel({ id: '3', parametersB: 70 }),
  ];

  it('applies minParametersB', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      minParametersB: 7,
    });
    expect(result.map((m) => m.id)).toEqual(['2', '3']);
  });

  it('applies maxParametersB', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      maxParametersB: 7,
    });
    expect(result.map((m) => m.id)).toEqual(['1', '2']);
  });

  it('applies both min and max as a range', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      minParametersB: 5,
      maxParametersB: 10,
    });
    expect(result.map((m) => m.id)).toEqual(['2']);
  });

  it('does not apply upper bound when maxParametersB is null', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      minParametersB: 0,
      maxParametersB: null,
    });
    expect(result).toHaveLength(3);
  });
});

describe('applyModelFilters — context length range', () => {
  const models = [
    makeModel({ id: '1', contextLengthK: 8 }),
    makeModel({ id: '2', contextLengthK: 32 }),
    makeModel({ id: '3', contextLengthK: 128 }),
  ];

  it('applies minContextLengthK', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      minContextLengthK: 32,
    });
    expect(result.map((m) => m.id)).toEqual(['2', '3']);
  });

  it('applies maxContextLengthK', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      maxContextLengthK: 32,
    });
    expect(result.map((m) => m.id)).toEqual(['1', '2']);
  });

  it('does not apply upper bound when maxContextLengthK is null', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      maxContextLengthK: null,
    });
    expect(result).toHaveLength(3);
  });
});

describe('applyModelFilters — input/output modes', () => {
  const models = [
    makeModel({
      id: '1',
      inputModes: [{ label: 'Text', description: '' }],
      outputModes: [{ label: 'Text', description: '' }],
    }),
    makeModel({
      id: '2',
      inputModes: [
        { label: 'Text', description: '' },
        { label: 'Image', description: '' },
      ],
      outputModes: [{ label: 'Text', description: '' }],
    }),
  ];

  it('filters by input mode (AND logic)', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      inputModes: ['Image'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by output mode (AND logic)', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      outputModes: ['Text'],
    });
    expect(result).toHaveLength(2);
  });

  it('excludes models missing a required input mode', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      inputModes: ['Text', 'Image'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('applyModelFilters — useCaseTags', () => {
  const models = [
    makeModel({
      id: '1',
      useCaseTags: [{ label: 'Coding', description: '' }],
    }),
    makeModel({
      id: '2',
      useCaseTags: [
        { label: 'Coding', description: '' },
        { label: 'Reranking', description: '' },
      ],
    }),
  ];

  it('filters by a single use-case tag', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      useCaseTags: ['Reranking'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('applies AND logic across multiple tags', () => {
    const result = applyModelFilters(models, {
      ...emptyFilters,
      useCaseTags: ['Coding', 'Reranking'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// applyModelSort
// ---------------------------------------------------------------------------

describe('applyModelSort', () => {
  const models = [
    makeModel({
      id: 'a',
      contextLengthK: 32,
      parametersB: 7,
      releasedAt: '2024-01-01',
      updatedAt: '2024-06-01',
    }),
    makeModel({
      id: 'b',
      contextLengthK: 8,
      parametersB: 70,
      releasedAt: '2025-03-01',
      updatedAt: '2024-01-01',
    }),
    makeModel({
      id: 'c',
      contextLengthK: 128,
      parametersB: 3,
      releasedAt: '2023-11-01',
      updatedAt: '2025-01-01',
    }),
  ];

  it('does not mutate the original array', () => {
    const original = [...models];
    applyModelSort(models, 'parameters_asc');
    expect(models).toEqual(original);
  });

  it('sorts by contextLength_asc', () => {
    const result = applyModelSort(models, 'contextLength_asc');
    expect(result.map((m) => m.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by contextLength_desc', () => {
    const result = applyModelSort(models, 'contextLength_desc');
    expect(result.map((m) => m.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts by parameters_asc', () => {
    const result = applyModelSort(models, 'parameters_asc');
    expect(result.map((m) => m.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts by parameters_desc', () => {
    const result = applyModelSort(models, 'parameters_desc');
    expect(result.map((m) => m.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by releaseDate_desc (newest first)', () => {
    const result = applyModelSort(models, 'releaseDate_desc');
    expect(result.map((m) => m.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by updateDate_desc (most recently updated first)', () => {
    const result = applyModelSort(models, 'updateDate_desc');
    expect(result.map((m) => m.id)).toEqual(['c', 'a', 'b']);
  });
});

// ---------------------------------------------------------------------------
// getProviders
// ---------------------------------------------------------------------------

describe('getProviders', () => {
  it('returns an empty array for empty input', () => {
    expect(getProviders([])).toEqual([]);
  });

  it('returns unique provider names sorted alphabetically', () => {
    const models = [
      makeModel({ providerName: 'Meta' }),
      makeModel({ providerName: 'Google' }),
      makeModel({ providerName: 'Meta' }),
    ];
    expect(getProviders(models)).toEqual(['Google', 'Meta']);
  });

  it('deduplicates providers that appear across multiple models', () => {
    const models = [
      makeModel({ providerName: 'Alibaba' }),
      makeModel({ providerName: 'Alibaba' }),
    ];
    expect(getProviders(models)).toEqual(['Alibaba']);
  });
});

// ---------------------------------------------------------------------------
// getLanguages
// ---------------------------------------------------------------------------

describe('getLanguages', () => {
  it('returns an empty array when all models have no supported languages', () => {
    expect(getLanguages([makeModel()])).toEqual([]);
  });

  it('flattens, deduplicates, and sorts languages across models', () => {
    const models = [
      makeModel({ supportedLanguages: ['French', 'English'] }),
      makeModel({ supportedLanguages: ['English', 'German'] }),
    ];
    expect(getLanguages(models)).toEqual(['English', 'French', 'German']);
  });

  it('handles models with empty supportedLanguages arrays', () => {
    const models = [
      makeModel({ supportedLanguages: [] }),
      makeModel({ supportedLanguages: ['Spanish'] }),
    ];
    expect(getLanguages(models)).toEqual(['Spanish']);
  });
});

// ---------------------------------------------------------------------------
// getInputModes
// ---------------------------------------------------------------------------

describe('getInputModes', () => {
  it('returns an empty array when no models have input modes', () => {
    expect(getInputModes([makeModel()])).toEqual([]);
  });

  it('flattens, deduplicates, and sorts input mode labels across models', () => {
    const models = [
      makeModel({
        inputModes: [
          { label: 'Text', description: '' },
          { label: 'Image', description: '' },
        ],
      }),
      makeModel({
        inputModes: [
          { label: 'Text', description: '' },
          { label: 'Video', description: '' },
        ],
      }),
    ];
    expect(getInputModes(models)).toEqual(['Image', 'Text', 'Video']);
  });
});

// ---------------------------------------------------------------------------
// getOutputModes
// ---------------------------------------------------------------------------

describe('getOutputModes', () => {
  it('returns an empty array when no models have output modes', () => {
    expect(getOutputModes([makeModel()])).toEqual([]);
  });

  it('flattens, deduplicates, and sorts output mode labels across models', () => {
    const models = [
      makeModel({ outputModes: [{ label: 'Text', description: '' }] }),
      makeModel({
        outputModes: [
          { label: 'Text', description: '' },
          { label: 'Image', description: '' },
        ],
      }),
    ];
    expect(getOutputModes(models)).toEqual(['Image', 'Text']);
  });
});

// ---------------------------------------------------------------------------
// getUseCaseTags
// ---------------------------------------------------------------------------

describe('getUseCaseTags', () => {
  it('returns an empty array when no models have use-case tags', () => {
    expect(getUseCaseTags([makeModel()])).toEqual([]);
  });

  it('flattens, deduplicates, and sorts tag labels across models', () => {
    const models = [
      makeModel({
        useCaseTags: [
          { label: 'Coding', description: '' },
          { label: 'AI Agent', description: '' },
        ],
      }),
      makeModel({
        useCaseTags: [
          { label: 'Coding', description: '' },
          { label: 'Reasoning', description: '' },
        ],
      }),
    ];
    expect(getUseCaseTags(models)).toEqual(['AI Agent', 'Coding', 'Reasoning']);
  });
});
