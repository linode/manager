/**
 * Product tab details for slug norsk-studio.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Norsk Studio is a live video and audio streaming workflow server with a graphical drag-and-drop UI that delivers the essentials for implementing high-quality streaming workflows. It is a unique drag-and-drop platform for designing, deploying, and controlling broadcast-quality live streaming workflows. Ingest from any source, encode, package, and deliver to any destination - all from a visual interface.

Norsk Studio empowers you to deliver compelling, custom, fault-tolerant, and monetizable live events and channels with the best quality available in a fraction of the time and cost normally required.

Ideal for live event producers, broadcasters and media companies, streaming service operators, and video developers and systems integrators.

* **Broad codec and format support:** Supports all common inputs and outputs, plus direct publishing to YouTube, Twitch, and other social platforms.
* **Wide range of production processors:** Onscreen graphic, browser overlay, picture-in-picture, automatic or operator-controlled source switching, live-to-VOD, ABR ladder, third-party DRM.
* **Flexible deployment:** Spin up directly on Akamai Cloud Compute or in a Docker or Kubernetes environment on your own Akamai Cloud Compute instance.
* **OpenAPI support:** Iterate and make changes programmatically at runtime in our built-in documentation interface or the OpenAPI interface of your choice.
* **Rich monitoring and reporting:** All workflows can be explored in detail using the Norsk Visualizer. Norsk Studio also supports OpenTelemetry and Fluent Bit.
* **Multimodal, multimodel AI support:** Use any major LLM or Norsk Studio's own MCPs to both create and control live production workflows and create custom dashboards.

### Use cases

**Live event production**

Sports, esports, concerts, conferences, and worship services. Multi-camera production with source switching, graphics, and real-time monitoring.

**Broadcast workflows**

Build and operate custom streaming services with full ABR ladders, DRM, subtitles, and delivery to CDNs and social platforms.

**Operator implementation**

Run thousands of concurrent channels with fault-tolerant infrastructure, automated scaling, and per-event flexibility.

Want to create and iterate customizable live streaming workflows in a fraction of the time and cost typically required? Get in touch with our team to share your unique requirements and see how straightforward it is to build workflows in Norsk Studio and learn about onboarding support with our Kickstart package.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment model** | Cloud, on-prem, hybrid |
| **Supported inputs** | RTMP, SRT, WebRTC, NDI, SDI/HDMI via DeckLink, SMPTE ST 2110 |
| **Supported outputs** | HLS, DASH, CMAF, WebRTC, RTMP (YouTube, Twitch, LinkedIn Live) |
| **Codec support** | H.264, H.265/HEVC, AV1, AAC, Opus |
| **Latency** | Workflow-dependent: sub-second with WebRTC/SRT; 2\u20136s with low-latency HLS; standard HLS per CDN configuration |
| **AI integration** | Model Context Protocol (MCP) server for AI-assisted workflow control; compatible with OpenAI, Gemini, and Anthropic |
| **Security** | TLS 1.3 in transit; runs within customer-controlled cloud VPC or on-premises infrastructure |
| **License model** | Subscription-based (per channel, or enterprise) |

![Norsk Platform Architecture](/assets/marketplace/norsk_platform_architecture.svg)

![Norsk Process Flow](/assets/marketplace/norsk_process_flow.svg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const norskStudio: ProductTabDetails = {
  documentation: documentationMarkdown,
  overview: overviewMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
