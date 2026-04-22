/**
 * Product tab details for slug scalstrm-origin-packaging-platform.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Scalstrm Origin is a scalable media origin and packaging platform for OTT and broadcast services, enabling operators to deliver live TV, time-shift TV, start-over, catch-up, and video on demand. It solves the complexity of managing multi-format media workflows while ensuring consistent, high-quality delivery across all screens. The platform acts as a single system for ingesting, packaging, and distribution of live and on-demand content.

Built on a modern, elastic microservices architecture, Scalstrm Origin supports a wide range of broadcast and OTT formats and performs real-time repackaging for multi-screen delivery. It features dual, fully independent processing pipelines with clock synchronization and automatic repair, ensuring identical outputs and maximum service reliability. Integrated management via an intuitive WebUI provides orchestration, monitoring, analytics, alerts, and configuration, while built-in ad insertion enables targeted and personalized advertising.

Scalstrm Origin is optimized for high performance with minimal resource consumption, reducing infrastructure costs and operational burden. Its flexible architecture makes it ideal for both new deployments and seamless integration into existing ecosystems.

### Key features

* **Origin & packaging**: Deliver live TV, time-shift, start-over, catch-up, and VoD from a single platform, simplifying OTT and broadcast media workflows.
* **Multi-format repackaging**: Supports all common broadcast and OTT formats with real-time repackaging for consistent multi-screen delivery.
* **Synchronization & Repair**: Ensure uninterrupted services with two fully independent, synchronized pipelines and automatic repair of missing or corrupt media fragments.
* **High-performance efficiency**: Scale components independently to achieve maximum throughput while using fewer compute and storage resources.
* **Easy integration**: Through Publishing Points and adaptations, the Scalstrm Origin solution can be easily integrated into existing environments.
* **Integrated ad insertion**: Enable targeted and personalized advertising through dynamic ad insertion and replacement for OTT services.
* **Intuitive operations & management**: Reduce operational burden with a modern WebUI providing orchestration, monitoring, analytics, alerts, and configuration.


### Use cases

**Instant VOD repackaging with zero integration effort**
Scalstrm Origin delivers a resilient, scalable media origin and packaging platform that dynamically converts MP4 assets into HLS and additional streaming formats in real time. Content owners simply place their assets in storage without ingest workflows, manual processing, or system integration required. Publishing points map directly to storage locations, aligning seamlessly with existing player URLs for immediate playback.

**Seamless critical vendor replacement in under a week**
When a sudden third-party service shutdown put a mission-critical VOD streaming operation at risk, Scalstrm provided a fast and dependable alternative. A fully production-ready solution was deployed in less than one week, ensuring uninterrupted service continuity and a smooth transition for end users.

**Highly available, cloud-native architecture**
A fully redundant, cloud-native setup with two Akamai Connected Cloud servers powered by Scalstrm Origin handles all on-demand repackaging. Synchronized redundancy combined with Akamai CDN traffic distribution ensures high availability, resilience, and uninterrupted global content delivery.

**Cloud-Native Live Platform with Dual-Site Redundancy**
A large live streaming operation deployed Scalstrm Origin and Origin Shield on Linode across two geographically separated sites to eliminate single points of failure. The dual-site architecture provides full redundancy from ingest to delivery while maintaining high performance and operational simplicity.

**Scalable Multi-Tenant Live Streaming at Scale**
The platform supports two isolated tenants: one for 24/7 live TV channels and one for live events, enabling independent scaling and operational control. Approximately 200 live event channels are handled by Scalstrm Origin without service degradation during peak traffic periods.

**Resilient Live Ingest with CMAF and Encoder Integration**
Third-party encoders ingest live streams using CMAF directly into Scalstrm Origin, avoiding proprietary workflows and vendor lock-in. Pseudo-synchronization mode ensures consistent playback alignment across channels and events, even during large-scale live operations.

**Origin Shield Protection for High-Traffic Live Events**
Origin Shield is deployed alongside Scalstrm Origin at each Linode site, acting as a controlled pull layer for Akamai CDN. This shielding architecture absorbs traffic spikes and cache misses, protecting the live origins and ensuring stable delivery during high-demand events.

**End-to-End Redundancy to Akamai CDN**
Akamai CDN pulls exclusively from Origin Shield, distributing traffic across both sites for automatic failover and global scale. The result is uninterrupted live streaming delivery even in the event of encoder, origin, or site-level failures.

Discover how Scalstrm Origin can simplify, scale, and enhance your OTT and broadcast workflows. Schedule a personalized demo to see how our intuitive WebUI makes managing live TV, time-shift, start-over, catch-up, and VoD effortless, while our dual synchronized pipelines with automatic media repair ensure resilient, uninterrupted delivery. Explore full multi-format support, integrated ad insertion, and advanced monitoring and analytics, and let us help you design a deployment tailored to your environment.

**See Scalstrm Origin in action**
Book a personalized demo and discover how easily you can manage live, time-shifted, and on-demand workflows through a single WebUI. Experience resilient, always-on delivery with synchronized pipelines, automatic media repair, multi-format support, and built-in analytics tailored to your environment.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Origin Live input formats** | Transport stream MPEG-TS (UDP/RTP), SRT, CMAF live ingest (Live Transcoder format) |
| **Origin VoD formats** | Scalecast Asset/Tile recordings - CMAF (ISOBMFF MP4 files),  MP4/SMIL, MPEG-TS (indexed) |
| **Video codecs** | AVC/H264, HEVC/H265, AV1 |
| **Audio codecs** | AAC, AAC-LC, HE-AAC v1&v2, AC-3, E-AC-3, AC-4, MPEG Audio (MP2, MP3) |
| **Subtitle codecs** | EBU teletext, DVB bitmap subtitles, DVB TTML <br /> WebVTT (text & MP4), SRT, TTML, EBU-TT-D, IMSC |
| **Subtitle input conversions (option with I2T)** | OCR - DVB bitmap subtitles to text (teletext/TTML), DVB Teletext to TTML |
| **Origin JITP formats** | Apple® HTTP Live Streaming (HLS), MPEG DASH, Microsoft Smooth streaming (MSS), MP4 progressive download, MPEG-TS |
| **Encryption / DRM** | AES-128, Sample-AES, Common Encryption (CENC, CENS & CBCS) <br /> DRM: CPIX v1, v2, v2.3 - Microsoft Playready, Google Widevine, Apple FairPlay Streaming (FPS), Verimatrix CEI + CPIX |
| **Ad insertion** | SCTE-35 <code>splice_insert</code> and <code>time_signal</code> detection & processing <br /> Segmentation and cue insertion (for manifest manipulation) <br /> Segment length adjusts to SCTE-35 boundaries <br /> Ad marker insertion in outputs |



![Scalstrm Origin Architecture](/assets/marketplace/scalstrm-origin-architecture.jpg)

The Scalstrm Origin platform is built on a robust microservices architecture, with each service handling a specific stage of the content workflow. Farmer ingests live streams, Beekeeper performs just-in-time (JIT) repackaging, Archivist manages recordings, and Librarian handles VOD repackaging.

![Scalstrm Process Flow](/assets/marketplace/scalstrm-origin-process-flow.png)

`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const scalstrmOriginPackagingPlatform: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
