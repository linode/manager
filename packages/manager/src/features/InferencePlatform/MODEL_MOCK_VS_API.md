# Model objects: MSW mock data vs. direct APIv4

This document compares the **Model** objects the app receives when **Mock Service
Workers (MSW) are active with the mocked Model Library preset enabled** against
the **data returned directly by APIv4** (`GET /v4beta/inference/models`), and
lists every **new property that only exists in the mocked branch data**.

> **Note on methodology.** The live endpoint
> `https://api.linode.com/v4beta/inference/models` requires an authenticated
> token (an unauthenticated request returns `401 { "reason": "Invalid Token" }`),
> so the "direct from APIv4" reference below is the authoritative in-repo API
> contract — the `InferenceModel` interface in
> `packages/api-v4/src/inferencePlatform/types.ts` — plus the runtime merge logic
> in `mergeInferenceModel()`. That merge function is where the branch injects
> mock-only fields.

---

## 1. Data flow

```
GET /v4beta/inference/models
        │  (InferenceModel[])  ← "direct from APIv4"
        ▼
mergeInferenceModel(m)                       modelLibraryUtils.ts
        │  + MODEL_SUPPLEMENTARY[m.id]        (only when import.meta.env.DEV)
        │  + INFERENCE_MODEL_STUBS            (models not yet returned by backend)
        ▼
   Model  ← rendered by ModelCard / ModelDetails
```

- With **MSW active + mocked Model Library**, `InferenceModel[]` comes from
  `mockModels` in `mocks/presets/crud/handlers/inferencePlatform.ts`.
- In **dev/mock mode only** (`import.meta.env.DEV`), each model is enriched with
  `MODEL_SUPPLEMENTARY` / `MODEL_SUPPLEMENTARY_EXTRA` before being rendered.
- In production against the real API, the supplementary block is skipped
  (`const supp = import.meta.env.DEV ? logoData : {}`) — only the provider logo
  is always taken from supplementary data.

---

## 2. Shape coming **direct from APIv4** (`InferenceModel`)

```json
{
  "capabilities": ["chat", "completion"],
  "description": "Alibaba's 8B open-weights model with 128K context…",
  "id": "qwen3-8b",
  "label": "Qwen3 8B",
  "lifecycle_status": "beta",
  "modalities": {
    "input": ["text"],
    "output": ["text"]
  },
  "parameters": {
    "context_window": 131072,
    "max_output_tokens": 8192,
    "parameter_count_billions": 8
  },
  "playground_available": true,
  "price_per_million_tokens": {
    "input": 0.06,
    "output": 0.18
  },
  "provider": {
    "id": "qwen",
    "name": "Qwen"
  },
  "regions": ["us-ord", "us-sea"],
  "tags": ["instruction-tuned", "thinking", "multilingual", "long-context"],
  "type": "text-generation",
  "use_cases": ["chatbots", "content-generation", "reasoning", "coding", "long-context"]
}
```

---

## 3. New properties mocked in this branch

There are **three categories** of "new" data introduced on this branch.

### 3a. New field added to the APIv4 type contract

| Property | Type | Status |
| --- | --- | --- |
| `price_per_million_tokens.cached` | `number` (optional) | Added to the `InferenceModel` interface on this branch. **Not populated** in the MSW `mockModels` yet, and not returned by the current API — consumed via the fallback in `mergeInferenceModel` (`m.price_per_million_tokens?.cached ?? suppFiltered.priceInputCachedPerMillion`). |

```json
// InferenceModel — new optional field on this branch
{
  "price_per_million_tokens": {
    "cached": 0.075
  }
}
```

### 3b. Mock/supplementary-only fields on the rendered `Model`

These fields exist on the frontend `Model` view-model
(`ModelLibrary/modelLibrary.types.ts`) but are **not part of the APIv4
`InferenceModel` response**. They are injected from `MODEL_SUPPLEMENTARY`
**only when mocking/dev mode is active**.

| `Model` property | Type | Source | In APIv4? |
| --- | --- | --- | --- |
| `descriptionShort` | `string` | supplementary | ❌ mock-only |
| `descriptionLong` | `string` (optional) | supplementary | ❌ mock-only |
| `highlights` | `ModelHighlight[]` (optional) | supplementary | ❌ mock-only |
| `isServerless` | `boolean` | supplementary | ❌ mock-only |
| `modelLogo` | `string` (optional) | supplementary | ❌ mock-only |
| `providerLogo` | `string` | supplementary (always, even in prod) | ❌ mock-only |
| `releasedAt` | `string` (date) | supplementary | ❌ mock-only |
| `updatedAt` | `string` (date) | supplementary | ❌ mock-only |
| `supportedLanguages` | `string[]` | supplementary | ❌ mock-only |
| `priceInputCachedPerMillion` | `number` (optional) | new API field (3a) or supplementary | ⚠️ API field exists but unpopulated |
| `inputModes[].description` | `string` | supplementary descriptions | ⚠️ label derived from API `modalities`, descriptions are mock-only |
| `outputModes[].description` | `string` | supplementary descriptions | ⚠️ label derived from API `modalities`, descriptions are mock-only |
| `useCaseTags[].description` | `string` | supplementary / `USE_CASE_DESCRIPTIONS` | ⚠️ label derived from API `use_cases`, descriptions are mock-only |

> Fields such as `contextLengthK`, `parametersB`, `playgroundAvailable`,
> `providerName`, `title`, `priceInputPerMillion`, `priceOutputPerMillion`, and
> the `label` half of `inputModes`/`outputModes`/`useCaseTags` are **derived
> transforms of real API fields**, not new mock data.

#### Shape of the supplementary block (`MODEL_SUPPLEMENTARY[id]`)

```json
{
  "descriptionShort": "Elite reasoning and native vision with a 100K context window…",
  "descriptionLong": "Gemma 4 26B A4B is Google DeepMind's open Mixture-of-Experts model…",
  "highlights": [
    {
      "title": "Efficient Mixture-of-Experts (MoE) Architecture",
      "text": "Activates just 3.8B of its 25.2B total parameters during inference…"
    }
  ],
  "isServerless": true,
  "modelLogo": "gemma4",
  "providerLogo": "Google",
  "providerName": "Google",
  "releasedAt": "2026-04-02",
  "updatedAt": "2025-04-10",
  "supportedLanguages": ["Afrikaans", "Arabic", "Armenian", "..."],
  "priceInputCachedPerMillion": 0.1,
  "inputModes": [
    { "label": "Text", "description": "Natural language prompts, instructions, and context" },
    { "label": "Image", "description": "Static image inputs for visual understanding…" }
  ],
  "outputModes": [
    { "label": "Text", "description": "Natural language responses, code, and structured text outputs" }
  ],
  "useCaseTags": [
    { "label": "Multimodal Analysis", "description": "Reading large PDFs with images/charts…" }
  ]
}
```

#### Fully merged `Model` object (what the UI renders in mock mode)

Lines in **green (`+`)** are mock/supplementary-only properties added on this
branch; unprefixed lines are derived from real APIv4 fields.

```diff
  {
    "id": "gemma-4-26b-a4b-it",
    "title": "Gemma 4 26B",
    "description": "Google DeepMind's open MoE model with 3.8B active params…",
+   "descriptionShort": "Elite reasoning and native vision with a 100K context window…",
+   "descriptionLong": "Gemma 4 26B A4B is Google DeepMind's open Mixture-of-Experts model…",
+   "highlights": [
+     { "title": "Efficient Mixture-of-Experts (MoE) Architecture", "text": "Activates just 3.8B…" }
+   ],
    "contextLengthK": 262,
    "parametersB": 26,
+   "isServerless": true,
    "playgroundAvailable": true,
+   "modelLogo": "gemma4",
+   "providerLogo": "Google",
    "providerName": "Google",
    "priceInputPerMillion": 0.2,
    "priceOutputPerMillion": 0.5,
+   "priceInputCachedPerMillion": 0.1,
+   "releasedAt": "2026-04-02",
+   "updatedAt": "2025-04-10",
+   "supportedLanguages": ["Afrikaans", "Arabic", "..."],
    "inputModes": [
+     { "label": "Text", "description": "Natural language prompts, instructions, and context" },
+     { "label": "Image", "description": "Static image inputs for visual understanding…" }
    ],
    "outputModes": [
+     { "label": "Text", "description": "Natural language responses, code, and structured text outputs" }
    ],
    "useCaseTags": [
+     { "label": "Multimodal Analysis", "description": "Reading large PDFs with images/charts…" }
    ]
  }
```

### 3c. Injected stub models (not returned by the backend)

`INFERENCE_MODEL_STUBS` in `modelLibraryUtils.ts` injects whole model entries
that the API does not return yet, so the Library shows them in mock/dev mode:

| Injected model `id` | `label` |
| --- | --- |
| `gpt-oss-120b` | GPT-OSS 120B |
| `kimi-k2.6` | Kimi K2.6 |

```json
// INFERENCE_MODEL_STUBS[0] — a full InferenceModel injected client-side
{
  "capabilities": ["chat", "completion"],
  "description": "OpenAI's gpt-oss-120b is an open-weight mixture-of-experts reasoning model.",
  "id": "gpt-oss-120b",
  "label": "GPT-OSS 120B",
  "lifecycle_status": "active",
  "modalities": { "input": ["text"], "output": ["text"] },
  "parameters": { "context_window": 131072, "max_output_tokens": 16384, "parameter_count_billions": 120 },
  "playground_available": true,
  "provider": { "id": "openai", "name": "OpenAI" },
  "regions": ["us-ord"],
  "tags": [],
  "type": "text-generation",
  "use_cases": ["general", "coding", "reasoning"]
}
```

---

## 4. Summary

- **Only one new field was added to the APIv4 contract on this branch:**
  `price_per_million_tokens.cached` (optional, currently unpopulated in mocks and
  the live API).
- **Everything else that is "new" in mock mode is presentation metadata** injected
  by `MODEL_SUPPLEMENTARY` / `MODEL_SUPPLEMENTARY_EXTRA` and only merged in when
  `import.meta.env.DEV` is true: `descriptionShort`, `descriptionLong`,
  `highlights`, `isServerless`, `modelLogo`, `providerLogo`, `releasedAt`,
  `updatedAt`, `supportedLanguages`, `priceInputCachedPerMillion`, and the
  `description` text on `inputModes` / `outputModes` / `useCaseTags`.
- **Two entire models** (`gpt-oss-120b`, `kimi-k2.6`) are injected client-side and
  are not part of the API response.

### Source references

| Concern | File |
| --- | --- |
| APIv4 model type | `packages/api-v4/src/inferencePlatform/types.ts` |
| APIv4 request | `packages/api-v4/src/inferencePlatform/inferencePlatform.ts` |
| MSW mock models | `packages/manager/src/mocks/presets/crud/handlers/inferencePlatform.ts` |
| Merge / injection logic | `packages/manager/src/features/InferencePlatform/ModelLibrary/modelLibraryUtils.ts` |
| Supplementary metadata | `packages/manager/src/features/InferencePlatform/ModelLibrary/modelLibrary.supplementary.ts` |
| Extra supplementary + stubs | `packages/manager/src/features/InferencePlatform/ModelLibrary/modelLibrary.supplementary-EXTRA.ts` |
| Frontend `Model` view-model | `packages/manager/src/features/InferencePlatform/ModelLibrary/modelLibrary.types.ts` |

---

## 5. Model features not yet represented as data

The **Model details** panel (`ModelDetails/ModelSpecs/ModelSpecs.tsx`) currently
renders two capability rows — **Thinking Effort** (`"3 modes"`) and **Function
Calling** (`"Supported"`) — as **hardcoded static copy**, backed by no property on
`InferenceModel` or `Model`. **Deployment** (serverless/dedicated) is coded but
commented out.

Reviewing the product/model pages of the models we serve
(gpt-oss-120b, Qwen3, Llama 3.3, DeepSeek R1, Gemma, Kimi, Nemotron, GLM), the
following are **features those pages advertise but our Model details page does not
model as data** (function calling included for completeness).

### 5a. Capability features (booleans / small enums)

| Feature | Advertised by (examples) | Current state | Proposed `InferenceModel` field | Proposed `Model` field |
| --- | --- | --- | --- | --- |
| Function calling / tool use | gpt-oss, Qwen3, Llama 3.3, Nemotron | hardcoded `"Supported"` | `supports_function_calling: boolean` | `supportsFunctionCalling` |
| Structured outputs / JSON mode | gpt-oss, Qwen3 | not shown | `supports_structured_output: boolean` | `supportsStructuredOutput` |
| Reasoning / thinking (with modes) | gpt-oss (low/med/high), Qwen3 (think / no-think), DeepSeek R1 | hardcoded `"3 modes"` | `reasoning: { supported: boolean; modes: string[] }` | `reasoningModes: string[]` |
| Agentic tool use (web browse, code exec, MCP) | gpt-oss, Qwen3 | not shown | `supported_tools: string[]` | `agenticTools: string[]` |
| Streaming responses | all (OpenAI-compatible) | not shown | `supports_streaming: boolean` | `supportsStreaming` |
| Fine-tuning | gpt-oss | not shown | `supports_fine_tuning: boolean` | `supportsFineTuning` |
| Vision / image understanding | Gemma, Kimi | via `modalities.input` only | *(covered by modalities)* | `inputModes` |

### 5b. Spec attributes the pages list that we omit

| Attribute | Advertised by (examples) | Current state | Proposed field |
| --- | --- | --- | --- |
| **Max output tokens** | all | **Already in API** (`parameters.max_output_tokens`) but **not rendered** | surface existing field |
| **Supported languages** | Qwen3 (119), Llama, Gemma | **Already in `Model.supportedLanguages`** but **not rendered on the specs panel** | surface existing field |
| **Deployment** (serverless / dedicated) | platform | **Already in `Model.isServerless`** but **row is commented out** | surface existing field |
| License | open models: Apache-2.0 (gpt-oss, Qwen3), Llama license, MIT | not shown | `license: string` → `license` |
| Knowledge cutoff | most | not shown | `knowledge_cutoff: string` → `knowledgeCutoff` |
| Active vs. total parameters (MoE) | gpt-oss (117B/5.1B), Gemma, DeepSeek, Kimi | only total shown | `parameters.active_parameter_count_billions` → `activeParametersB` |
| Quantization / precision | gpt-oss (MXFP4), FP8/BF16 | not shown | `quantization: string` → `quantization` |

### 5c. Proposed feature block (JSON shape)

Grouping the capability flags under a single `features` object keeps the
`InferenceModel` contract tidy and maps cleanly onto the specs panel:

```json
{
  "features": {
    "function_calling": true,
    "structured_output": true,
    "streaming": true,
    "fine_tuning": false,
    "reasoning": {
      "supported": true,
      "modes": ["low", "medium", "high"]
    },
    "tools": ["web_browsing", "code_execution", "mcp"]
  },
  "license": "apache-2.0",
  "knowledge_cutoff": "2024-06",
  "parameters": {
    "context_window": 131072,
    "max_output_tokens": 16384,
    "parameter_count_billions": 117,
    "active_parameter_count_billions": 5.1,
    "quantization": "MXFP4"
  }
}
```

> **Quick wins:** `max_output_tokens`, `supportedLanguages`, and `isServerless`
> already exist in the data pipeline — they only need to be surfaced in
> `ModelSpecs`. `function_calling` and `reasoning` are currently faked with static
> copy and should be promoted to real fields first.
