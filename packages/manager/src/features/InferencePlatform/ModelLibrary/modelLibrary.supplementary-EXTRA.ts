import type { InferenceModel } from '../inferenceService';
import type { Model } from './modelLibrary.types';

const TEXT_INPUT_DESCRIPTION =
  'Natural language prompts, instructions, and context';
const TEXT_OUTPUT_DESCRIPTION =
  'Natural language responses, code, and structured text outputs';

/**
 * Stub InferenceModel entries for models not yet returned by the backend.
 * Injected into the model list at runtime when the API does not include them.
 */
export const INFERENCE_MODEL_STUBS: InferenceModel[] = [
  {
    created: 1754352000, // 2025-08-05T00:00:00Z
    id: 'gpt-oss-120b',
    max_model_len: 131072, // 128 K tokens
    object: 'model',
    owned_by: 'vllm',
    root: 'openai/gpt-oss-120b',
  },
  {
    created: 1776643200, // 2026-04-20T00:00:00Z
    id: 'kimi-k2.6',
    max_model_len: 262144, // 256 K tokens
    object: 'model',
    owned_by: 'vllm',
    root: 'moonshotai/Kimi-K2.6',
  },
];

export const MODEL_SUPPLEMENTARY_EXTRA: Record<string, Partial<Model>> = {
  'gpt-oss-120b': {
    contextLengthK: 128,
    description:
      "OpenAI's gpt-oss-120b is an open-weight mixture-of-experts reasoning model with 117B total parameters (5.1B active), a 128K context window, and configurable reasoning effort (low / medium / high). Trained using large-scale RL and distillation from frontier models including o3, it delivers near-parity with o4-mini on reasoning benchmarks while running on a single 80 GB GPU. It features full chain-of-thought access, native tool use (web browsing, Python code execution, function calling), and Structured Outputs support.",
    descriptionShort:
      'Open-weight 117B MoE reasoning model from OpenAI with 128K context, configurable reasoning effort, and native agentic tool use.',
    inputModes: [
      {
        label: 'Text',
        description: TEXT_INPUT_DESCRIPTION,
      },
    ],
    isServerless: false,
    outputModes: [
      {
        label: 'Text',
        description: TEXT_OUTPUT_DESCRIPTION,
      },
    ],
    parametersB: 117,
    priceInputPerMillion: 0.15,
    priceOutputPerMillion: 0.6,
    providerLogo: 'openai',
    providerName: 'OpenAI',
    releasedAt: '2025-08-05',
    supportedLanguages: ['English'],
    title: 'GPT-OSS 120B',
    updatedAt: '2025-08-05',
    useCaseTags: [
      {
        label: 'AI Agent',
        description:
          'Native web browsing, Python code execution, and function calling for autonomous agentic workflows',
      },
      {
        label: 'Coding',
        description:
          'Strong coding performance across benchmarks including SWE-bench; ideal for code generation, review, and debugging',
      },
      {
        label: 'Advanced Reasoning',
        description:
          'Configurable reasoning effort (low / medium / high) with full chain-of-thought; near-parity with o4-mini on competition math and general problem solving',
      },
    ],
  },
  'kimi-k2.6': {
    contextLengthK: 256,
    description:
      "Moonshot AI's Kimi K2.6 is an open-source, native multimodal agentic model featuring 1T total parameters (32B active) and a 256K context window. It delivers state-of-the-art long-horizon coding, coding-driven UI generation, proactive autonomous execution, and agent swarm orchestration across up to 300 parallel sub-agents.",
    descriptionShort:
      'Open-source 1T-parameter multimodal agent model with 256K context, excelling at long-horizon coding, autonomous execution, and agent swarm orchestration.',
    inputModes: [
      {
        label: 'Text',
        description: TEXT_INPUT_DESCRIPTION,
      },
      {
        label: 'Image',
        description:
          'Static image inputs for visual understanding and multimodal reasoning',
      },
      {
        label: 'Video',
        description: 'Video inputs for frame-by-frame visual understanding',
      },
    ],
    isServerless: false,
    outputModes: [
      {
        label: 'Text',
        description: TEXT_OUTPUT_DESCRIPTION,
      },
    ],
    parametersB: 1000,
    priceInputPerMillion: 0.16,
    priceOutputPerMillion: 4.0,
    providerLogo: 'moonshot',
    providerName: 'Moonshot AI',
    releasedAt: '2026-04-20',
    supportedLanguages: [
      'Arabic',
      'Bengali',
      'Chinese',
      'Czech',
      'Danish',
      'Dutch',
      'English',
      'Finnish',
      'French',
      'German',
      'Greek',
      'Hebrew',
      'Hindi',
      'Hungarian',
      'Indonesian',
      'Italian',
      'Japanese',
      'Korean',
      'Malay',
      'Norwegian',
      'Persian',
      'Polish',
      'Portuguese',
      'Romanian',
      'Russian',
      'Spanish',
      'Swedish',
      'Thai',
      'Turkish',
      'Ukrainian',
      'Urdu',
      'Vietnamese',
    ],
    title: 'Kimi K2.6',
    updatedAt: '2026-04-20',
    useCaseTags: [
      {
        label: 'AI Agent',
        description:
          'Long-horizon autonomous execution, agent swarm orchestration, and proactive background agents',
      },
      {
        label: 'Coding',
        description:
          'State-of-the-art long-horizon coding across Rust, Go, Python, and front-end frameworks',
      },
      {
        label: 'Advanced Reasoning',
        description:
          'Deep multi-step reasoning for math, science, and complex logic tasks',
      },
      {
        label: 'Multimodal Analysis',
        description:
          'Visual understanding, coding-driven UI generation, and video analysis',
      },
    ],
  },
};
