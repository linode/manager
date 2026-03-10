/**
 * Product tab details for slug vod-encoder.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Bitmovin's VOD Encoder is a fully managed SaaS solution that uses distributed processing and content-aware encoding to scale quickly and make content available in the highest quality at the lowest bitrates with the fastest turnaround times. 

With features like Per-Title, Per-Shot, and Multi-Pass encoding, Bitmovin enables video streaming companies to be more cost-efficient while providing an optimal viewing experience. It supports multiple codecs, including AV1, VP9, HEVC/H.265, and H.264, and can integrate with a range of DRMs to encode and secure content up to 8K UHD with HDR, including Dolby Vision.

### Key features
- **Content-aware optimization:** Reduce total cost of ownership without sacrificing video quality through Per-Title and Per-Scene encoding that adapts bitrate ladders to each piece of content.
- **Cost-efficient, universal delivery:** Multi-codec outputs - including AV1, VP9, HEVC/H.265, and H.264 - create the most cost-efficient delivery to the widest range of viewing devices.
- **High-speed processing:** Leverage massively distributed, parallel processing that transcodes video up to 100x faster than real time, accelerating large-scale VOD workflows.
- **Optimized bitrate distribution:** Apply multi-pass and Smart Chunking features to eliminate unnecessary data use while maintaining top-tier Quality of Experience (QoE).
- **Advanced quality-based features:** Ensure premium visual and audio performance across devices with 4K and 8K UHD, HDR, Dolby Vision and Dolby Atmos support.

### Use cases
**Monetization for Streaming Platforms**

Enable multiple revenue streams across AVOD, SVOD, and TVOD models with seamless monetization workflows. Bitmovin's VOD Encoder integrates with major ad networks for Server-Side Ad Insertion (SSAI) and supports third-party subscriber management and paywall solutions to power subscription and transactional services. Built-in DRM and forensic watermarking protect premium content and revenue from unauthorized access or redistribution.

**Cost-efficient Video on Demand**

Reduce operating costs while maintaining top-tier video quality and workflow scalability. Bitmovin's VOD Encoder combines Per-Title and Per-Shot content-aware encoding with multi-codec output to minimize bitrate and storage usage without compromising performance. Automated orchestration intelligently distributes workloads across compute resources, enabling horizontal scaling and faster processing for large content libraries at a lower total cost of ownership.

**Elevated Quality of Experience for Subscriber Retention**

Enhance viewer satisfaction and reduce churn through superior streaming performance across all devices and network conditions. Bitmovin's VOD Encoder utilizes Multi-Pass, Smart Chunking, and Per-Title optimization to deliver consistently high-quality playback with reduced bandwidth requirements. Supporting resolutions up to 8K and advanced features like HDR and Dolby Vision, it helps streaming platforms strengthen brand loyalty, attract new audiences, and retain existing subscribers through exceptional visual experiences.

Ready to deliver stunning video with our encoder? Contact our team to schedule a personalized demo and discuss your specific video streaming requirements.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Input formats** | MPEG-1/2/4, H.261, H.262, H.263, H.264,  H.265, VP6, VP8, VP9, and more|
| **Input file formats** | MP4, MKV, MOV, AVI, MXF, LXF, GXF, MPEG-2 TS/PS, and more|
| **Input audio codecs** | AAC, MP3, DTS Express, FLAC, Dolby Digital, Dolby Atmos, and more|
| **Output file formats** | MPEG-2 TS, MP4, fMP4, MOV, WebM, CMAF, and more|
| **Output video codecs** | XDCAM HD 422 (MPEG-2), H.264, H.265, H.266, VP8, VP9, AV1, and more|
| **Output audio codecs** | AAC-LC, MP2, MP3, Vorbis, Dolby Digital (Plus), Dolby Atmos, and more|
| **DRM / Content protection** | DASH ClearKey, Multi-DRM (Widevine, PlayReady, Marlin, FairPlay), Forensic Watermarking, and more|
| **Subtitles & Closed captions** | WebVTT & OCR into WebVTT, CEA-608/708, Burnt-in Subtitles, and more|
| **Streaming protocols** | MPEG-DASH, Apple HLS, Progressive MP4, Smooth Streaming|
| **AI features** | AI Scene Analysis, Contextual Advertising, AI Vertical Video|
| **Innovative features** | Per-title, Multi-pass, Per-Shot encoding, Smart chunking, Multi-codec|



#### VOD Encoder Streaming Workflow

![VOD Encoder Streaming Workflow](/assets/marketplace/bitmovin-vod-encoder.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const vodEncoder: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
