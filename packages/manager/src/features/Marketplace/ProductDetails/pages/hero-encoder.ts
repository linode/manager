/**
 * Product tab details for slug hero-encoder.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
## HERO Encoder Overview

Media Excel’s HERO is a high-performance video encoding and transcoding platform designed for live and file-based media workflows. It enables broadcasters, OTT platforms, and service providers to deliver premium video quality while reducing distribution, compute, and storage costs.

The HERO platform supports a wide range of codecs, including AVC, HEVC, AV1, and VVC, and is built for low latency streaming using modern protocols such as CMAF-CTE for HLS and DASH. Media Excel’s AI-powered DIVA optimization dynamically improves visual quality and reduces bitrate without requiring changes to downstream infrastructure. Our HERO ClearEdge preprocessing feature further enhances video quality.

HERO can be deployed on Akamai Connected Cloud or hybrid environments, making it well-suited for cost-sensitive streaming, sports, broadcast distribution, and large-scale media delivery use cases.

### Key features

- **AI Enabled video quality and bit rate optimization:** Reduce CDN and cloud egress costs by 15–30 percent using content-aware AI processing without any loss in picture quality. In addition, DIVA can be implemented without any changes in codecs or workflows.
- **Carrier-grade reliability:** Enable five-nines reliability with centralized monitoring, redundant network paths, and support for hitless IP workflows using standards such as SMPTE ST 2022-7.
- **Multi-output encoding from a single input:** Generate multiple output streams from a single live or file-based input, including HLS, DASH, CMAF, RTMP, and SRT. Support parallel delivery to multiple workflows including broadcast, OTT, and social media platforms.
- **Full codec support:** Encode and transcode AVC, HEVC, AV1, and VVC for live and file-based workflows.
- **High density software coding efficiency:** Maximize channel density per instance using optimized GPU and CPU utilization.
- **Lower total cost of ownership:** Achieve up to 20–30 percent reduction in total cost of ownership by lowering software licensing costs across live and VOD workflows.

### Use cases

**Live ABR encoding for broadcast headends**

Enable carrier-grade live ABR encoding for primary broadcast distribution. HERO supports high-density, multi-profile ABR ladders with low latency for HLS and DASH using CMAF-CTE, while maintaining broadcast-grade reliability and redundancy.

**VOD ABR encoding for broadcast libraries**

Efficiently encode large VOD libraries into optimized ABR ladders for OTT and TV Everywhere services with up to 11x RTF. AI-powered DIVA optimization reduces storage and CDN costs while maintaining consistent visual quality across devices and bitrates.

**Unified live and VOD workflows**

Deploy a single encoding platform to support both live linear channels and file-based VOD workflows, with the ability to distribute to multiple downstream platforms from a single encode stream. HERO simplifies operations by using a common management plane, codec set, and deployment model across broadcast and OTT services.

**Satellite replacement for primary distribution**

Replace or augment satellite-based distribution with IP-based ABR encoding for delivery to MVPDs, affiliates, and regional headends. HERO reduces distribution costs while preserving consistent video quality and deterministic latency across large channel lineups.

Ready to reduce the cost of your encoding workflow by 30% on Akamai Connected Cloud without compromising video quality? Contact the Media Excel team to discuss your workflow requirements and deployment options. Free demo licenses for proof-of-concept evaluations and guided onboarding are available.
`.trim();

const documentationMarkdown = `
## Documentation

| Specification | Details |
| :---- | :---- |
| **Deployment Model** | Cloud, Hybrid, On-prem |
| **Supported Input Codecs** | MPEG-2, AVC (H.264), HEVC (H.265), ProRes, JPEG-2000, MXF and common mezzanine formats (file workflows) |
| **Input Interfaces** | IP, MPEG-TS over UDP/RTP, SRT, RTMP, SDI (via supported I/O),  file-based ingest |
| **Supported Output Formats/Protocols** | HLS, DASH, CMAF (including CMAF-CTE), RTMP, SRT, MPEG-TS over UDP/RTP |
| **Supported Output Codecs** | AVC (H.264), HEVC (H.265), AV1, VVC |
| **ABR Capabilities** | Multi-profile ABR ladder generation with multiple simultaneous outputs from a single input up to 2160/p60. |
| **Audio Support** | AAC, multi-channel audio, audio pass-through, subtitle and caption support. |
| **AI Optimization** | DIVA AI-based perceptual optimization for bitrate reduction or visual quality improvement. |
| **Advertising Support** | SCTE-35/104 for live and VOD streams. CableLabs ESAM compliant. |
| **Redundancy and Reliability** | Designed for five-nines availability with N+1, N+M, and 1+1 redundancy models, and support for hitless switching with SMPTE ST 2022-7. |
| **Management & Control** | Centralized HERO Management System (HMS), REST APIs, web-based UI, monitoring and alarms |

### HERO Workflow Management

![HERO Workflow Management](/assets/marketplace/me-workflow-mgmt.jpeg)

Media Excel HERO supports end-to-end live and file-based media workflows, from ingestion and transcoding through management, monetization, and delivery. The platform enables multi-rate, multiscreen adaptive outputs for both live and VOD services, centrally managed and monitored within a unified control plane.

HERO is pre-integrated with a broad ecosystem of media technology partners, including DRM providers, ad servers, forensic watermarking solutions, and CDN platforms such as Akamai. These integrations allow broadcasters, operators, and content owners to rapidly deploy production-ready workflows, reducing integration effort, accelerating time to service, and enabling flexible scaling across broadcast, OTT, and multiscreen distribution environments.
`.trim();

const pricingMarkdown = `
## Pricing

Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
## Support

For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const heroEncoder: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
