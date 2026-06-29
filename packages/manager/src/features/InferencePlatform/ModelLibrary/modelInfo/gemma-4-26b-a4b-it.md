# Gemma 4 26B (gemma-4-26b-a4b-it)

**Provider:** Google DeepMind  
**Released:** 2025-04-10 [[1]](#ref-1)  
**License:** Apache 2.0 [[1]](#ref-1)

---

## Overview

Gemma 4 26B is a Mixture-of-Experts (MoE) instruction-tuned model from Google DeepMind. Its "A4B" designation means only 3.8B parameters are active during inference out of 25.2B total, making it run almost as fast as a 4B model while delivering quality comparable to a full 26B dense model. [[1]](#ref-1) [[2]](#ref-2)

---

## Architecture [[1]](#ref-1)

| Property | Value |
|---|---|
| Architecture | Mixture-of-Experts (MoE) [[1]](#ref-1) [[2]](#ref-2) |
| Total Parameters | 25.2B |
| Active Parameters | 3.8B (A4B) |
| Layers | 30 |
| Sliding Window | 1024 tokens |
| Context Length | 256K tokens [[1]](#ref-1) |
| Vocabulary Size | 262K |
| Experts | 8 active / 128 total + 1 shared |
| Vision Encoder | ~550M parameters |
| Supported Modalities | Text, Image *(no audio — audio is E2B/E4B only)* |

---

## Capabilities [[1]](#ref-1) [[2]](#ref-2)

| Capability | Notes |
|---|---|
| **Chat** | Instruction-tuned for conversational use |
| **Vision** | Object detection, image analysis, OCR, chart comprehension, document/PDF parsing, screen/UI understanding, handwriting recognition |
| **Video** | Frame-by-frame video understanding (up to 60s at 1fps) |
| **Coding** | Code generation, completion, and correction |
| **Reasoning** | Built-in thinking mode with step-by-step reasoning via `<\|think\|>` token |
| **Function Calling** | Native structured tool use for agentic workflows |
| **Long Context** | 256K token context window |
| **Multilingual** | 35+ languages out-of-the-box, pre-trained on 140+ |

---

## Use Case Tags

`AI Agents` · `Coding` · `Vision Tasks`

---

## Pricing

| | Per 1M tokens |
|---|---|
| Input | $0.20 |
| Output | $0.50 |

**Serverless:** Yes

---

## Supported Languages [[1]](#ref-1)

Afrikaans, Arabic, Armenian, Assamese, Bengali, Bulgarian, Catalan, Chinese, Croatian, Czech, Danish, Dutch, English, Estonian, Faroese, Finnish, French, Galician, Georgian, German, Greek, Gujarati, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Irish, Italian, Japanese, Kannada, Kazakh, Korean, Latvian, Lithuanian, Macedonian, Malay, Malayalam, Maltese, Marathi, Nepali, Norwegian, Oromo, Persian, Polish, Portuguese, Punjabi, Romanian, Russian, Serbian, Sinhala, Slovak, Slovenian, Spanish, Swahili, Swedish, Tamil, Telugu, Thai, Turkish, Ukrainian, Urdu, Uzbek, Vietnamese, Welsh, Yoruba

*(35+ languages out-of-the-box; pre-trained on 140+ languages)*

---

## Benchmark Highlights [[1]](#ref-1)

| Benchmark | Score |
|---|---|
| MMLU Pro | 82.6% |
| AIME 2026 (no tools) | 88.3% |
| LiveCodeBench v6 | 77.1% |
| GPQA Diamond | 82.3% |
| MMMU Pro (multimodal) | 73.8% |
| MMMLU (multilingual) | 86.3% |
| τ²-bench (agentic tool use) | 85.5% |

---

## Best Practices [[1]](#ref-1)

- **Sampling:** `temperature=1.0`, `top_p=0.95`, `top_k=64`
- **Thinking mode:** Include `<|think|>` at the start of the system prompt to enable step-by-step reasoning
- **Multimodal inputs:** Place image content *before* text in the prompt for best results
- **Multi-turn:** Do not include thought blocks from previous turns in conversation history

---

## Hyperparameters [[1]](#ref-1)

### Text Generation

| Parameter | Type | Recommended Default | Range | Description |
|---|---|---|---|---|
| `temperature` | `float` | `1.0` | `0.0 – 2.0` | Controls randomness. Higher values produce more varied output; lower values make output more deterministic. Do not use `0.0` (greedy decoding) as it can cause repetition. |
| `top_p` | `float` | `0.95` | `0.0 – 1.0` | Nucleus sampling. The model samples from the smallest set of tokens whose cumulative probability exceeds this value. Lower values restrict output to higher-probability tokens. |
| `top_k` | `int` | `64` | `1 – ∞` | Limits the candidate pool to the top-K tokens by probability before sampling. Lower values reduce diversity; `0` disables this filter. |
| `max_new_tokens` | `int` | `8192` | `1 – 262144` | Maximum number of tokens the model will generate in a single response. Does not include input tokens. |
| `repetition_penalty` | `float` | `1.0` | `1.0 – 2.0` | Penalises tokens that have already appeared in the context. Values above `1.0` discourage repetition; `1.0` means no penalty. |
| `stop_sequences` | `list[str]` | `[]` | — | One or more strings that, when generated, immediately halt generation. Useful for structured outputs or turn-based formats. |
| `seed` | `int` | `null` | any integer | Fix the random seed for reproducible outputs. Leave unset for non-deterministic generation. |

### Vision (Image Inputs)

| Parameter | Type | Recommended Default | Options | Description |
|---|---|---|---|---|
| `image_token_budget` | `int` | `560` | `70, 140, 280, 560, 1120` | Controls how many tokens are used to represent each input image. Higher budgets preserve more visual detail (better for OCR, document parsing, small text) at the cost of additional compute. Lower budgets are suitable for classification, captioning, or multi-frame video. |

### Thinking Mode

| Parameter | Type | Default | Description |
|---|---|---|---|
| Thinking trigger | system prompt token | off | Prepend `<\|think\|>` to the system prompt to enable step-by-step internal reasoning before the final answer. Remove it to disable. When disabled, the model still emits empty `<\|channel\|>` tags. |

---

## Links

- [Model Card](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Hugging Face](https://huggingface.co/google/gemma-4-26b-it)
- [Google AI Studio](https://aistudio.google.com/)
- [DeepMind Gemma 4 Page](https://deepmind.google/models/gemma/gemma-4/)

---

## References

<a id="ref-1"></a>**[1]** Google DeepMind — *Gemma 4 Model Card*  
https://ai.google.dev/gemma/docs/core/model_card_4

<a id="ref-2"></a>**[2]** Google DeepMind — *Gemma 4 Product Page*  
https://deepmind.google/models/gemma/gemma-4/

<a id="ref-3"></a>**[3]** Google — *Gemma 4 Launch Blog Post*  
https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
