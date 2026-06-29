# Qwen3 8B (qwen3-8b)

**Provider:** Alibaba / Qwen Team  
**Released:** 2025-04-29 [[1]](#ref-1)  
**License:** Apache 2.0 [[1]](#ref-1)

---

## Overview

Qwen3 8B is a dense instruction-tuned model from Alibaba's Qwen team. It delivers strong performance on reasoning, coding, and mathematics while remaining highly efficient for deployment. Like all Qwen3 dense models, it features a **hybrid thinking system**: a single model that seamlessly switches between a step-by-step reasoning mode (for math, coding, and complex logic) and a fast non-thinking mode (for general dialogue and simpler tasks). [[1]](#ref-1) [[2]](#ref-2)

---

## Architecture [[3]](#ref-3) [[2]](#ref-2)

| Property | Value |
|---|---|
| Architecture | Dense Transformer |
| Total Parameters | 8.2B |
| Non-Embedding Parameters | 6.95B |
| Layers | 36 |
| Attention Heads (GQA) | 32 for Q, 8 for KV |
| Context Length | 32K tokens natively; 128K tokens with YaRN [[3]](#ref-3) [[2]](#ref-2) |
| Supported Modalities | Text only |

---

## Capabilities [[1]](#ref-1) [[2]](#ref-2)

| Capability | Notes |
|---|---|
| **Chat** | Instruction-tuned for conversational use in both thinking and non-thinking modes |
| **Reasoning** | Built-in thinking mode with step-by-step chain-of-thought via `<think>...</think>` blocks |
| **Coding** | Code generation, completion, and debugging |
| **Math** | Strong performance on mathematical reasoning and problem solving |
| **Function Calling** | Native tool use support for agentic workflows, including MCP |
| **Multilingual** | 100+ languages and dialects |

---

## Use Case Tags

`AI Agents` · `Coding` · `Math`

---

## Pricing

| | Per 1M tokens |
|---|---|
| Input | $0.10 |
| Output | $0.30 |

**Serverless:** Yes

---

## Supported Languages (119 total) [[1]](#ref-1)

Afrikaans, Arabic, Armenian, Assamese, Asturian, Awadhi, Balinese, Banjar, Bashkir, Basque, Belarusian, Bengali, Bhojpuri, Bosnian, Bulgarian, Burmese, Catalan, Cebuano, Chhattisgarhi, Chinese, Croatian, Czech, Danish, Dari, Dutch, Eastern Yiddish, English, Estonian, Faroese, Finnish, French, Friulian, Galician, Georgian, German, Greek, Gujarati, Haitian, Hebrew, Hindi, Hungarian, Icelandic, Iloko, Indonesian, Irish, Italian, Japanese, Javanese, Kabuverdianu, Kannada, Kazakh, Khmer, Korean, Lao, Latvian, Ligurian, Limburgish, Lithuanian, Lombard, Luxembourgish, Macedonian, Magahi, Maithili, Malay, Malayalam, Maltese, Marathi, Minangkabau, Nepali, North Azerbaijani, Northern Uzbek, Norwegian Bokmål, Norwegian Nynorsk, Occitan, Oriya, Pangasinan, Papiamento, Persian, Polish, Portuguese, Punjabi, Romanian, Russian, Sardinian, Serbian, Sicilian, Silesian, Sindhi, Sinhala, Slovak, Slovenian, Spanish, Sundanese, Swahili, Swedish, Tagalog, Tajik, Tamil, Tatar, Telugu, Thai, Tok Pisin, Tosk Albanian, Turkish, Ukrainian, Urdu, Venetian, Vietnamese, Waray, Welsh

---

## Benchmark Highlights [[1]](#ref-1) [[2]](#ref-2)

| Benchmark | Notes |
|---|---|
| General Reasoning | Surpasses previous Qwen2.5-Instruct models in non-thinking mode on commonsense reasoning |
| Math | Exceeds QwQ-32B in thinking mode on mathematical benchmarks |
| Coding | Top open-source performance for its parameter count on code generation tasks |
| Agent Tasks | Leading performance among open-source models on complex agentic benchmarks |

---

## Best Practices [[3]](#ref-3)

- **Thinking mode** (default): `Temperature=0.6`, `TopP=0.95`, `TopK=20`, `MinP=0` — do **not** use greedy decoding
- **Non-thinking mode**: `Temperature=0.7`, `TopP=0.8`, `TopK=20`, `MinP=0`
- **Endless repetitions:** Set `presence_penalty=1.5` if the model loops
- **Max output length:** 32,768 tokens for most tasks; up to 38,912 for complex math/coding competitions
- **Multi-turn:** Do not include `<think>...</think>` content from previous turns in conversation history
- **Dynamic switching:** Use `/think` or `/no_think` in user messages to toggle modes per turn

---

## Hyperparameters [[3]](#ref-3) [[2]](#ref-2)

### Text Generation

| Parameter | Type | Thinking Mode Default | Non-Thinking Mode Default | Range | Description |
|---|---|---|---|---|---|
| `temperature` | `float` | `0.6` | `0.7` | `0.0 – 2.0` | Controls randomness. Higher values produce more varied output; lower values are more focused. **Do not use greedy decoding (`0.0`)** in thinking mode — it causes repetition and performance degradation. |
| `top_p` | `float` | `0.95` | `0.8` | `0.0 – 1.0` | Nucleus sampling. Samples from the smallest set of tokens whose cumulative probability meets this threshold. Lower values restrict output to higher-probability tokens. |
| `top_k` | `int` | `20` | `20` | `1 – ∞` | Limits sampling to the top-K most probable tokens. `0` disables this filter. The recommended value of `20` keeps generation focused without being overly restrictive. |
| `min_p` | `float` | `0.0` | `0.0` | `0.0 – 1.0` | Minimum probability threshold. Tokens with a probability below `min_p × (probability of top token)` are excluded. `0.0` disables the filter. |
| `presence_penalty` | `float` | `0.0` | `0.0` | `0.0 – 2.0` | Penalises any token that has appeared at least once in the context, regardless of frequency. Set to `1.5` if the model produces endless repetitions. Note: very high values may cause language mixing or slight quality degradation. |
| `frequency_penalty` | `float` | `0.0` | `0.0` | `0.0 – 2.0` | Penalises tokens in proportion to how many times they have already appeared. Similar to `presence_penalty` but proportional to frequency rather than binary. |
| `max_new_tokens` | `int` | `32768` | `32768` | `1 – 131072` | Maximum tokens to generate in a single response (not counting input tokens). Use `38912` for demanding math or competitive coding benchmarks. |
| `repetition_penalty` | `float` | `1.0` | `1.0` | `1.0 – 2.0` | Alternative to `presence_penalty` used by some frameworks (e.g. llama.cpp). Multiplies the logit of already-seen tokens. `1.0` means no penalty. |
| `stop_sequences` | `list[str]` | `["</think>"]` | `[]` | — | Strings that immediately halt generation when produced. The default `</think>` end-of-thought token is handled automatically by most frameworks. |
| `seed` | `int` | `null` | `null` | any integer | Fix the random seed for reproducible outputs. Leave unset for non-deterministic generation. |

### Thinking Mode Control

| Parameter | Type | Default | Description |
|---|---|---|---|
| `enable_thinking` | `bool` | `true` | Set in `tokenizer.apply_chat_template()`. When `true`, the model reasons step-by-step inside `<think>...</think>` before answering. When `false`, the model skips the thinking block and responds immediately (non-thinking mode). |
| `/think` inline tag | user message suffix | — | Soft switch. Append `/think` to a user message to enable thinking for that turn, overriding the current mode. |
| `/no_think` inline tag | user message suffix | — | Soft switch. Append `/no_think` to a user message to disable thinking for that turn. |

### Long Context (YaRN)

| Parameter | Type | Suggested Value | Description |
|---|---|---|---|
| `rope_scaling.rope_type` | `string` | `"yarn"` | Enables YaRN positional interpolation to extend context beyond the native 32K limit. |
| `rope_scaling.factor` | `float` | `4.0` (for 128K) | Scaling factor relative to native context. Use `2.0` for 65K, `4.0` for 128K. |
| `rope_scaling.original_max_position_embeddings` | `int` | `32768` | Must match the model's native context length. |
| `max_model_len` | `int` | `131072` | Total context window when YaRN is active (input + output). Only override when long context is actually needed — YaRN can degrade performance on short inputs. |

---

## Links

- [Hugging Face](https://huggingface.co/Qwen/Qwen3-8B)
- [Qwen3 Blog](https://qwenlm.github.io/blog/qwen3/)
- [Technical Report](https://arxiv.org/abs/2505.09388)
- [GitHub](https://github.com/QwenLM/Qwen3)
- [Qwen Chat](https://chat.qwen.ai/)

---

## References

<a id="ref-1"></a>**[1]** Qwen Team — *Qwen3: Think Deeper, Act Faster* (Blog Post, April 2025)  
https://qwenlm.github.io/blog/qwen3/

<a id="ref-2"></a>**[2]** Qwen Team — *Qwen3 Technical Report* (arXiv:2505.09388, May 2025)  
https://arxiv.org/abs/2505.09388

<a id="ref-3"></a>**[3]** Qwen Team — *Qwen3-8B Model Card* (Hugging Face)  
https://huggingface.co/Qwen/Qwen3-8B
