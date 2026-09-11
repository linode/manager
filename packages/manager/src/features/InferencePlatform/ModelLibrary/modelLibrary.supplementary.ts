import { MODEL_SUPPLEMENTARY_EXTRA } from './modelLibrary.supplementary-EXTRA';

import type { Model } from './modelLibrary.types';

const TEXT_INPUT_DESCRIPTION =
  'Natural language prompts, instructions, and context';
const TEXT_OUTPUT_DESCRIPTION =
  'Natural language responses, code, and structured text outputs';
const QWEN3_RELEASE_DATE = '2025-04-29';
/**
 * Supplementary metadata keyed by model id.
 * The Helix /v1/models endpoint returns only id, root, max_model_len, created, owned_by.
 * Everything else needed to render a ModelCard lives here.
 */
export const MODEL_SUPPLEMENTARY: Record<string, Partial<Model>> = {
  'gemma-4-26b-a4b-it': {
    description:
      "Google's Gemma 4 26B delivers elite reasoning and native vision with a massive 100K context window — the perfect high-efficiency choice for complex agents and low-latency production workflows.",
    descriptionLong:
      "Gemma 4 26B A4B is Google DeepMind's open Mixture-of-Experts model, activating just 3.8B of 25.2B total parameters during inference. Built on Gemini 3 research, it delivers frontier reasoning, multimodal understanding across text and images, and a 256K context window. Configurable thinking mode, native function calling, and 140+ language training make it a strong choice for coding, agents, and complex analysis.",
    descriptionShort:
      'Elite reasoning and native vision with a 100K context window, optimised for agents and production workflows.',
    highlights: [
      {
        title: 'Efficient Mixture-of-Experts (MoE) Architecture',
        item_text:
          'Activates just 3.8B of its 25.2B total parameters during inference, delivering large-model performance at 4B-class speeds.',
      },
      {
        title: 'Advanced Thinking and Reasoning Capabilities',
        item_text:
          'Features a configurable, built-in thinking mode that processes complex problems step-by-step.',
      },
      {
        title: '256K Context Window',
        item_text:
          'Supports 256,000 tokens using a hybrid local/global attention mechanism for fast, memory-efficient long-context processing.',
      },
      {
        title: 'Versatile Multimodal Understanding',
        item_text:
          'Accepts interleaved text and images of any resolution or aspect ratio, excelling at OCR, document parsing, chart reading, and UI analysis.',
      },
      {
        title: 'Optimized for Coding and Autonomous Agents',
        item_text:
          'Features native function calling and system prompt support, optimized for strong coding performance and agentic workflows.',
      },
    ],
    modelLogo: 'gemma4',
    useCaseTags: [
      {
        label: 'Multimodal Analysis',
        description:
          'Reading large PDFs with images/charts or analyzing short video clips',
      },
      {
        label: 'AI Agent',
        description:
          'Autonomously executing complex workflows using native tool-calling.',
      },
      {
        label: 'Advanced Reasoning',
        description:
          'Solving difficult logic, math, and science problems via thinking mode.',
      },
      {
        label: 'Coding',
        description: 'Coding, Reviewing & Debugging of large codebases',
      },
      {
        label: 'Chatbots',
        description:
          'Build conversational AI applications with multi-turn dialogue.',
      },
      {
        label: 'Structured Data Extraction',
        description:
          'Extract information from documents and unstructured text into structured formats like JSON or CSV.',
      },
      {
        label: 'Multilingual Translation',
        description:
          'Translate text between multiple languages with high accuracy and fluency.',
      },
    ],
    inputModes: [
      {
        label: 'Text',
        description: TEXT_INPUT_DESCRIPTION,
      },
      {
        label: 'Image',
        description:
          'Static image inputs for visual understanding, document analysis, and multimodal reasoning',
      },
      {
        label: 'Video',
        description: 'Frame-by-frame video inputs (up to 60 s at 1 fps)',
      },
    ],
    outputModes: [
      {
        label: 'Text',
        description: TEXT_OUTPUT_DESCRIPTION,
      },
    ],
    contextLengthK: 256,
    isServerless: true,
    parametersB: 26,
    priceInputCachedPerMillion: 0.1,
    priceInputPerMillion: 0.2,
    priceOutputPerMillion: 0.5,
    providerLogo: 'Google',
    providerName: 'Google',
    releasedAt: '2026-04-02',
    title: 'Gemma 4 26B',
    updatedAt: '2025-04-10',
    supportedLanguages: [
      'Afrikaans',
      'Arabic',
      'Armenian',
      'Assamese',
      'Bengali',
      'Bulgarian',
      'Catalan',
      'Chinese',
      'Croatian',
      'Czech',
      'Danish',
      'Dutch',
      'English',
      'Estonian',
      'Faroese',
      'Finnish',
      'French',
      'Galician',
      'Georgian',
      'German',
      'Greek',
      'Gujarati',
      'Hebrew',
      'Hindi',
      'Hungarian',
      'Icelandic',
      'Indonesian',
      'Irish',
      'Italian',
      'Japanese',
      'Kannada',
      'Kazakh',
      'Korean',
      'Latvian',
      'Lithuanian',
      'Macedonian',
      'Malay',
      'Malayalam',
      'Maltese',
      'Marathi',
      'Nepali',
      'Norwegian',
      'Oromo',
      'Persian',
      'Polish',
      'Portuguese',
      'Punjabi',
      'Romanian',
      'Russian',
      'Serbian',
      'Sinhala',
      'Slovak',
      'Slovenian',
      'Spanish',
      'Swahili',
      'Swedish',
      'Tamil',
      'Telugu',
      'Thai',
      'Turkish',
      'Ukrainian',
      'Urdu',
      'Uzbek',
      'Vietnamese',
      'Welsh',
      'Yoruba',
    ],
  },
  ...MODEL_SUPPLEMENTARY_EXTRA,
  'qwen3-4b': {
    description:
      'Qwen3 4B is a compact yet highly capable instruction-tuned model from Alibaba, optimised for fast inference on resource-constrained environments.',
    descriptionLong:
      "Qwen3 4B is Alibaba's compact open-weights language model featuring hybrid thinking and non-thinking modes. Despite its small footprint, it rivals much larger models on MMLU, MATH, and coding benchmarks, powered by 36T tokens of high-quality pretraining data. It supports 119 languages, built-in MCP and tool-calling for agentic tasks, and runs efficiently on consumer hardware and edge devices.",
    descriptionShort:
      'Compact instruction-tuned model from Alibaba, optimised for fast inference on resource-constrained environments.',
    highlights: [
      {
        title: 'Hybrid Thinking and Non-Thinking Modes',
        item_text:
          'Switches between step-by-step deliberate reasoning and instant direct responses, letting you balance output quality and latency per request.',
      },
      {
        title: 'Exceptional Parameter Efficiency',
        item_text:
          'Rivals models twice its size on MMLU, MATH, and coding benchmarks, driven by 36T tokens of high-quality pretraining data and architectural refinements.',
      },
      {
        title: '119-Language Multilingual Support',
        item_text:
          'Pre-trained on text spanning 119 languages and dialects, enabling natural conversation, translation, and cross-lingual reasoning worldwide.',
      },
      {
        title: 'Native Agentic and Tool-Calling Capabilities',
        item_text:
          'Built-in MCP support and optimised tool-calling allow reliable multi-step task execution in complex automated workflows.',
      },
      {
        title: 'Compact Footprint for On-Device Deployment',
        item_text:
          'At 4B parameters, the model runs on consumer hardware and edge devices, delivering low-latency inference without requiring a GPU server.',
      },
    ],
    modelLogo: 'qwen',
    useCaseTags: [
      {
        label: 'AI Agent',
        description:
          'Orchestrate autonomous agents for complex task automation',
      },
      {
        label: 'Coding',
        description: 'Generate, complete, and debug code across languages',
      },
      {
        label: 'Math',
        description: 'Solve mathematical problems and reasoning tasks',
      },
    ],
    inputModes: [
      {
        label: 'Text',
        description: TEXT_INPUT_DESCRIPTION,
      },
    ],
    outputModes: [
      {
        label: 'Text',
        description: TEXT_OUTPUT_DESCRIPTION,
      },
    ],
    contextLengthK: 32,
    isServerless: true,
    parametersB: 4,
    priceInputCachedPerMillion: 0.025,
    priceInputPerMillion: 0.05,
    priceOutputPerMillion: 0.1,
    providerLogo: 'alibaba',
    providerName: 'Qwen',
    releasedAt: QWEN3_RELEASE_DATE,
    title: 'Qwen3 4B',
    updatedAt: '2025-11-01',
    supportedLanguages: [
      'Afrikaans',
      'Arabic',
      'Armenian',
      'Assamese',
      'Asturian',
      'Awadhi',
      'Balinese',
      'Banjar',
      'Bashkir',
      'Basque',
      'Belarusian',
      'Bengali',
      'Bhojpuri',
      'Bosnian',
      'Bulgarian',
      'Burmese',
      'Catalan',
      'Cebuano',
      'Chhattisgarhi',
      'Chinese',
      'Croatian',
      'Czech',
      'Danish',
      'Dari',
      'Dutch',
      'Eastern Yiddish',
      'English',
      'Estonian',
      'Faroese',
      'Finnish',
      'French',
      'Friulian',
      'Galician',
      'Georgian',
      'German',
      'Greek',
      'Gujarati',
      'Haitian',
      'Hebrew',
      'Hindi',
      'Hungarian',
      'Icelandic',
      'Iloko',
      'Indonesian',
      'Irish',
      'Italian',
      'Japanese',
      'Javanese',
      'Kabuverdianu',
      'Kannada',
      'Kazakh',
      'Khmer',
      'Korean',
      'Lao',
      'Latvian',
      'Ligurian',
      'Limburgish',
      'Lithuanian',
      'Lombard',
      'Luxembourgish',
      'Macedonian',
      'Magahi',
      'Maithili',
      'Malay',
      'Malayalam',
      'Maltese',
      'Marathi',
      'Minangkabau',
      'Nepali',
      'North Azerbaijani',
      'Northern Uzbek',
      'Norwegian Bokmål',
      'Norwegian Nynorsk',
      'Occitan',
      'Oriya',
      'Pangasinan',
      'Papiamento',
      'Persian',
      'Polish',
      'Portuguese',
      'Punjabi',
      'Romanian',
      'Russian',
      'Sardinian',
      'Serbian',
      'Sicilian',
      'Silesian',
      'Sindhi',
      'Sinhala',
      'Slovak',
      'Slovenian',
      'Spanish',
      'Sundanese',
      'Swahili',
      'Swedish',
      'Tagalog',
      'Tajik',
      'Tamil',
      'Tatar',
      'Telugu',
      'Thai',
      'Tok Pisin',
      'Tosk Albanian',
      'Turkish',
      'Ukrainian',
      'Urdu',
      'Venetian',
      'Vietnamese',
      'Waray',
      'Welsh',
    ],
  },
  'qwen3-8b': {
    description:
      'Qwen3 8B is a high-efficiency instruction-tuned model from Alibaba with strong reasoning capabilities across code, math, and multilingual tasks.',
    descriptionLong:
      "Qwen3 8B is Alibaba's mid-size open-weights model with a 128K context window and hybrid thinking and non-thinking modes. Despite 8B parameters, it matches or exceeds Qwen2.5-72B across STEM, coding, and reasoning benchmarks. It supports 119 languages, native MCP and multi-tool orchestration, and is optimised for long-context reasoning, instruction following, and complex agentic workflows.",
    descriptionShort:
      'High-efficiency model from Alibaba with strong reasoning across code, math, and multilingual tasks.',
    highlights: [
      {
        title: 'Extended 128K Context Window',
        item_text:
          'Handles long documents, large codebases, and multi-turn conversations with faithful recall across up to 128,000 tokens in a single request.',
      },
      {
        title: 'Outperforms Models Twice Its Size',
        item_text:
          'Matches or exceeds Qwen2.5-72B on STEM, coding, and reasoning benchmarks despite having 8B parameters, thanks to improved training data and architecture.',
      },
      {
        title: 'Hybrid Thinking and Non-Thinking Modes',
        item_text:
          'Toggles between deep step-by-step reasoning and rapid direct responses within one deployment, enabling flexible cost-versus-quality trade-offs.',
      },
      {
        title: '119-Language Multilingual Coverage',
        item_text:
          'Pre-trained on 36T tokens across 119 languages and dialects, producing high-quality output and instruction following across global markets.',
      },
      {
        title: 'MCP and Multi-Tool Orchestration',
        item_text:
          'Optimised for agentic workflows with native MCP support and reliable multi-tool calling for complex automated task pipelines.',
      },
    ],
    modelLogo: 'qwen',
    useCaseTags: [
      {
        label: 'AI Agent',
        description:
          'Orchestrate autonomous agents for complex task automation',
      },
      {
        label: 'Coding',
        description: 'Generate, complete, and debug code across languages',
      },
      {
        label: 'Math',
        description: 'Solve mathematical problems and reasoning tasks',
      },
    ],
    inputModes: [
      {
        label: 'Text',
        description: TEXT_INPUT_DESCRIPTION,
      },
    ],
    outputModes: [
      {
        label: 'Text',
        description: TEXT_OUTPUT_DESCRIPTION,
      },
    ],
    contextLengthK: 128,
    isServerless: true,
    parametersB: 8,
    priceInputCachedPerMillion: 0.05,
    priceInputPerMillion: 0.1,
    priceOutputPerMillion: 0.3,
    providerLogo: 'alibaba',
    providerName: 'Qwen',
    releasedAt: QWEN3_RELEASE_DATE,
    title: 'Qwen3 8B',
    updatedAt: '2025-12-15',
    supportedLanguages: [
      'Afrikaans',
      'Arabic',
      'Armenian',
      'Assamese',
      'Asturian',
      'Awadhi',
      'Balinese',
      'Banjar',
      'Bashkir',
      'Basque',
      'Belarusian',
      'Bengali',
      'Bhojpuri',
      'Bosnian',
      'Bulgarian',
      'Burmese',
      'Catalan',
      'Cebuano',
      'Chhattisgarhi',
      'Chinese',
      'Croatian',
      'Czech',
      'Danish',
      'Dari',
      'Dutch',
      'Eastern Yiddish',
      'English',
      'Estonian',
      'Faroese',
      'Finnish',
      'French',
      'Friulian',
      'Galician',
      'Georgian',
      'German',
      'Greek',
      'Gujarati',
      'Haitian',
      'Hebrew',
      'Hindi',
      'Hungarian',
      'Icelandic',
      'Iloko',
      'Indonesian',
      'Irish',
      'Italian',
      'Japanese',
      'Javanese',
      'Kabuverdianu',
      'Kannada',
      'Kazakh',
      'Khmer',
      'Korean',
      'Lao',
      'Latvian',
      'Ligurian',
      'Limburgish',
      'Lithuanian',
      'Lombard',
      'Luxembourgish',
      'Macedonian',
      'Magahi',
      'Maithili',
      'Malay',
      'Malayalam',
      'Maltese',
      'Marathi',
      'Minangkabau',
      'Nepali',
      'North Azerbaijani',
      'Northern Uzbek',
      'Norwegian Bokmål',
      'Norwegian Nynorsk',
      'Occitan',
      'Oriya',
      'Pangasinan',
      'Papiamento',
      'Persian',
      'Polish',
      'Portuguese',
      'Punjabi',
      'Romanian',
      'Russian',
      'Sardinian',
      'Serbian',
      'Sicilian',
      'Silesian',
      'Sindhi',
      'Sinhala',
      'Slovak',
      'Slovenian',
      'Spanish',
      'Sundanese',
      'Swahili',
      'Swedish',
      'Tagalog',
      'Tajik',
      'Tamil',
      'Tatar',
      'Telugu',
      'Thai',
      'Tok Pisin',
      'Tosk Albanian',
      'Turkish',
      'Ukrainian',
      'Urdu',
      'Venetian',
      'Vietnamese',
      'Waray',
      'Welsh',
    ],
  },
  'qwen3-embedding-4b': {
    description:
      'Qwen3 Embedding 4B is a state-of-the-art multilingual text embedding model from Alibaba, optimised for semantic search, retrieval-augmented generation, and similarity tasks across 100+ languages.',
    descriptionLong:
      'Qwen3 Embedding 4B is a state-of-the-art text embedding model built on the Qwen3 foundation, ranking No.1 on the MTEB multilingual leaderboard at release. It supports 100+ languages including coding languages, Matryoshka Representation Learning for flexible vector dimensions, and instruction-aware embedding. Designed for semantic search, RAG, reranking, and classification, it balances accuracy and efficiency across retrieval workloads.',
    descriptionShort:
      'State-of-the-art multilingual embedding model from Alibaba, optimised for semantic search and RAG across 100+ languages.',
    highlights: [
      {
        title: 'State-of-the-Art Retrieval Performance',
        item_text:
          'Ranked No.1 on the MTEB multilingual leaderboard at release, delivering best-in-class semantic search accuracy across 100+ languages.',
      },
      {
        title: 'Matryoshka Representation Learning',
        item_text:
          'Supports flexible embedding dimensions without retraining, letting you trade storage cost against retrieval quality to match your infrastructure needs.',
      },
      {
        title: 'Instruction-Aware Embedding',
        item_text:
          'Accepts task-specific natural language instructions to customise embedding behaviour for retrieval, classification, and reranking scenarios.',
      },
      {
        title: 'Built on the Qwen3 Foundation Model',
        item_text:
          'Inherits strong multilingual text understanding from Qwen3, including robust support for major programming languages and cross-lingual retrieval.',
      },
    ],
    modelLogo: 'qwen',
    useCaseTags: [
      {
        label: 'RAG',
        description:
          'Power retrieval-augmented generation pipelines with high-quality semantic search',
      },
      {
        label: 'Text Embeddings',
        description:
          'Encode text into dense vectors for semantic similarity and search',
      },
      {
        label: 'Reranking',
        description:
          'Reorder candidate documents to improve retrieval precision',
      },
    ],
    inputModes: [
      {
        label: 'Text',
        description:
          'Natural language text to encode into dense vector representations',
      },
    ],
    outputModes: [
      {
        label: 'Embeddings',
        description:
          'High-dimensional dense vector representations for semantic search, retrieval, and similarity tasks',
      },
    ],
    contextLengthK: 32,
    isServerless: false,
    parametersB: 4,
    priceInputCachedPerMillion: 0.015,
    priceInputPerMillion: 0.03,
    priceOutputPerMillion: 0.0,
    providerLogo: 'alibaba',
    providerName: 'Qwen',
    releasedAt: '2025-06-05',
    title: 'Qwen3 Embedding 4B',
    updatedAt: QWEN3_RELEASE_DATE,
    supportedLanguages: [
      'Afrikaans',
      'Arabic',
      'Armenian',
      'Assamese',
      'Asturian',
      'Awadhi',
      'Balinese',
      'Banjar',
      'Bashkir',
      'Basque',
      'Belarusian',
      'Bengali',
      'Bhojpuri',
      'Bosnian',
      'Bulgarian',
      'Burmese',
      'Catalan',
      'Cebuano',
      'Chhattisgarhi',
      'Chinese',
      'Croatian',
      'Czech',
      'Danish',
      'Dari',
      'Dutch',
      'Eastern Yiddish',
      'English',
      'Estonian',
      'Faroese',
      'Finnish',
      'French',
      'Friulian',
      'Galician',
      'Georgian',
      'German',
      'Greek',
      'Gujarati',
      'Haitian',
      'Hebrew',
      'Hindi',
      'Hungarian',
      'Icelandic',
      'Iloko',
      'Indonesian',
      'Irish',
      'Italian',
      'Japanese',
      'Javanese',
      'Kabuverdianu',
      'Kannada',
      'Kazakh',
      'Khmer',
      'Korean',
      'Lao',
      'Latvian',
      'Ligurian',
      'Limburgish',
      'Lithuanian',
      'Lombard',
      'Luxembourgish',
      'Macedonian',
      'Magahi',
      'Maithili',
      'Malay',
      'Malayalam',
      'Maltese',
      'Marathi',
      'Minangkabau',
      'Nepali',
      'North Azerbaijani',
      'Northern Uzbek',
      'Norwegian Bokmål',
      'Norwegian Nynorsk',
      'Occitan',
      'Oriya',
      'Pangasinan',
      'Papiamento',
      'Persian',
      'Polish',
      'Portuguese',
      'Punjabi',
      'Romanian',
      'Russian',
      'Sardinian',
      'Serbian',
      'Sicilian',
      'Silesian',
      'Sindhi',
      'Sinhala',
      'Slovak',
      'Slovenian',
      'Spanish',
      'Sundanese',
      'Swahili',
      'Swedish',
      'Tagalog',
      'Tajik',
      'Tamil',
      'Tatar',
      'Telugu',
      'Thai',
      'Tok Pisin',
      'Tosk Albanian',
      'Turkish',
      'Ukrainian',
      'Urdu',
      'Venetian',
      'Vietnamese',
      'Waray',
      'Welsh',
    ],
  },

  'kimi-k3': {
    description:
      "Moonshot AI's 2.8T-parameter open model with 1M-token context, visual understanding, and always-on deep reasoning.",
    descriptionLong:
      "Kimi K3 is Moonshot AI's flagship open-source model and the world's first 3-trillion-parameter-class release, with 2.8T total parameters and 16 of 896 MoE experts activated per token. Built on Kimi Delta Attention for efficient long-context processing, it features native visual and video understanding, a 1M-token context window, and configurable reasoning effort. Thinking is always enabled and cannot be turned off.",
    descriptionShort:
      "World's first 3T-parameter open model with 1M context, visual understanding, and always-on reasoning.",
    highlights: [
      {
        title: "World's First 3-Trillion-Parameter Open Model",
        item_text:
          'Reaches 2.8T parameters, activating 16 of 896 MoE experts per token — the largest open-source model class ever released.',
      },
      {
        title: 'Kimi Delta Attention Architecture',
        item_text:
          'Hybrid linear attention improves information flow across long sequences and deep layers, giving roughly 2.5x the scaling efficiency of Kimi K2.',
      },
      {
        title: '1M-Token Context Window',
        item_text:
          'Processes entire codebases, lengthy research documents, and extended multi-turn sessions in a single one-million-token context.',
      },
      {
        title: 'Configurable Reasoning Effort',
        item_text:
          'Always reasons; adjust effort via low/high/max to balance thinking depth against response latency without disabling the reasoning chain.',
      },
      {
        title: 'Native Visual and Video Understanding',
        item_text:
          'Accepts interleaved text, images, and video, enabling code generation from UI screenshots, chart analysis, and visual engineering workflows.',
      },
    ],
    modelLogo: 'moonshot',
    inputModes: [
      { label: 'Text', description: TEXT_INPUT_DESCRIPTION },
      {
        label: 'Image',
        description:
          'Static image inputs for visual understanding and multimodal reasoning',
      },
      {
        label: 'Video',
        description:
          'Video inputs for frame-by-frame visual analysis and code generation from recordings',
      },
    ],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 1024,
    isServerless: true,
    parametersB: 2800,
    priceInputCachedPerMillion: 1.5,
    priceInputPerMillion: 3.0,
    priceOutputPerMillion: 15.0,
    providerLogo: 'moonshot',
    providerName: 'Moonshot AI',
    releasedAt: '2026-07-27',
    title: 'Kimi K3',
    updatedAt: '2026-07-27',
    supportedLanguages: [
      'Chinese',
      'English',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Portuguese',
      'Russian',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Coding',
        description:
          'Long-horizon programming, repository analysis, and automated engineering',
      },
      {
        label: 'AI Agent',
        description:
          'End-to-end agentic workflows with tool use and visual reasoning',
      },
      {
        label: 'Advanced Reasoning',
        description:
          'Deep step-by-step thinking on hard math, science, and planning tasks',
      },
      {
        label: 'Multimodal Analysis',
        description:
          'Visual understanding from screenshots, charts, and video frames',
      },
      {
        label: 'Long Context',
        description:
          'Process entire codebases and lengthy documents in a single 1M-token pass',
      },
    ],
  },

  'kimi-k2.7-code': {
    description:
      "Moonshot AI's coding-focused model with 256K context, multimodal input, and deep thinking for complex engineering tasks.",
    descriptionLong:
      "Kimi K2.7 Code is Moonshot AI's dedicated coding model, purpose-built for long-context programming and complex engineering work. It supports text, image, and video input, enabling UI-to-code generation, visual debugging, and diagram analysis. With a 256K context window and configurable deep thinking mode, it delivers high task-success rates on multi-file codebases, repository-scale refactoring, and security engineering.",
    descriptionShort:
      'Moonshot AI coding model with 256K context, multimodal input, and deep thinking for engineering tasks.',
    highlights: [
      {
        title: 'Coding-Focused Architecture and Training',
        item_text:
          'Purpose-built for long-context programming, delivering higher task-success rates on complex, multi-file engineering and debugging challenges.',
      },
      {
        title: '256K Context for Large Codebases',
        item_text:
          'Handles up to 256,000 tokens in a single pass, enabling full repository analysis, test-suite review, and multi-file refactoring without truncation.',
      },
      {
        title: 'Multimodal Code Assistance',
        item_text:
          'Accepts text, image, and video input, supporting UI implementation from screenshots, visual debugging, and diagram-driven code generation.',
      },
      {
        title: 'Deep Thinking Mode for Complex Problems',
        item_text:
          'Configurable long-chain reasoning applies extended step-by-step analysis to hard algorithmic, architectural, and security engineering challenges.',
      },
    ],
    modelLogo: 'moonshot',
    inputModes: [
      { label: 'Text', description: TEXT_INPUT_DESCRIPTION },
      {
        label: 'Image',
        description:
          'Image inputs for UI-to-code generation and visual debugging',
      },
      {
        label: 'Video',
        description:
          'Video inputs for diagram-driven and workflow-based code generation',
      },
    ],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 256,
    isServerless: true,
    parametersB: 1000,
    priceInputCachedPerMillion: 0.48,
    priceInputPerMillion: 0.95,
    priceOutputPerMillion: 4.0,
    providerLogo: 'moonshot',
    providerName: 'Moonshot AI',
    releasedAt: '2026-06-01',
    title: 'Kimi K2.7 Code',
    updatedAt: '2026-06-01',
    supportedLanguages: [
      'Chinese',
      'English',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Portuguese',
      'Russian',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Coding',
        description:
          'Long-context programming, multi-file refactoring, and repository analysis',
      },
      {
        label: 'Code Generation',
        description:
          'Generate complete solutions from screenshots, diagrams, and natural language',
      },
      {
        label: 'AI Agent',
        description:
          'Automated engineering pipelines with tool use and visual feedback loops',
      },
    ],
  },

  'deepseek-v4-flash': {
    description:
      "DeepSeek's 284B MoE model with 1M context, three reasoning modes, and competitive pricing for production workloads.",
    descriptionLong:
      'DeepSeek V4 Flash is an efficient 284B Mixture-of-Experts model with only 13B parameters activated per token, supporting a one-million-token context window. Three selectable reasoning modes — Non-think, Think High, and Think Max — let you tune quality versus latency per request. Compressed Sparse Attention reduces KV cache by 90% at 1M context, making it the most cost-efficient model in the V4 family.',
    descriptionShort:
      'Efficient 284B MoE model with 1M context and three selectable reasoning modes at competitive cost.',
    highlights: [
      {
        title: 'Three Selectable Reasoning Modes',
        item_text:
          'Non-think gives instant responses; Think High applies deliberate analysis; Think Max pushes the model to its full reasoning capability per request.',
      },
      {
        title: 'Hybrid Compressed Sparse Attention',
        item_text:
          'CSA and HCA layers reduce KV cache to just 10% of V3.2 at 1M context, dramatically lowering memory and cost for long-context workloads.',
      },
      {
        title: '1M-Token Context at Competitive Cost',
        item_text:
          'Processes one million tokens per request and is the most cost-efficient model in the DeepSeek V4 family, suited for high-throughput production use.',
      },
      {
        title: 'Muon Optimizer for Stable Large-Scale Training',
        item_text:
          'Pre-trained on 32T+ tokens using the Muon optimiser, achieving faster convergence and zero training instability at unprecedented parameter scale.',
      },
      {
        title: 'Full Tool Calling and Structured Output',
        item_text:
          'Supports JSON output mode, tool calls, and Anthropic API compatibility, covering all major agentic and integration patterns out of the box.',
      },
    ],
    modelLogo: 'deepseek',
    inputModes: [{ label: 'Text', description: TEXT_INPUT_DESCRIPTION }],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 1000,
    isServerless: true,
    parametersB: 284,
    priceInputCachedPerMillion: 0.22,
    priceInputPerMillion: 0.44,
    priceOutputPerMillion: 1.32,
    providerLogo: 'deepseek',
    providerName: 'DeepSeek',
    releasedAt: '2026-06-30',
    title: 'DeepSeek V4 Flash',
    updatedAt: '2026-07-31',
    supportedLanguages: [
      'Arabic',
      'Chinese',
      'English',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Portuguese',
      'Russian',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Coding',
        description:
          'Code generation, debugging, and complex software engineering',
      },
      {
        label: 'AI Agent',
        description:
          'Agentic workflows with tool use and long-context task execution',
      },
      {
        label: 'Advanced Reasoning',
        description: 'Complex analytical and multi-step reasoning tasks',
      },
    ],
  },

  'deepseek-v4-pro': {
    description:
      "DeepSeek's frontier 1.6T MoE model with 1M context and Think Max mode matching the best closed-source models.",
    descriptionLong:
      "DeepSeek V4 Pro is DeepSeek's frontier 1.6-trillion-parameter Mixture-of-Experts model, activating 49B parameters per token and supporting a one-million-token context window. Its Think Max reasoning mode achieves top-tier results on LiveCodeBench v6, AIME 2026, SWE-bench Verified, and GPQA-Diamond, matching or exceeding leading closed-source models. Domain-expert post-training via SFT, RL, and on-policy distillation delivers broad mastery across coding, math, and agentic workflows.",
    descriptionShort:
      'Frontier 1.6T MoE model with 1M context and Think Max mode matching the best proprietary models.',
    highlights: [
      {
        title: '1.6 Trillion Parameter Frontier Scale',
        item_text:
          "1.6T total MoE parameters with 49B activated per token — DeepSeek's most capable model, built for the hardest reasoning and coding challenges.",
      },
      {
        title: 'Think Max Rivals Closed-Source Frontier Models',
        item_text:
          'Think Max mode achieves top-tier results on LiveCodeBench v6, AIME 2026, SWE-bench Verified, and GPQA-Diamond, matching the best proprietary models.',
      },
      {
        title: '1M-Token Lossless Context Window',
        item_text:
          'Processes entire codebases, legal documents, and research papers with accurate full-context recall across the complete one-million-token window.',
      },
      {
        title: 'Domain-Expert Post-Training Pipeline',
        item_text:
          'Independent domain specialists are cultivated via SFT and RL then unified through on-policy distillation into a single high-performance model.',
      },
      {
        title: 'Up to 384K Output Tokens per Request',
        item_text:
          'Generates up to 384,000 output tokens, enabling complete code generation, long-form document drafting, and full research report production.',
      },
    ],
    modelLogo: 'deepseek',
    inputModes: [{ label: 'Text', description: TEXT_INPUT_DESCRIPTION }],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 1000,
    isServerless: true,
    parametersB: 1600,
    priceInputCachedPerMillion: 0.66,
    priceInputPerMillion: 1.32,
    priceOutputPerMillion: 3.96,
    providerLogo: 'deepseek',
    providerName: 'DeepSeek',
    releasedAt: '2026-06-30',
    title: 'DeepSeek V4 Pro',
    updatedAt: '2026-08-13',
    supportedLanguages: [
      'Arabic',
      'Chinese',
      'English',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Portuguese',
      'Russian',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Coding',
        description:
          'Frontier-level code generation, agentic coding, and software engineering',
      },
      {
        label: 'Advanced Reasoning',
        description:
          'Solving the hardest math, science, and logical reasoning problems',
      },
      {
        label: 'AI Agent',
        description:
          'Complex multi-step agentic workflows and long-horizon task execution',
      },
    ],
  },

  'glm-5.2': {
    description:
      "ZhipuAI's frontier model with 50% coding improvement, 1M lossless context, and strong long-horizon agent capabilities.",
    descriptionLong:
      "GLM-5.2 is ZhipuAI's frontier open-source model with a 50% improvement in software engineering over GLM-5.1. It features a lossless one-million-token context window for stable long-horizon agent and document tasks, optimised token efficiency that lowers inference cost, and enhanced code generation and debugging capabilities. Open weights under a permissive licence enable fine-tuning and on-premise deployment without cloud dependency.",
    descriptionShort:
      '50% coding improvement over GLM-5.1, 1M lossless context, and enhanced long-horizon agent capabilities.',
    highlights: [
      {
        title: '50% Coding Performance Gain Over GLM-5.1',
        item_text:
          'Delivers a 50% improvement in software engineering benchmarks, with partial parity to Mythos 5 on network security and code analysis tasks.',
      },
      {
        title: '1M-Token Lossless Context Window',
        item_text:
          'Maintains full recall accuracy across one million tokens, enabling stable execution of long-horizon agent tasks and large document workflows.',
      },
      {
        title: 'Optimised Token Efficiency',
        item_text:
          'Achieves stronger task accuracy while using fewer tokens per response, lowering inference costs compared to previous GLM model generations.',
      },
      {
        title: 'Open Weights for Custom Deployment',
        item_text:
          'Released with open weights under a permissive licence, enabling fine-tuning on proprietary data and on-premise deployment without cloud dependency.',
      },
    ],
    modelLogo: 'glm5',
    inputModes: [{ label: 'Text', description: TEXT_INPUT_DESCRIPTION }],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 1000,
    isServerless: true,
    parametersB: 130,
    priceInputCachedPerMillion: 0.56,
    priceInputPerMillion: 1.11,
    priceOutputPerMillion: 3.88,
    providerLogo: 'zhipuai',
    providerName: 'ZhipuAI',
    releasedAt: '2026-07-01',
    title: 'GLM 5.2',
    updatedAt: '2026-07-01',
    supportedLanguages: [
      'Chinese',
      'English',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Portuguese',
      'Russian',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Coding',
        description:
          'Advanced software engineering with 50% improved benchmark performance',
      },
      {
        label: 'AI Agent',
        description:
          'Stable long-horizon agent task execution with 1M lossless context',
      },
      {
        label: 'Long Context',
        description:
          'Document and knowledge workflows requiring faithful recall across 1M tokens',
      },
    ],
  },

  'llama-3.1-nemotron-ultra-253b-v1': {
    description:
      "NVIDIA's 253B reasoning model from Llama 3.1 405B with switchable thinking, function calling, and frontier accuracy.",
    descriptionLong:
      "Llama-3.1-Nemotron-Ultra-253B is NVIDIA's flagship 253B reasoning model, derived from Llama 3.1 405B using Neural Architecture Search to reduce memory and latency while preserving accuracy. A system-prompt toggle switches chain-of-thought reasoning on or off, and FFN fusion further improves inference speed. It supports native function calling, eight languages, and excels at math, coding, scientific reasoning, and instruction following.",
    descriptionShort:
      '253B NAS-compressed reasoning model from Llama 3.1 405B with switchable thinking and function calling.',
    highlights: [
      {
        title: 'Neural Architecture Search Compression',
        item_text:
          'Derived from Llama 3.1 405B via NAS, significantly reducing memory footprint and inference latency while preserving frontier-level task accuracy.',
      },
      {
        title: 'Switchable Reasoning On/Off Mode',
        item_text:
          'A system-prompt toggle enables or disables chain-of-thought reasoning, letting you trade analytical depth against response speed per request.',
      },
      {
        title: 'FFN Fusion for Reduced Inference Latency',
        item_text:
          'Consecutive skip-attention layers are fused into wider FFN layers, delivering significant speed gains over a standard dense transformer of similar scale.',
      },
      {
        title: 'Native Function Calling and Tool Use',
        item_text:
          'Structured tool use is built in out of the box, enabling reliable agentic pipelines, RAG integration, and multi-step orchestration workflows.',
      },
      {
        title: 'Eight-Language Multilingual Capability',
        item_text:
          'Strong performance in English plus German, French, Italian, Portuguese, Hindi, Spanish, and Thai, covering major global enterprise deployment markets.',
      },
    ],
    modelLogo: 'nemotron',
    inputModes: [{ label: 'Text', description: TEXT_INPUT_DESCRIPTION }],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 128,
    isServerless: true,
    parametersB: 253,
    priceInputCachedPerMillion: 0.2,
    priceInputPerMillion: 0.4,
    priceOutputPerMillion: 1.2,
    providerLogo: 'nvidia',
    providerName: 'NVIDIA',
    releasedAt: '2025-04-07',
    title: 'Nemotron Ultra 253B',
    updatedAt: '2025-07-10',
    supportedLanguages: [
      'English',
      'French',
      'German',
      'Hindi',
      'Italian',
      'Portuguese',
      'Spanish',
      'Thai',
    ],
    useCaseTags: [
      {
        label: 'Advanced Reasoning',
        description:
          'Switchable chain-of-thought for complex math, science, and analytical tasks',
      },
      {
        label: 'Coding',
        description:
          'Code generation, debugging, and instruction-following engineering tasks',
      },
      {
        label: 'AI Agent',
        description:
          'Agentic pipelines with native function calling and RAG integration',
      },
    ],
  },

  'llama-3.3-70b-instruct': {
    description:
      "Meta's 70B instruction-tuned model optimised for complex reasoning and multilingual instruction following.",
    descriptionLong:
      "Llama 3.3 70B Instruct is Meta's production-grade 70B instruction-tuned model, delivering strong performance on complex reasoning, code generation, and multilingual tasks. Built on Meta's Llama 3.3 architecture with a 128K context window, it is optimised for instruction following, agentic workflows, and general-purpose chat. Its open-weights release makes it a popular foundation for fine-tuning and enterprise deployment.",
    descriptionShort:
      "Meta's production 70B model with 128K context, strong reasoning, and broad multilingual instruction following.",
    highlights: [
      {
        title: '70B Parameters with 128K Context Window',
        item_text:
          'Handles long documents, extended conversations, and large codebases with faithful recall across up to 128,000 tokens per request.',
      },
      {
        title: 'Strong Instruction-Following Performance',
        item_text:
          'Fine-tuned specifically for instruction following, achieving high scores on IFEval and complex multi-turn dialogue benchmarks.',
      },
      {
        title: 'Open Weights for Custom Fine-Tuning',
        item_text:
          "Released under Meta's community licence, enabling organisations to fine-tune on proprietary data and deploy on their own infrastructure.",
      },
      {
        title: 'Broad Multilingual Capability',
        item_text:
          'Trained on multilingual data covering English, Spanish, German, French, Italian, Portuguese, Hindi, and other major world languages.',
      },
    ],
    modelLogo: 'metaLlama',
    inputModes: [{ label: 'Text', description: TEXT_INPUT_DESCRIPTION }],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 128,
    isServerless: true,
    parametersB: 70,
    priceInputCachedPerMillion: 0.1,
    priceInputPerMillion: 0.2,
    priceOutputPerMillion: 0.5,
    providerLogo: 'meta',
    providerName: 'Meta',
    releasedAt: '2024-12-06',
    title: 'Llama 3.3 70B Instruct',
    updatedAt: '2024-12-06',
    supportedLanguages: [
      'Arabic',
      'Chinese',
      'English',
      'French',
      'German',
      'Hindi',
      'Italian',
      'Japanese',
      'Korean',
      'Portuguese',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Chatbots',
        description:
          'Build conversational AI applications with multi-turn dialogue',
      },
      {
        label: 'Advanced Reasoning',
        description:
          'Complex reasoning, analysis, and instruction-following tasks',
      },
      {
        label: 'Coding',
        description:
          'Code generation, completion, and debugging across popular languages',
      },
    ],
  },

  'deepseek-r1-0528': {
    description:
      "DeepSeek's open-source reasoning model with chain-of-thought thinking and strong performance on math and code.",
    descriptionLong:
      "DeepSeek R1 is DeepSeek's open-source reasoning-focused model, delivering strong performance on complex mathematical, scientific, and coding tasks through extended chain-of-thought thinking. With 67B parameters and a 64K context window, it applies deep step-by-step reasoning before producing answers. Open weights and competitive benchmark results make it a popular choice for research and production reasoning workloads.",
    descriptionShort:
      'Open-source reasoning model with chain-of-thought thinking and strong math, science, and coding performance.',
    highlights: [
      {
        title: 'Chain-of-Thought Reasoning by Default',
        item_text:
          'Applies extended step-by-step thinking before answering, enabling deep analysis of complex math, science, and programming problems.',
      },
      {
        title: 'Open-Source with Competitive Benchmarks',
        item_text:
          'Released as open weights, matching closed-source models on AIME, MATH-500, and coding benchmarks at a fraction of the cost.',
      },
      {
        title: 'Strong Code Generation and Debugging',
        item_text:
          'Excels at multi-step code generation, bug analysis, and algorithmic problem-solving across popular programming languages.',
      },
      {
        title: 'Efficient 67B Architecture',
        item_text:
          '67B parameters deliver frontier reasoning quality with lower resource requirements than larger models, suitable for self-hosted deployment.',
      },
    ],
    modelLogo: 'deepseek',
    inputModes: [{ label: 'Text', description: TEXT_INPUT_DESCRIPTION }],
    outputModes: [{ label: 'Text', description: TEXT_OUTPUT_DESCRIPTION }],
    contextLengthK: 64,
    isServerless: true,
    parametersB: 67,
    priceInputCachedPerMillion: 0.1,
    priceInputPerMillion: 0.2,
    priceOutputPerMillion: 0.5,
    providerLogo: 'deepseek',
    providerName: 'DeepSeek',
    releasedAt: '2025-05-28',
    title: 'DeepSeek R1',
    updatedAt: '2025-05-28',
    supportedLanguages: [
      'Chinese',
      'English',
      'French',
      'German',
      'Japanese',
      'Korean',
      'Portuguese',
      'Russian',
      'Spanish',
    ],
    useCaseTags: [
      {
        label: 'Advanced Reasoning',
        description:
          'Deep chain-of-thought analysis for math, science, and logic problems',
      },
      {
        label: 'Coding',
        description:
          'Multi-step code generation, algorithmic problem-solving, and debugging',
      },
    ],
  },
};
