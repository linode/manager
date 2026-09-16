import type { InferenceModel, InferenceParameterDef } from '@linode/api-v4';

// Shared URLs / icons reused across mock model records.
const API_REF_URL =
  'https://techdocs.akamai.com/cloud-computing/reference/inference-api';
const DOCS_URL = 'https://techdocs.akamai.com/cloud-computing/docs/inference';
// Provider / model icon slugs. These are consumed by the `providerIcon` /
// `modelIcon` helpers in `src/features/InferencePlatform/utils.ts`, which
// switch on the slug and return the matching bundled SVG component.
// The real API is expected to return image URLs here; `InferenceLogo`
// renders `<img>` when the value is a URL and falls back to the local
// slug switch otherwise. Swap in a real URL below to exercise the URL path.
// Provider slugs (used for `provider.provider_icon`).
const QWEN_PROVIDER =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/qwen.svg';
const META_PROVIDER =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/meta.svg';
const GOOGLE_PROVIDER = 'google';
const DEEPSEEK_PROVIDER = 'deepseek';
const OPENAI_PROVIDER = `openai`;
const MOONSHOT_PROVIDER = 'moonshot';
const ZHIPUAI_PROVIDER =
  'https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/zhipu-color.svg';
const NVIDIA_PROVIDER =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nvidia.svg';

// Model-icon slugs (used for `model_icon`).
const QWEN_MODEL_ICON =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/qwen.svg';
const GEMMA_MODEL_ICON =
  'https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/gemma-color.svg';
const LLAMA_MODEL_ICON =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/meta.svg';
const DEEPSEEK_MODEL_ICON = 'deepseek';
const OPENAI_MODEL_ICON = 'openai';
const MOONSHOT_MODEL_ICON = 'moonshot';
const GLM_MODEL_ICON =
  'https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/zhipu-color.svg';
const NEMOTRON_MODEL_ICON =
  'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nvidia.svg';

// Per-million-token pricing rows. Each model gets distinct hourly prices
// (input / output / cached) roughly scaled by model size / capability tier.
const buildPrices = (
  input: number,
  output: number,
  cached: number
): InferenceModel['prices'] => [
  {
    id: 'price_per_million_tokens_input',
    label: 'Input',
    price: { hourly: input, monthly: null },
    region_prices: [],
    transfer: 0,
  },
  {
    id: 'price_per_million_tokens_output',
    label: 'Output',
    price: { hourly: output, monthly: null },
    region_prices: [],
    transfer: 0,
  },
  {
    id: 'price_per_million_tokens_cached',
    label: 'Cached',
    price: { hourly: cached, monthly: null },
    region_prices: [],
    transfer: 0,
  },
];

// Per-model price rows (hourly $ / 1M tokens).
const QWEN3_8B_PRICES = buildPrices(0.35, 0.55, 0.09);
const QWEN3_4B_PRICES = buildPrices(0.15, 0.28, 0.05);
const GEMMA_4_26B_PRICES = buildPrices(0.9, 2.7, 0.22);
const LLAMA_33_70B_PRICES = buildPrices(2.54, 14.25, 0.285);
const QWEN3_EMBEDDING_4B_PRICES = buildPrices(0.05, 0.5, 0.5);
const DEEPSEEK_R1_PRICES = buildPrices(3.2, 11.9, 0.4);
const LLAMA_31_70B_PRICES = buildPrices(2.1, 12.8, 0.24);
// Extra stub models — prices sourced from `modelLibrary.supplementary*.ts`.
const GPT_OSS_120B_PRICES = buildPrices(0.15, 0.6, 0.075);
const KIMI_K26_PRICES = buildPrices(2.5, 12.0, 1.25);
const KIMI_K3_PRICES = buildPrices(3.0, 15.0, 1.5);
const KIMI_K27_CODE_PRICES = buildPrices(2.8, 13.5, 1.4);
const DEEPSEEK_V4_FLASH_PRICES = buildPrices(0.44, 1.32, 0.22);
const DEEPSEEK_V4_PRO_PRICES = buildPrices(1.32, 3.96, 0.66);
const GLM_52_PRICES = buildPrices(1.11, 3.88, 0.56);
const NEMOTRON_ULTRA_253B_PRICES = buildPrices(0.4, 1.2, 0.2);

export const mockModels: InferenceModel[] = [
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2025-04-15T00:00:00Z',
    description:
      'Qwen3 8B is a powerful language model with strong reasoning capabilities and multilingual support.',
    documentation_url: DOCS_URL,
    id: 'qwen3-8b',
    label: 'Qwen3 8B',
    license: {
      attribution_required: false,
      commercial_use: true,
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 16,
      max_requests_per_minute: 300,
      max_tokens_per_minute: 120000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    model_icon: QWEN_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text:
            'Strong instruction-following performance for an 8B-class model.',
          title: 'Instruction Following',
        },
        {
          item_text:
            'Solid multilingual coverage across 29+ languages with a 32K context window.',
          title: 'Multilingual',
        },
      ],
      long_description:
        'Qwen3 8B is an open-weights chat model from the Qwen team. It offers a strong balance of quality and cost for general-purpose chat, RAG, and content generation workloads.',
    },
    parameters: {
      architecture: 'transformer',
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 8,
      precision: 'bf16',
      total_params: '8B',
    },
    performance: {
      benchmark_date: '2025-05-01',
      latency_p50_ms: 210,
      latency_p99_ms: 650,
      throughput_tokens_per_sec: 140,
      time_to_first_token_ms: 95,
    },
    playground_available: true,
    prices: QWEN3_8B_PRICES,
    provider: {
      id: 'qwen',
      name: 'Qwen',
      provider_icon: QWEN_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
      {
        capacity: 'medium',
        operational_status: 'operational',
        region: 'us-sea',
      },
    ],
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned'],
    type: 'text-generation',
    updated_at: '2025-05-01T00:00:00Z',
    use_cases: ['chatbots', 'content-generation'],
    version_info: {
      current_version: '3.0',
      deprecation_date: null,
      release_date: '2025-04-15',
      sunset_date: null,
      versions: ['2.5', '3.0'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2025-04-15T00:00:00Z',
    description:
      'Qwen3 4B is a compact yet capable model optimized for efficient inference.',
    documentation_url: DOCS_URL,
    id: 'qwen3-4b',
    label: 'Qwen3 4B',
    license: {
      attribution_required: false,
      commercial_use: true,
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 32,
      max_requests_per_minute: 600,
      max_tokens_per_minute: 240000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    model_icon: QWEN_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text: 'Low-latency responses ideal for chatbots at scale.',
          title: 'Fast & Efficient',
        },
        {
          item_text: 'Great cost-per-token for high-volume workloads.',
          title: 'Cost Effective',
        },
      ],
      long_description:
        'Qwen3 4B is a compact instruction-tuned model designed for efficient serving. It targets high-throughput, latency-sensitive workloads with reasonable quality.',
    },
    parameters: {
      architecture: 'transformer',
      context_window: 32768,
      max_output_tokens: 8192,
      parameter_count_billions: 4,
      precision: 'bf16',
      total_params: '4B',
    },
    performance: {
      benchmark_date: '2025-05-01',
      latency_p50_ms: 130,
      latency_p99_ms: 420,
      throughput_tokens_per_sec: 210,
      time_to_first_token_ms: 60,
    },
    playground_available: true,
    prices: QWEN3_4B_PRICES,
    provider: {
      id: 'qwen',
      name: 'Qwen',
      provider_icon: QWEN_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
      { capacity: 'high', operational_status: 'operational', region: 'us-sea' },
    ],
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned', 'efficient'],
    type: 'text-generation',
    updated_at: '2025-05-01T00:00:00Z',
    use_cases: ['chatbots', 'content-generation'],
    version_info: {
      current_version: '3.0',
      deprecation_date: null,
      release_date: '2025-04-15',
      sunset_date: null,
      versions: ['2.5', '3.0'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2025-03-10T00:00:00Z',
    description:
      "Google's Gemma 4 26B parameter instruction-tuned model with extended context window support up to 262K tokens.",
    documentation_url: DOCS_URL,
    id: 'gemma-4-26b-a4b-it',
    label: 'Gemma 4 26B A4B IT',
    license: {
      attribution_required: true,
      commercial_use: true,
      name: 'Gemma Terms of Use',
      url: 'https://ai.google.dev/gemma/terms',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 24,
      max_requests_per_minute: 400,
      max_tokens_per_minute: 160000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    model_icon: GEMMA_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text:
            '262K-token context window enables processing very long documents in a single request.',
          title: 'Long Context',
        },
        {
          item_text:
            'Instruction-tuned for high-quality responses across chat, summarization, and analysis tasks.',
          title: 'Instruction Following',
        },
      ],
      long_description:
        'Gemma 4 26B A4B IT is a Google-built instruction-tuned model featuring an extended 262K token context window. It excels at long-document reasoning, summarization, and multi-turn chat.',
    },
    parameters: {
      architecture: 'transformer',
      context_window: 262144,
      max_output_tokens: 8192,
      parameter_count_billions: 26,
      precision: 'bf16',
      total_params: '26B',
    },
    performance: {
      benchmark_date: '2025-05-01',
      latency_p50_ms: 320,
      latency_p99_ms: 980,
      throughput_tokens_per_sec: 105,
      time_to_first_token_ms: 140,
    },
    playground_available: true,
    prices: GEMMA_4_26B_PRICES,
    provider: {
      id: 'google',
      name: 'Google',
      provider_icon: GOOGLE_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
      {
        capacity: 'medium',
        operational_status: 'operational',
        region: 'us-sea',
      },
      {
        capacity: 'medium',
        operational_status: 'operational',
        region: 'eu-mil',
      },
    ],
    regions: ['us-ord', 'us-sea', 'eu-mil'],
    tags: ['instruction-tuned', 'long-context'],
    type: 'text-generation',
    updated_at: '2025-05-01T00:00:00Z',
    use_cases: ['chatbots', 'content-generation', 'long-context'],
    version_info: {
      current_version: '4.0',
      deprecation_date: null,
      release_date: '2025-03-10',
      sunset_date: null,
      versions: ['3.0', '4.0'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion', 'reasoning'],
    created_at: '2024-12-06T00:00:00Z',
    description:
      'Meta Llama 3.3 70B Instruct is a large language model optimized for instruction following and complex reasoning.',
    documentation_url: DOCS_URL,
    id: 'llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B Instruct',
    license: {
      attribution_required: true,
      commercial_use: true,
      name: 'Llama 3.3 Community License',
      url: 'https://llama.meta.com/llama3_3/license/',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 32,
      max_requests_per_minute: 600,
      max_tokens_per_minute: 200000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    model_icon: LLAMA_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text:
            'Improved instruction following and reasoning over Llama 3.1.',
          title: 'Enhanced Reasoning',
        },
        {
          item_text:
            'Strong multilingual performance across 8 supported languages.',
          title: 'Multilingual',
        },
      ],
      long_description:
        'Llama 3.3 70B Instruct is Meta\u2019s latest large open-weights instruction-tuned model, offering improved reasoning, coding, and multilingual capabilities over Llama 3.1.',
    },
    parameters: {
      architecture: 'transformer',
      context_window: 131072,
      max_output_tokens: 8192,
      parameter_count_billions: 70,
      precision: 'bf16',
      total_params: '70B',
    },
    performance: {
      benchmark_date: '2025-01-15',
      latency_p50_ms: 410,
      latency_p99_ms: 1320,
      throughput_tokens_per_sec: 88,
      time_to_first_token_ms: 175,
    },
    playground_available: true,
    prices: LLAMA_33_70B_PRICES,
    provider: {
      id: 'meta',
      name: 'Meta',
      provider_icon: META_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
      {
        capacity: 'medium',
        operational_status: 'operational',
        region: 'us-sea',
      },
    ],
    regions: ['us-ord', 'us-sea'],
    tags: ['instruction-tuned', 'large'],
    type: 'text-generation',
    updated_at: '2025-01-15T00:00:00Z',
    use_cases: ['chatbots', 'content-generation', 'reasoning'],
    version_info: {
      current_version: '3.3',
      deprecation_date: null,
      release_date: '2024-12-06',
      sunset_date: null,
      versions: ['3.0', '3.1', '3.3'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['embedding'],
    created_at: '2025-04-15T00:00:00Z',
    description:
      'Qwen3 Embedding 4B is optimized for generating high-quality text embeddings.',
    documentation_url: DOCS_URL,
    id: 'qwen3-embedding-4b',
    label: 'Qwen3 Embedding 4B',
    license: {
      attribution_required: false,
      commercial_use: true,
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 64,
      max_requests_per_minute: 1200,
      max_tokens_per_minute: 500000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['embedding'],
    },
    model_icon: QWEN_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text:
            'High-quality dense embeddings suitable for semantic search and RAG pipelines.',
          title: 'Semantic Search',
        },
        {
          item_text: 'Optimized for high-throughput batch embedding workloads.',
          title: 'High Throughput',
        },
      ],
      long_description:
        'Qwen3 Embedding 4B produces dense vector representations of text, designed for semantic search, clustering, and retrieval-augmented generation.',
    },
    parameters: {
      architecture: 'transformer',
      context_window: 8192,
      max_output_tokens: 0,
      parameter_count_billions: 4,
      precision: 'bf16',
      total_params: '4B',
    },
    performance: {
      benchmark_date: '2025-05-01',
      latency_p50_ms: 45,
      latency_p99_ms: 180,
      throughput_tokens_per_sec: 900,
      time_to_first_token_ms: 30,
    },
    playground_available: false,
    prices: QWEN3_EMBEDDING_4B_PRICES,
    provider: {
      id: 'qwen',
      name: 'Qwen',
      provider_icon: QWEN_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['embedding'],
    type: 'embedding',
    updated_at: '2025-05-01T00:00:00Z',
    use_cases: ['semantic-search', 'rag'],
    version_info: {
      current_version: '3.0',
      deprecation_date: null,
      release_date: '2025-04-15',
      sunset_date: null,
      versions: ['2.5', '3.0'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion', 'reasoning'],
    created_at: '2025-05-28T00:00:00Z',
    description:
      'DeepSeek R1 is a reasoning-focused model with strong performance on complex tasks.',
    documentation_url: DOCS_URL,
    id: 'deepseek-r1-0528',
    label: 'DeepSeek R1',
    license: {
      attribution_required: true,
      commercial_use: true,
      name: 'DeepSeek License',
      url: 'https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 24,
      max_requests_per_minute: 400,
      max_tokens_per_minute: 150000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    model_icon: DEEPSEEK_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text:
            'Specialized for chain-of-thought reasoning across math, science, and code.',
          title: 'Reasoning Focused',
        },
        {
          item_text:
            'Strong performance on competitive coding and math benchmarks.',
          title: 'Code & Math',
        },
      ],
      long_description:
        'DeepSeek R1 is a reasoning-focused open-weights model optimized for complex multi-step problem solving, code generation, and mathematical reasoning.',
    },
    parameters: {
      architecture: 'mixture-of-experts',
      context_window: 65536,
      max_output_tokens: 8192,
      parameter_count_billions: 67,
      precision: 'bf16',
      total_params: '67B',
    },
    performance: {
      benchmark_date: '2025-06-01',
      latency_p50_ms: 480,
      latency_p99_ms: 1500,
      throughput_tokens_per_sec: 75,
      time_to_first_token_ms: 200,
    },
    playground_available: true,
    prices: DEEPSEEK_R1_PRICES,
    provider: {
      id: 'deepseek',
      name: 'DeepSeek',
      provider_icon: DEEPSEEK_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
      {
        capacity: 'medium',
        operational_status: 'operational',
        region: 'us-sea',
      },
    ],
    regions: ['us-ord', 'us-sea'],
    tags: ['reasoning'],
    type: 'text-generation',
    updated_at: '2025-06-01T00:00:00Z',
    use_cases: ['reasoning', 'code-generation'],
    version_info: {
      current_version: '2025-05-28',
      deprecation_date: null,
      release_date: '2025-05-28',
      sunset_date: null,
      versions: ['2025-01-20', '2025-05-28'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion', 'reasoning'],
    created_at: '2024-07-23T00:00:00Z',
    description:
      'Meta Llama 3.1 70B Instruct is a state-of-the-art instruction-tuned model with strong reasoning and multilingual capabilities.',
    documentation_url: DOCS_URL,
    id: 'llama-3.1-70b-instruct',
    label: 'Llama 3.1 70B Instruct',
    license: {
      attribution_required: true,
      commercial_use: true,
      name: 'Llama 3.1 Community License',
      url: 'https://llama.meta.com/llama3_1/license/',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 32,
      max_requests_per_minute: 600,
      max_tokens_per_minute: 200000,
      max_tokens_per_request: 8192,
    },
    modalities: {
      input: ['text'],
      output: ['text'],
    },
    model_icon: LLAMA_MODEL_ICON,
    more_info: {
      highlights: [
        {
          item_text:
            'Instruction-tuned for helpful, safe responses across a wide range of tasks.',
          title: 'Instruction Following',
        },
        {
          item_text:
            'Strong "Thinking" and reasoning performance, with an optional "thinking mode" prompt pattern for chain-of-thought style outputs.',
          title: 'Reasoning',
        },
        {
          item_text:
            'Supports 8 languages including English, Spanish, and German.',
          title: 'Multilingual',
        },
      ],
      long_description:
        'Llama 3.1 70B Instruct is Meta\u2019s open weights flagship instruction-tuned model. It offers strong general-purpose reasoning, coding, and multilingual capabilities, with a 128K token context window suitable for long documents and multi-turn conversations.',
    },
    parameters: {
      architecture: 'transformer',
      context_window: 131072,
      max_output_tokens: 8192,
      parameter_count_billions: 70,
      precision: 'bf16',
      total_params: '70B',
    },
    performance: {
      benchmark_date: '2024-10-01',
      latency_p50_ms: 420,
      latency_p99_ms: 1350,
      throughput_tokens_per_sec: 85,
      time_to_first_token_ms: 180,
    },
    playground_available: true,
    prices: LLAMA_31_70B_PRICES,
    provider: {
      id: 'meta',
      name: 'Meta',
      provider_icon: META_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
      {
        capacity: 'medium',
        operational_status: 'operational',
        region: 'us-sea',
      },
      { capacity: 'low', operational_status: 'degraded', region: 'eu-mil' },
    ],
    regions: ['us-ord', 'us-sea', 'eu-mil'],
    tags: ['instruction-tuned', 'large', 'reasoning'],
    type: 'text-generation',
    updated_at: '2024-10-01T00:00:00Z',
    use_cases: [
      'chatbots',
      'content-generation',
      'reasoning',
      'code-generation',
    ],
    version_info: {
      current_version: '3.1',
      deprecation_date: null,
      release_date: '2024-07-23',
      sunset_date: null,
      versions: ['3.0', '3.1'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2025-08-05T00:00:00Z',
    description:
      "OpenAI's open-weight 117B MoE reasoning model with 128K context and configurable reasoning effort.",
    documentation_url: DOCS_URL,
    id: 'gpt-oss-120b',
    label: 'GPT-OSS 120B',
    license: {
      attribution_required: false,
      commercial_use: true,
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 8,
      max_requests_per_minute: 120,
      max_tokens_per_minute: 200000,
      max_tokens_per_request: 16384,
    },
    modalities: { input: ['text'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            'Open-weight 117B MoE (5.1B active) reasoning model with configurable reasoning effort.',
          title: 'Reasoning Effort',
        },
        {
          item_text:
            'Native tool use — web browsing, Python execution, function calling — and Structured Outputs.',
          title: 'Agentic Tool Use',
        },
      ],
      long_description:
        'gpt-oss-120b is an open-weight mixture-of-experts reasoning model trained via large-scale RL and distillation. Near-parity with o4-mini on reasoning benchmarks while running on a single 80 GB GPU.',
    },
    parameters: {
      architecture: 'moe',
      context_window: 131072,
      max_output_tokens: 16384,
      parameter_count_billions: 117,
      precision: 'bf16',
      total_params: '117B',
    },
    performance: {
      benchmark_date: '2025-08-05',
      latency_p50_ms: 320,
      latency_p99_ms: 950,
      throughput_tokens_per_sec: 110,
      time_to_first_token_ms: 150,
    },
    playground_available: true,
    prices: GPT_OSS_120B_PRICES,
    model_icon: OPENAI_MODEL_ICON,
    provider: {
      id: 'openai',
      name: 'OpenAI',
      provider_icon: OPENAI_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['reasoning', 'moe', 'open-weight'],
    type: 'text-generation',
    updated_at: '2025-08-05T00:00:00Z',
    use_cases: ['general', 'coding', 'reasoning'],
    version_info: {
      current_version: '1.0',
      deprecation_date: null,
      release_date: '2025-08-05',
      sunset_date: null,
      versions: ['1.0'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2026-04-10T00:00:00Z',
    description: "Moonshot AI's large-scale reasoning model with 256K context.",
    documentation_url: DOCS_URL,
    id: 'kimi-k2.6',
    label: 'Kimi K2.6',
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 4,
      max_requests_per_minute: 60,
      max_tokens_per_minute: 200000,
      max_tokens_per_request: 16384,
    },
    modalities: { input: ['text'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            'Large-scale reasoning model with strong long-horizon planning and analytical capability.',
          title: 'Advanced Reasoning',
        },
        {
          item_text: '256K context window for extended multi-turn sessions.',
          title: 'Long Context',
        },
      ],
      long_description:
        "Kimi K2.6 is Moonshot AI's large-scale reasoning model with a 256K context window and strong general reasoning performance.",
    },
    parameters: {
      architecture: 'moe',
      context_window: 262144,
      max_output_tokens: 16384,
      parameter_count_billions: 1000,
      precision: 'bf16',
      total_params: '1T',
    },
    performance: {
      benchmark_date: '2026-04-10',
      latency_p50_ms: 520,
      latency_p99_ms: 1600,
      throughput_tokens_per_sec: 70,
      time_to_first_token_ms: 220,
    },
    playground_available: true,
    prices: KIMI_K26_PRICES,
    model_icon: MOONSHOT_MODEL_ICON,
    provider: {
      id: 'moonshot',
      name: 'Moonshot AI',
      provider_icon: MOONSHOT_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['reasoning', 'large'],
    type: 'text-generation',
    updated_at: '2026-04-10T00:00:00Z',
    use_cases: ['general', 'reasoning'],
    version_info: {
      current_version: '2.6',
      deprecation_date: null,
      release_date: '2026-04-10',
      sunset_date: null,
      versions: ['2.5', '2.6'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2026-07-27T00:00:00Z',
    description:
      "Moonshot AI's 2.8T-parameter open model with 1M-token context and always-on deep reasoning.",
    documentation_url: DOCS_URL,
    id: 'kimi-k3',
    label: 'Kimi K3',
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 4,
      max_requests_per_minute: 30,
      max_tokens_per_minute: 500000,
      max_tokens_per_request: 32768,
    },
    modalities: { input: ['text', 'image', 'video'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            "World's first 3T-parameter-class open model with 2.8T total (16 of 896 MoE experts active per token).",
          title: '3T-Parameter Open Model',
        },
        {
          item_text:
            'Native visual and video understanding for UI-to-code, chart analysis, and multimodal reasoning.',
          title: 'Multimodal',
        },
        {
          item_text:
            '1M-token context for entire codebases, long research documents, and extended sessions.',
          title: 'Long Context',
        },
      ],
      long_description:
        "Kimi K3 is Moonshot AI's flagship open-source model, using Kimi Delta Attention for efficient long-context processing with always-on reasoning and native multimodal input.",
    },
    parameters: {
      architecture: 'moe',
      context_window: 1_048_576,
      max_output_tokens: 32768,
      parameter_count_billions: 2800,
      precision: 'bf16',
      total_params: '2.8T',
    },
    performance: {
      benchmark_date: '2026-07-27',
      latency_p50_ms: 680,
      latency_p99_ms: 2200,
      throughput_tokens_per_sec: 55,
      time_to_first_token_ms: 280,
    },
    playground_available: true,
    prices: KIMI_K3_PRICES,
    model_icon: MOONSHOT_MODEL_ICON,
    provider: {
      id: 'moonshot',
      name: 'Moonshot AI',
      provider_icon: MOONSHOT_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['reasoning', 'multimodal', 'long-context'],
    type: 'text-generation',
    updated_at: '2026-07-27T00:00:00Z',
    use_cases: ['general', 'coding', 'reasoning', 'multimodal'],
    version_info: {
      current_version: '3.0',
      deprecation_date: null,
      release_date: '2026-07-27',
      sunset_date: null,
      versions: ['3.0'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2026-05-18T00:00:00Z',
    description:
      "Moonshot AI's coding-focused model with 256K context and multimodal input.",
    documentation_url: DOCS_URL,
    id: 'kimi-k2.7-code',
    label: 'Kimi K2.7 Code',
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 4,
      max_requests_per_minute: 60,
      max_tokens_per_minute: 250000,
      max_tokens_per_request: 16384,
    },
    modalities: { input: ['text', 'image', 'video'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            'Purpose-built for long-context programming and complex multi-file engineering.',
          title: 'Coding-Focused',
        },
        {
          item_text:
            '256K context window for full repository analysis and multi-file refactoring.',
          title: 'Large Codebases',
        },
        {
          item_text:
            'Multimodal input for UI-to-code, visual debugging, and diagram-driven generation.',
          title: 'Multimodal',
        },
      ],
      long_description:
        "Kimi K2.7 Code is Moonshot AI's dedicated coding model with configurable deep thinking mode for complex engineering tasks.",
    },
    parameters: {
      architecture: 'moe',
      context_window: 262144,
      max_output_tokens: 16384,
      parameter_count_billions: 1000,
      precision: 'bf16',
      total_params: '1T',
    },
    performance: {
      benchmark_date: '2026-05-18',
      latency_p50_ms: 540,
      latency_p99_ms: 1700,
      throughput_tokens_per_sec: 68,
      time_to_first_token_ms: 230,
    },
    playground_available: true,
    prices: KIMI_K27_CODE_PRICES,
    model_icon: MOONSHOT_MODEL_ICON,
    provider: {
      id: 'moonshot',
      name: 'Moonshot AI',
      provider_icon: MOONSHOT_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['coding', 'multimodal', 'reasoning'],
    type: 'text-generation',
    updated_at: '2026-05-18T00:00:00Z',
    use_cases: ['coding', 'reasoning'],
    version_info: {
      current_version: '2.7',
      deprecation_date: null,
      release_date: '2026-05-18',
      sunset_date: null,
      versions: ['2.7'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2026-06-30T00:00:00Z',
    description:
      "DeepSeek's 284B MoE model with 1M context and three selectable reasoning modes.",
    documentation_url: DOCS_URL,
    id: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    license: {
      attribution_required: false,
      commercial_use: true,
      name: 'DeepSeek License',
      url: 'https://github.com/deepseek-ai/DeepSeek-LLM/blob/main/LICENSE-MODEL',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 8,
      max_requests_per_minute: 200,
      max_tokens_per_minute: 500000,
      max_tokens_per_request: 16384,
    },
    modalities: { input: ['text'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            'Three selectable reasoning modes: Non-think, Think High, Think Max.',
          title: 'Selectable Reasoning',
        },
        {
          item_text:
            'Hybrid Compressed Sparse Attention reduces KV cache by ~90% at 1M context.',
          title: 'Long-Context Efficiency',
        },
        {
          item_text:
            'Most cost-efficient model in the DeepSeek V4 family for high-throughput production use.',
          title: 'Cost-Efficient',
        },
      ],
      long_description:
        'DeepSeek V4 Flash is a 284B MoE model (13B active per token) with 1M-token context and configurable reasoning depth.',
    },
    parameters: {
      architecture: 'moe',
      context_window: 1_000_000,
      max_output_tokens: 16384,
      parameter_count_billions: 284,
      precision: 'bf16',
      total_params: '284B',
    },
    performance: {
      benchmark_date: '2026-07-31',
      latency_p50_ms: 260,
      latency_p99_ms: 820,
      throughput_tokens_per_sec: 130,
      time_to_first_token_ms: 120,
    },
    playground_available: true,
    prices: DEEPSEEK_V4_FLASH_PRICES,
    model_icon: DEEPSEEK_MODEL_ICON,
    provider: {
      id: 'deepseek',
      name: 'DeepSeek',
      provider_icon: DEEPSEEK_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['moe', 'reasoning', 'long-context'],
    type: 'text-generation',
    updated_at: '2026-07-31T00:00:00Z',
    use_cases: ['general', 'coding', 'reasoning'],
    version_info: {
      current_version: '4.0-flash',
      deprecation_date: null,
      release_date: '2026-06-30',
      sunset_date: null,
      versions: ['4.0-flash'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2026-06-30T00:00:00Z',
    description:
      "DeepSeek's frontier 1.6T MoE model with 1M context and Think Max reasoning.",
    documentation_url: DOCS_URL,
    id: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    license: {
      attribution_required: false,
      commercial_use: true,
      name: 'DeepSeek License',
      url: 'https://github.com/deepseek-ai/DeepSeek-LLM/blob/main/LICENSE-MODEL',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 4,
      max_requests_per_minute: 100,
      max_tokens_per_minute: 500000,
      max_tokens_per_request: 384_000,
    },
    modalities: { input: ['text'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            "1.6T MoE parameters (49B active) — DeepSeek's most capable frontier model.",
          title: 'Frontier Scale',
        },
        {
          item_text:
            'Think Max mode achieves top-tier results on LiveCodeBench v6, AIME 2026, SWE-bench Verified, GPQA-Diamond.',
          title: 'Frontier Benchmarks',
        },
        {
          item_text:
            'Up to 384K output tokens per request for full code generation and long-form drafting.',
          title: 'Large Output',
        },
      ],
      long_description:
        "DeepSeek V4 Pro is DeepSeek's frontier 1.6T MoE model with 1M-token lossless context and Think Max reasoning matching top proprietary models.",
    },
    parameters: {
      architecture: 'moe',
      context_window: 1_000_000,
      max_output_tokens: 384_000,
      parameter_count_billions: 1600,
      precision: 'bf16',
      total_params: '1.6T',
    },
    performance: {
      benchmark_date: '2026-08-13',
      latency_p50_ms: 620,
      latency_p99_ms: 2000,
      throughput_tokens_per_sec: 60,
      time_to_first_token_ms: 260,
    },
    playground_available: true,
    prices: DEEPSEEK_V4_PRO_PRICES,
    model_icon: DEEPSEEK_MODEL_ICON,
    provider: {
      id: 'deepseek',
      name: 'DeepSeek',
      provider_icon: DEEPSEEK_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['moe', 'reasoning', 'frontier', 'long-context'],
    type: 'text-generation',
    updated_at: '2026-08-13T00:00:00Z',
    use_cases: ['general', 'coding', 'reasoning'],
    version_info: {
      current_version: '4.0-pro',
      deprecation_date: null,
      release_date: '2026-06-30',
      sunset_date: null,
      versions: ['4.0-pro'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2026-07-01T00:00:00Z',
    description:
      "ZhipuAI's frontier open-source model with 1M lossless context and strong coding gains.",
    documentation_url: DOCS_URL,
    id: 'glm-5.2',
    label: 'GLM 5.2',
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 4,
      max_requests_per_minute: 100,
      max_tokens_per_minute: 300000,
      max_tokens_per_request: 16384,
    },
    modalities: { input: ['text'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            '50% improvement in software engineering benchmarks over GLM-5.1.',
          title: 'Coding Gains',
        },
        {
          item_text:
            '1M-token lossless context for stable long-horizon agent execution.',
          title: 'Long Context',
        },
        {
          item_text:
            'Open weights under permissive licence — fine-tune and deploy on-premise.',
          title: 'Open Weights',
        },
      ],
      long_description:
        "GLM-5.2 is ZhipuAI's frontier open-source model with enhanced token efficiency and long-horizon agent capabilities.",
    },
    parameters: {
      architecture: 'transformer',
      context_window: 1_000_000,
      max_output_tokens: 16384,
      parameter_count_billions: 130,
      precision: 'bf16',
      total_params: '130B',
    },
    performance: {
      benchmark_date: '2026-07-01',
      latency_p50_ms: 380,
      latency_p99_ms: 1100,
      throughput_tokens_per_sec: 95,
      time_to_first_token_ms: 170,
    },
    playground_available: true,
    prices: GLM_52_PRICES,
    model_icon: GLM_MODEL_ICON,
    provider: {
      id: 'zhipuai',
      name: 'ZhipuAI',
      provider_icon: ZHIPUAI_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['coding', 'agent', 'long-context', 'open-weight'],
    type: 'text-generation',
    updated_at: '2026-07-01T00:00:00Z',
    use_cases: ['general', 'coding', 'reasoning'],
    version_info: {
      current_version: '5.2',
      deprecation_date: null,
      release_date: '2026-07-01',
      sunset_date: null,
      versions: ['5.1', '5.2'],
    },
  },
  {
    api_reference_url: API_REF_URL,
    capabilities: ['chat', 'completion'],
    created_at: '2025-04-07T00:00:00Z',
    description:
      "NVIDIA's 253B reasoning model from Llama 3.1 405B with switchable thinking and function calling.",
    documentation_url: DOCS_URL,
    id: 'llama-3.1-nemotron-ultra-253b-v1',
    label: 'Nemotron Ultra 253B',
    license: {
      attribution_required: true,
      commercial_use: true,
      name: 'NVIDIA Open Model License',
      url: 'https://developer.nvidia.com/open-model-license',
    },
    lifecycle_status: 'active',
    limits: {
      max_concurrent_requests: 4,
      max_requests_per_minute: 80,
      max_tokens_per_minute: 200000,
      max_tokens_per_request: 16384,
    },
    modalities: { input: ['text'], output: ['text'] },
    more_info: {
      highlights: [
        {
          item_text:
            'Derived from Llama 3.1 405B via Neural Architecture Search — reduced footprint, preserved accuracy.',
          title: 'NAS-Compressed',
        },
        {
          item_text:
            'System-prompt toggle enables or disables chain-of-thought reasoning per request.',
          title: 'Switchable Thinking',
        },
        {
          item_text:
            'Native function calling for agentic pipelines, RAG, and multi-step orchestration.',
          title: 'Function Calling',
        },
      ],
      long_description:
        "Llama-3.1-Nemotron-Ultra-253B is NVIDIA's flagship reasoning model with FFN fusion for improved inference speed and eight-language multilingual capability.",
    },
    parameters: {
      architecture: 'transformer',
      context_window: 131072,
      max_output_tokens: 16384,
      parameter_count_billions: 253,
      precision: 'bf16',
      total_params: '253B',
    },
    performance: {
      benchmark_date: '2025-07-10',
      latency_p50_ms: 440,
      latency_p99_ms: 1400,
      throughput_tokens_per_sec: 85,
      time_to_first_token_ms: 190,
    },
    playground_available: true,
    prices: NEMOTRON_ULTRA_253B_PRICES,
    model_icon: NEMOTRON_MODEL_ICON,
    provider: {
      id: 'nvidia',
      name: 'NVIDIA',
      provider_icon: NVIDIA_PROVIDER,
    },
    regional_availability: [
      { capacity: 'high', operational_status: 'operational', region: 'us-ord' },
    ],
    regions: ['us-ord'],
    tags: ['reasoning', 'function-calling', 'multilingual'],
    type: 'text-generation',
    updated_at: '2025-07-10T00:00:00Z',
    use_cases: ['general', 'coding', 'reasoning'],
    version_info: {
      current_version: 'v1',
      deprecation_date: null,
      release_date: '2025-04-07',
      sunset_date: null,
      versions: ['v1'],
    },
  },
];

type ReasoningConfig = {
  default: string;
  enum: string[];
};

type SamplingDefaults = {
  temperature: number;
  topP: number;
};

const DEFAULT_SAMPLING: SamplingDefaults = { temperature: 1, topP: 1 };

const SAMPLING_DEFAULTS: Record<string, SamplingDefaults> = {
  'deepseek-r1-0528': { temperature: 0.6, topP: 0.95 },
  'kimi-k2.7-code': { temperature: 1, topP: 0.95 },
  'llama-3.3-70b-instruct': { temperature: 0.6, topP: 0.9 },
  'qwen3-4b': { temperature: 0.6, topP: 0.95 },
  'qwen3-8b': { temperature: 0.6, topP: 0.95 },
};

const THINKING_DEFAULTS: Record<string, boolean> = {
  'deepseek-v4-flash': true,
  'deepseek-v4-pro': true,
  'gemma-4-26b-a4b-it': false,
  'glm-5.2': true,
  'llama-3.1-nemotron-ultra-253b-v1': true,
  'qwen3-4b': true,
  'qwen3-8b': true,
};

const REASONING_CONFIGS: Record<string, ReasoningConfig> = {
  'deepseek-v4-flash': { default: 'high', enum: ['low', 'high', 'max'] },
  'deepseek-v4-pro': { default: 'high', enum: ['low', 'high', 'max'] },
  'glm-5.2': { default: 'max', enum: ['high', 'max'] },
  'kimi-k3': { default: 'max', enum: ['low', 'high', 'max'] },
};

const MAX_TOKEN_BOUNDS: Record<
  string,
  Pick<InferenceParameterDef, 'maximum' | 'minimum'>
> = {
  'deepseek-r1-0528': { maximum: 65536, minimum: 1 },
  'gemma-4-26b-a4b-it': { maximum: 8192, minimum: 1 },
};

const TOP_K_DEFAULTS: Record<string, number> = {
  'gemma-4-26b-a4b-it': 64,
  'qwen3-4b': 20,
  'qwen3-8b': 20,
};

const COMMON_PARAMETERS: Record<string, InferenceParameterDef> = {
  frequency_penalty: {
    default: 0,
    description:
      "Reduces repetition by penalizing tokens in proportion to how often they've already appeared.",
    label: 'Frequency Penalty',
    maximum: 2,
    minimum: -2,
    type: 'number',
  },
  min_p: {
    default: 0,
    description:
      'Sets the minimum probability a token needs (relative to the most likely token) to be considered.',
    label: 'Min P',
    maximum: 1,
    minimum: 0,
    type: 'number',
  },
  presence_penalty: {
    default: 0,
    description:
      'Discourages reusing any token that has already appeared, nudging the model towards new topics.',
    label: 'Presence Penalty',
    maximum: 2,
    minimum: -2,
    type: 'number',
  },
  seed: {
    default: null,
    description:
      'Fixes the random seed so identical inputs produce identical output.',
    label: 'Seed',
    type: 'integer',
  },
  stop: {
    default: [],
    description: 'Text strings that halt generation when produced.',
    items: { type: 'string' },
    label: 'Stop Sequences',
    type: 'array',
  },
  stream: {
    default: false,
    description: 'Whether the response is returned incrementally.',
    label: 'Stream Response',
    type: 'boolean',
  },
};

const EMBEDDING_PARAMETERS: Record<string, InferenceParameterDef> = {
  dimensions: {
    default: 2560,
    label: 'Dimensions',
    maximum: 2560,
    minimum: 32,
    type: 'integer',
  },
};

export const getInferenceParameters = (
  modelId: string
): Record<string, InferenceParameterDef> => {
  if (modelId === 'qwen3-embedding-4b') {
    return EMBEDDING_PARAMETERS;
  }

  const sampling = SAMPLING_DEFAULTS[modelId] ?? DEFAULT_SAMPLING;
  const enableThinking = THINKING_DEFAULTS[modelId];
  const reasoning = REASONING_CONFIGS[modelId];

  return {
    ...COMMON_PARAMETERS,
    ...(enableThinking === undefined
      ? {}
      : {
          enable_thinking: {
            default: enableThinking,
            description: 'Enables the model reasoning mode.',
            label: 'Enable Thinking',
            type: 'boolean',
          },
        }),
    ...(reasoning === undefined
      ? {}
      : {
          reasoning_effort: {
            ...reasoning,
            description: 'Controls how much reasoning the model performs.',
            label: 'Thinking Effort',
            type: 'string',
          },
        }),
    max_tokens: {
      default: null,
      description: 'The maximum length of the model response in tokens.',
      label: 'Max Output Tokens',
      minimum: 1,
      ...MAX_TOKEN_BOUNDS[modelId],
      type: 'integer',
    },
    temperature: {
      default: sampling.temperature,
      description: 'Controls randomness in generated output.',
      label: 'Temperature',
      maximum: 2,
      minimum: 0,
      type: 'number',
    },
    top_k: {
      default: TOP_K_DEFAULTS[modelId] ?? 0,
      description: 'Limits sampling to the most likely next tokens.',
      label: 'Top K',
      minimum: 0,
      type: 'integer',
    },
    top_p: {
      default: sampling.topP,
      description: 'Limits sampling to the most likely token mass.',
      exclusiveMinimum: 0,
      label: 'Top P',
      maximum: 1,
      type: 'number',
    },
  };
};
