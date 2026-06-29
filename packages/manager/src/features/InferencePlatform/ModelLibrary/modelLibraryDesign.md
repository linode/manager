# Model Library — Implementation Design

## Overview

Replace the stub `ModelLibrary.tsx` component with a fully functional UI that matches the
`AI-Model_Library_Design_00.png` design. The design annotated in `AI-Model_Library_Design_01.png`
names four distinct areas, each of which maps to a React component.

---

## Component Hierarchy

```
ModelLibrary            ← top-level page component (replaces stub)
├── ModelFilter         ← search + parameter slider + provider dropdown + category chips
└── ModelList           ← responsive grid of cards
    └── ModelCard       ← single model entry (repeated)
```

All new components live inside
`packages/manager/src/features/InferencePlatform/ModelLibrary/`.

---

## New Files

| File | Purpose |
|---|---|
| `ModelLibrary.tsx` | Replaces stub; owns filter state and renders `ModelFilter` + `ModelList` |
| `ModelFilter.tsx` | Search input, parameters slider, provider dropdown, Serverless toggle chip, Languages dropdown |
| `ModelList.tsx` | Responsive 2-column grid; renders a `ModelCard` per model or skeletons while loading |
| `ModelCard.tsx` | Individual model card containing all model metadata |
| `modelLibrary.types.ts` | Shared TypeScript types for the feature |
| `modelLibraryUtils.ts` | `applyModelFilters()` and `applyModelSort()` helper functions |
| `modelLibrary.supplementary.ts` | Keyed-by-model-id supplementary metadata not returned by the Helix API |

---

## Data Types  (`modelLibrary.types.ts`)

```ts
export type ModelCapability = 'Chat' | 'Image' | 'Multi-modal' | 'Embeddings';

export interface Model {
  capabilities: ModelCapability[];
  categories: ModelCategory[];
  contextLengthK: number;         // e.g. 262.1 → displayed as "262.1 K"
  description: string;
  id: string;                     // e.g. 'gemma-4-31b'
  isServerless: boolean;
  parametersB: number;            // e.g. 33.7 → displayed as "33.7 B"
  supportedLanguages: string[];   // spoken languages, e.g. ['English', 'French', 'Chinese']
  priceInputPerMillion: number;   // USD
  priceOutputPerMillion: number;  // USD
  providerName: string;             // e.g. 'Google', 'OpenAI'
  providerLogo: string;           // the SVG logo name under packages/manager/src/assets/icons/ai/providers
  releasedAt: string;             // ISO 8601 date string, e.g. '2025-03-01'
  title: string;                  // e.g. 'Gemma 4 31B'
  updatedAt: string;              // ISO 8601 date string, e.g. '2025-11-14'
  useCaseTags: string[];          // e.g. ['AI Agents', 'Document Analysis']
}

export interface ModelFilterState {
  isServerless: boolean;          // true = show only serverless-provisioned models
  languages: string[];            // spoken languages to filter by; empty = show all
  maxParametersB: number | null;  // null = no upper bound (> 500B)
  minParametersB: number;
  providerLabel: string | null;   // null = All providers
  searchQuery: string;
}
```

---

## Data Sourcing Strategy

### Primary source — Helix `/v1/models`

The live model list is fetched on mount from the Helix endpoint (see
[Appendix A](#appendix-a--helix-models-endpoint)). Each entry in `data.data` provides:

| Helix field | Maps to `Model` field | Notes |
|---|---|---|
| `id` | `id` | e.g. `'qwen3-8b'` |
| `root` | — | Full HuggingFace path; used to derive `providerName` / `providerLogo` |
| `max_model_len` | `contextLengthK` | Divide by 1000, e.g. 8192 → 8.2 K |
| `owned_by` | — | Always `'vllm'` at present; not surfaced in the UI |
| `created` | `releasedAt` | Unix timestamp → ISO 8601 date string |

Embedding models are excluded with `.filter((m) => !m.id.includes('embedding'))`.

### Supplementary source — `modelLibrary.supplementary.ts`

The Helix API does not return the rich metadata required to fully populate a `ModelCard`.
A static lookup object keyed by model `id` supplies the missing fields:

```ts
// modelLibrary.supplementary.ts
export const MODEL_SUPPLEMENTARY: Record<string, Partial<Model>> = {
  'qwen3-8b': {
    capabilities: ['Chat'],
    description: 'Qwen3 8B is a high-efficiency instruction-tuned model from Alibaba.',
    isServerless: true,
    parametersB: 8,
    priceInputPerMillion: 0.10,
    priceOutputPerMillion: 0.30,
    providerLogo: 'alibaba',
    providerName: 'Alibaba',
    supportedLanguages: ['English', 'Chinese', 'French', 'Spanish'],
    updatedAt: '2025-11-01',
    useCaseTags: ['General Q&A', 'Coding', 'Chat'],
  },
  'qwen3-4b': { /* … */ },
  'gemma-4-26b-a4b-it': { /* … */ },
};
```

**Merge logic** (inside `ModelLibrary.tsx`):

```ts
const models: Model[] = helixModels.map((m) => ({
  ...MODEL_SUPPLEMENTARY[m.id],   // supplementary defaults first
  contextLengthK: m.max_model_len / 1000,
  id: m.id,
  releasedAt: new Date(m.created * 1000).toISOString().slice(0, 10),
  // updatedAt falls back to supplementary if present, otherwise releasedAt
  updatedAt: MODEL_SUPPLEMENTARY[m.id]?.updatedAt
    ?? new Date(m.created * 1000).toISOString().slice(0, 10),
  // Any Helix field can override the supplementary default
}));
```

If a model returned by Helix has no entry in `MODEL_SUPPLEMENTARY`, the card renders
with graceful fallbacks (empty description, no use-case tags, "Unknown" provider).
Adding a new model to the library only requires adding its entry to
`MODEL_SUPPLEMENTARY` — no other files need to change.

---

## Component Specifications

### `ModelLibrary.tsx`

**Responsibility:** owns `ModelFilterState`, derives the filtered model list, renders
`ModelFilter` and `ModelList` side-by-side or stacked.

**State:**
- `filterState: ModelFilterState` — initialised to show all models.
- `isLoading: boolean` — `true` while data is being fetched (used to show skeletons).

**Behaviour:**
- Fetch the model list from the Helix `/v1/models` endpoint on mount (see
  [Appendix A — Helix Models Endpoint](#appendix-a--helix-models-endpoint)). Map the
  response to `Model[]`, filtering out embedding models, then store in local state.
- While the fetch is in-flight set `isLoading: true` to trigger skeleton cards in
  `ModelList`.
- Pass the fetched (or mock) `Model[]` through `applyModelFilters()` from
  `modelLibraryUtils.ts`.
- Pass `onFilterChange` callback down to `ModelFilter`; pass derived `models` + `isLoading`
  to `ModelList`.

**Layout:** full-width `Stack` (vertical), `gap={2}`, no fixed height.

---

### `ModelFilter.tsx`

**Responsibility:** renders all controls used to narrow the model list and calls
`onFilterChange` whenever a control changes.

**Props:**
```ts
interface ModelFilterProps {
  filterState: ModelFilterState;
  languages: string[];   // union of all supportedLanguages across loaded models
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  providers: string[];   // unique provider labels for the dropdown
}
```

**Layout (top to bottom):**

1. **Top row** — three controls side-by-side:
   - **Search** — `TextField` from `@linode/ui` with a leading search icon, placeholder
     "Models, providers".  Updates `filterState.searchQuery` on every keystroke.
   - **Parameters slider** — MUI `Slider` (use `@mui/material/Slider`) rendered as a
     **range slider** (`value={[minParametersB, maxParametersB]}`). The slider has two
     thumbs allowing the user to set both a lower and upper parameter bound simultaneously.
     Step marks: `[0 (< 1B), 6, 12, 32, 128, 500 (> 500B)]`. A label above the slider
     displays the active range, e.g. `"12B – 128B"` (or `"> 500B"` when the upper thumb
     is at the maximum stop). Default state: both thumbs at the outermost positions
     (no filter applied). Changing either thumb updates `filterState.minParametersB`
     and/or `filterState.maxParametersB` accordingly. When the upper thumb is at the
     maximum stop, `maxParametersB` is set to `null` (no upper bound).
   - **Provider** — `Autocomplete` (or `Select`) from `@linode/ui` labelled "Provider",
     options derived from the `providers` prop plus an "All providers" entry.
     Updates `filterState.providerLabel`.

2. **Filter controls row** — `Stack direction="row"` with `gap={2}`, `alignItems="center"`:

   - **Serverless chip** — a single `Chip` from `@linode/ui` labelled "✦ Serverless".
     - When inactive (default): outlined variant.
     - When active: filled variant with `color="primary"`.
     - Clicking toggles `filterState.isServerless`. When `true`, only models where
       `model.isServerless === true` are shown.
     - Semantically this is a provisioning filter, not a category tag — it indicates the
       model is available via serverless infrastructure.

   - **Languages dropdown** — an `Autocomplete` (or `Select`) from `@linode/ui` labelled
     "Languages", `multiple` selection enabled.
     - Options are derived from the `languages` prop (the union of `supportedLanguages`
       across all loaded models), sorted alphabetically.
     - Placeholder: "All languages".
     - When one or more languages are selected, only models whose `supportedLanguages`
       array includes **all** selected languages (AND logic) are shown.
     - Updates `filterState.languages`.

---

### `ModelList.tsx`

**Responsibility:** renders the SortBy bar and 2-column responsive card grid.

**Props:**
```ts
type SortKey =
  | 'contextLength_desc'   // Biggest Context
  | 'contextLength_asc'    // Smallest Context
  | 'parameters_desc'      // Most Parameters
  | 'parameters_asc'       // Least Parameters
  | 'releaseDate_desc'     // Release Date
  | 'updateDate_desc';     // Update Date

interface ModelListProps {
  isLoading: boolean;
  models: Model[];
}
```

**State (internal):**
- `sortKey: SortKey` — defaults to `'parameters_desc'` (Most Parameters).

**Layout (top to bottom):**

1. **SortBy bar** — full-width `Stack direction="row"` with `justifyContent="flex-end"`
   and `alignItems="center"`, `mb={2}`:
   - Right-aligned: a `Select` (from `@linode/ui`) labelled "Sort by" with the following
     options, in this order:

     | Option label | `SortKey` value |
     |---|---|
     | Biggest Context | `contextLength_desc` |
     | Smallest Context | `contextLength_asc` |
     | Most Parameters | `parameters_desc` |
     | Least Parameters | `parameters_asc` |
     | Release Date | `releaseDate_desc` |
     | Update Date | `updateDate_desc` |

   - Changing the selection updates `sortKey` and immediately re-sorts the visible list.
   - The `Select` has a fixed `minWidth` of 180 px so the label does not shift layout.

2. **Card grid** — CSS Grid: `display: 'grid'`, `gridTemplateColumns: 'repeat(2, 1fr)'`,
   `gap: 2`.
   - Responsive: collapse to a single column on small viewports
     (`theme.breakpoints.down('sm')`).
   - While `isLoading` is `true`: render 4–6 `ModelCardSkeleton` placeholder elements
     matching the card dimensions.
   - Once loaded: render a `ModelCard` for every `Model` in the **sorted** `models` array.
   - If `models` is empty after filtering: render a centred "No models match your filters."
     `Typography` message (the SortBy bar is hidden in this state).

**Sort logic:**

Sorting is applied inside `ModelList` after the filtered `models` prop is received.
Use `applyModelSort()` from `modelLibraryUtils.ts`:

```ts
export function applyModelSort(models: Model[], sortKey: SortKey): Model[] {
  const sorted = [...models]; // never mutate the prop
  switch (sortKey) {
    case 'contextLength_desc': return sorted.sort((a, b) => b.contextLengthK - a.contextLengthK);
    case 'contextLength_asc':  return sorted.sort((a, b) => a.contextLengthK - b.contextLengthK);
    case 'parameters_desc':    return sorted.sort((a, b) => b.parametersB - a.parametersB);
    case 'parameters_asc':     return sorted.sort((a, b) => a.parametersB - b.parametersB);
    case 'releaseDate_desc':   return sorted.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    case 'updateDate_desc':    return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}
```

> **Note:** `releasedAt` and `updatedAt` (ISO 8601 date strings) must be added to the
> `Model` type and populated in `modelLibrary.mock.ts`.

---

### `ModelCard.tsx`

**Responsibility:** displays all metadata for a single model.

**Props:**
```ts
interface ModelCardProps {
  model: Model;
}
```

**Internal layout (top to bottom inside a `Paper` with `p={2}`):**

1. **Header row** (`Stack direction="row"`, `justifyContent="space-between"`,
   `alignItems="flex-start"`):
   - Left: provider logo (`<img>` 32×32, fallback to initials `Avatar`) + model title
     (`Typography variant="h3"`) + provider label (`Typography variant="body2"`).
   - Right: "Playground →" as a `Link` (React Router / `@linode/ui`) navigating to
     `/inference-platform/model-playground?model={model.id}`.

2. **Description** — `Typography variant="body2"` with `sx={{ my: 1 }}`.

3. **Use-case tags** — `Stack direction="row"` wrapping `Chip` components (outlined, small),
   one per entry in `model.useCaseTags`.

4. **Stats row** — two adjacent bordered boxes:
   - "{model.parametersB} B Parameters"
   - "{model.contextLengthK} K Context Length"
   Implemented as a `Stack direction="row"` with two `Box` children each having a light
   border and `px={2} py={1}` padding.

5. **Pricing** — `Typography variant="body2"`:
   `Price: <strong>${priceInputPerMillion} input / ${priceOutputPerMillion} output</strong>
   per 1 million tokens`

6. **Footer row** (`Stack direction="row"`, `justifyContent="space-between"`,
   `alignItems="center"`):
   - Left: capability `Chip` row — one filled `Chip` per `model.capabilities` entry.
   - Right: "✦ Serverless" `Chip` rendered only when `model.isServerless === true`.

---

### `ModelCardSkeleton` (inside `ModelCard.tsx` or a separate file)

A simplified version of `ModelCard` that uses MUI `Skeleton` elements matching the
approximate heights of each content section. Shown in `ModelList` while data loads.

---

## Filter Logic  (`modelLibraryUtils.ts`)

```ts
export function applyModelFilters(
  models: Model[],
  filters: ModelFilterState
): Model[] {
  // 1. searchQuery   — case-insensitive substring match on title + providerName
  // 2. isServerless  — if true, only include models where model.isServerless === true
  // 3. languages     — model.supportedLanguages must include ALL selected languages
  //                    (AND logic); empty array → show all
  // 4. providerLabel — exact match; null → show all
  // 5. parametersB range — minParametersB <= model.parametersB <= maxParametersB
  //                        (maxParametersB null = no upper bound)
}
```

---

## Navigation Integration

`ModelCard` uses the existing React Router / TanStack Router infrastructure already in
place. The "Playground →" link passes `?model={model.id}` as a search param so
`ModelPlayground` can pre-select the model.

No changes to `InferencePlatform.tsx` tab structure are required.

---

## Styling Approach

- Use `@linode/ui` primitives (`Box`, `Stack`, `Paper`, `Chip`, `Typography`, `TextField`,
  `Autocomplete`) wherever available — consistent with the rest of the InferencePlatform
  feature.
- MUI `Slider` can be imported directly from `@mui/material` for the parameters range
  control (no equivalent exists in `@linode/ui`).
- Avoid hard-coded pixel values; use `theme.spacing` and `theme.breakpoints`.
- Cards have a visible border (`Paper` with `variant="outlined"`) and subtle hover shadow
  (`sx={{ '&:hover': { boxShadow: 3 } }}`).

---

## Implementation Order

1. **`modelLibrary.types.ts`** — define all types; no dependencies.
2. **`modelLibrary.mock.ts`** — create mock model array using the new types.
3. **`modelLibraryUtils.ts`** — implement `applyModelFilters()` and `applyModelSort()` with unit tests.
4. **`ModelCard.tsx`** — build card including `ModelCardSkeleton`; can be dev'd in isolation.
5. **`ModelList.tsx`** — grid wrapper; depends on `ModelCard`.
6. **`ModelFilter.tsx`** — filter controls; depends on types and mock provider list.
7. **`ModelLibrary.tsx`** — wire everything together; replace stub.

---

## Out of Scope (Future Work)

- React Query hook (`useModels`) wrapping the Helix fetch.
- "Languages" sub-menu chip expansion.
- Server-side filtering / pagination for large model catalogues.
- Model detail drawer / page.
- Favouriting / bookmarking models.

---

## Appendix A — Helix Models Endpoint

### Base URL

The Helix server runs locally on port **8080** (proxied as `/v1` in the dev environment).

### GET /v1/models

Returns the list of models currently loaded on the Helix vLLM server.

#### Request

```
GET http://localhost:8080/v1/models
Authorization: Bearer helix001
Content-Type: application/json
```

As used in `ModelSelector.tsx` (via the dev proxy):

```ts
const response = await fetch('/v1/models', {
  headers: {
    Authorization: 'Bearer helix001',
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
const models = data.data; // HelixModel[]
```

#### Response shape

```jsonc
{
  "object": "list",
  "data": [
    {
      "id": "qwen3-8b",
      "object": "model",
      "created": 1778506342,
      "owned_by": "vllm",
      "root": "Qwen/Qwen3-8B",
      "max_model_len": 8192
    }
    // …
  ]
}
```

#### Currently available models

| `id` | `root` (full HuggingFace name) | Max context |
|---|---|---|
| `qwen3-8b` | Qwen/Qwen3-8B | 8,192 tokens |
| `qwen3-4b` | Qwen/Qwen3-4B-Instruct-2507 | 8,192 tokens |
| `qwen3-embedding-4b` | Qwen/Qwen3-Embedding-4B | 8,192 tokens |
| `gemma-4-26b-a4b-it` | google/gemma-4-26B-A4B-it | 100,000 tokens |

> **Note:** Filter out embedding models with `.filter((m) => !m.id.includes('embedding'))`,
> leaving three chat-capable models for display in the library.

#### Constants (shared with `ModelSelector.tsx` / `ModelPlaygroundProvider.tsx`)

```ts
const HELIX_MODELS_URL = '/v1/models';
const HELIX_API_KEY   = 'helix001';
```
