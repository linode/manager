# Qwen3 Embedding 4B (qwen3-embedding-4b)

**Provider:** Alibaba / Qwen Team  
**Released:** 2025-06-05 [[1]](#ref-1)  
**License:** Apache 2.0 [[1]](#ref-1)

---

## Overview

Qwen3 Embedding 4B is a state-of-the-art multilingual text embedding model from Alibaba's Qwen team, built on the Qwen3-4B foundation model. It is specifically designed for text retrieval, semantic search, clustering, classification, and bitext mining tasks. It supports **Matryoshka Representation Learning (MRL)**, allowing flexible output dimension selection from 32 to 2560 to trade off between efficiency and accuracy. Both query and document encoding support **user-defined instructions** to boost task-specific performance. [[1]](#ref-1) [[2]](#ref-2)

---

## Architecture [[3]](#ref-3) [[1]](#ref-1)

| Property | Value |
|---|---|
| Architecture | Dense Transformer (LoRA fine-tuned from Qwen3-4B-Base) |
| Encoder Type | Single encoder (dual-encoder retrieval) — last `[EOS]` token pooling |
| Total Parameters | 4B |
| Layers | 36 |
| Context Length | 32K tokens [[3]](#ref-3) |
| Embedding Dimension | Up to 2560 (MRL: user-configurable from 32 to 2560) [[3]](#ref-3) |
| MRL Support | Yes |
| Instruction Aware | Yes |
| Supported Modalities | Text only |

---

## Capabilities [[1]](#ref-1) [[2]](#ref-2)

| Capability | Notes |
|---|---|
| **Text Retrieval** | Semantic search over dense vector indexes; strong on both English and multilingual corpora |
| **Code Retrieval** | Cross-lingual and code-to-code retrieval across programming languages |
| **Text Classification** | Embedding-based classification for downstream classifiers |
| **Text Clustering** | Cluster documents by semantic similarity |
| **Bitext Mining** | Identify parallel sentences across languages for translation or alignment tasks |
| **Multilingual** | 100+ languages and dialects, including programming languages |

---

## Use Case Tags

`Bitext Mining` · `Code Retrieval` · `Text Classification` · `Text Clustering` · `Text Retrieval`

---

## Pricing

| | Per 1M tokens |
|---|---|
| Input | $0.03 |
| Output | $0.00 |

**Serverless:** No

---

## Supported Languages (100+ total) [[1]](#ref-1)

Afrikaans, Arabic, Armenian, Assamese, Asturian, Awadhi, Balinese, Banjar, Bashkir, Basque, Belarusian, Bengali, Bhojpuri, Bosnian, Bulgarian, Burmese, Catalan, Cebuano, Chhattisgarhi, Chinese, Croatian, Czech, Danish, Dari, Dutch, Eastern Yiddish, English, Estonian, Faroese, Finnish, French, Friulian, Galician, Georgian, German, Greek, Gujarati, Haitian, Hebrew, Hindi, Hungarian, Icelandic, Iloko, Indonesian, Irish, Italian, Japanese, Javanese, Kabuverdianu, Kannada, Kazakh, Khmer, Korean, Lao, Latvian, Ligurian, Limburgish, Lithuanian, Lombard, Luxembourgish, Macedonian, Magahi, Maithili, Malay, Malayalam, Maltese, Marathi, Minangkabau, Nepali, North Azerbaijani, Northern Uzbek, Norwegian Bokmål, Norwegian Nynorsk, Occitan, Oriya, Pangasinan, Papiamento, Persian, Polish, Portuguese, Punjabi, Romanian, Russian, Sardinian, Serbian, Sicilian, Silesian, Sindhi, Sinhala, Slovak, Slovenian, Spanish, Sundanese, Swahili, Swedish, Tagalog, Tajik, Tamil, Tatar, Telugu, Thai, Tok Pisin, Tosk Albanian, Turkish, Ukrainian, Urdu, Venetian, Vietnamese, Waray, Welsh

---

## Benchmark Highlights [[3]](#ref-3) [[1]](#ref-1)

| Benchmark | Score | Notes |
|---|---|---|
| MTEB Multilingual | 69.45 | Ranks No.2 in the series; outperforms GritLM-7B (7B) at 4B parameters |
| MTEB English v2 | 74.60 | Surpasses gemini-embedding-exp-03-07 and all open models ≤7B |
| C-MTEB Chinese | 72.27 | Competitive with gte-Qwen2-7B-instruct despite 2× fewer parameters |

---

## Best Practices [[3]](#ref-3)

- **Always use an instruction on the query side** — improves retrieval performance by 1–5% vs. no instruction. Write instructions in English even for multilingual tasks.
- **No instruction needed on the document side** — only queries benefit from task-specific instructions.
- **Instruction format:** `Instruct: {task_description}\nQuery: {query}`
- **MRL dimensions:** Use the full 2560 dimensions for maximum accuracy; reduce to 512 or 256 for memory-/speed-constrained deployments with minimal quality loss.
- **Normalise embeddings** before computing cosine similarity (call `F.normalize(..., p=2, dim=1)` with PyTorch or use sentence-transformers which normalises automatically).
- **Flash Attention 2:** Enable for better throughput and lower memory: `attn_implementation="flash_attention_2"` with `padding_side="left"`.

---

## Hyperparameters [[3]](#ref-3)

### Encoding

| Parameter | Type | Default | Range | Description |
|---|---|---|---|---|
| `max_length` | `int` | `32768` | `1 – 32768` | Maximum input token length. Inputs are truncated to this value. Lower values reduce memory and latency. |
| `batch_size` | `int` | framework default | `1 – ∞` | Number of texts encoded per forward pass. Larger batches improve GPU utilisation but require more VRAM. |
| `prompt_name` | `str` | `"query"` | any registered prompt name | Sentence-transformers shortcut for applying the built-in query instruction. Use `"query"` for queries; omit for documents. |
| `normalize_embeddings` | `bool` | `true` | `true / false` | Whether to L2-normalise output vectors. Must be `true` for cosine similarity. Sentence-transformers enables this by default. |

### Matryoshka Representation Learning (MRL)

| Parameter | Type | Default | Supported Values | Description |
|---|---|---|---|---|
| `output_dim` / `truncate_dim` | `int` | `2560` (full) | `32, 64, 128, 256, 512, 1024, 2560` | Truncates the output embedding to the specified dimension. Smaller values reduce storage and ANN index size. A dimension of `512` retains most retrieval quality. |

### vLLM

| Parameter | Type | Value | Description |
|---|---|---|---|
| `task` | `str` | `"embed"` | Must be set to `"embed"` when loading the model with vLLM for embedding inference. |

---

## Links

- [Hugging Face](https://huggingface.co/Qwen/Qwen3-Embedding-4B)
- [Qwen3 Embedding Blog](https://qwenlm.github.io/blog/qwen3-embedding/)
- [Technical Report](https://arxiv.org/abs/2506.05176)
- [GitHub](https://github.com/QwenLM/Qwen3-Embedding)

---

## References

<a id="ref-1"></a>**[1]** Qwen Team — *Qwen3 Embedding: Advancing Text Embedding and Reranking Through Foundation Models* (Blog Post, June 2025)  
https://qwenlm.github.io/blog/qwen3-embedding/

<a id="ref-2"></a>**[2]** Zhang et al. — *Qwen3 Embedding Technical Report* (arXiv:2506.05176, June 2025)  
https://arxiv.org/abs/2506.05176

<a id="ref-3"></a>**[3]** Qwen Team — *Qwen3-Embedding-4B Model Card* (Hugging Face)  
https://huggingface.co/Qwen/Qwen3-Embedding-4B
