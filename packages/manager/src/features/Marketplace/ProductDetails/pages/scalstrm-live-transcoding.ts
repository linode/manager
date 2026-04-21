/**
 * Product tab details for slug scalstrm-live-transcoding.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Scalstrm Live Transcoding is designed for broadcasters, pay-TV operators, and streaming platforms that need to deploy live and event channels quickly, reliably, and cost-effectively at scale. By unifying ingest, transcoding, packaging, and encryption into a single platform, it eliminates complex manual workflows, enabling channels that once took hours to configure to launch in minutes - even seconds - without increasing infrastructure overhead.

The platform supports up to 4K HEVC and leverages a stateless, cloud-ready architecture with template-based orchestration for automated deployment of live and event channels. It runs on CPU and high-density VPU hardware, delivering live 4K HEVC channels per VPU card. Automated presets handle ABR ladders, codecs, packaging formats, DRM, and subtitles, while integrated scheduling, monitoring, logging, and alerting simplify 24/7 operations and event-based workflows.

High-density VPU processing reduces power consumption, rack space, and total cost of ownership by up to 50%. Template-driven, repeatable workflows make it ideal for pop-up event channels, seasonal programming, and large-scale live streaming. Built for sustainability and future readiness, Scalstrm continuously evolves to support new codecs, formats, and industry standards, ensuring broadcasters can scale efficiently and confidently.

### Key features

* **Instant live & event channel launch**: Deploy live or pop-up event channels in seconds using stateless, template-based orchestration with minimal manual setup.
* **Up to 4K HEVC transcoding**: Deliver high-quality live streams with support for 4K HEVC across CPU, GPU, and high-density VPU deployments.
* **Integrated end-to-end workflow**: Simplify operations by combining ingest, transcoding, packaging, encryption, and delivery into a single video processing platform.
* **High-density, energy-efficient processing**: Run up to 20 live 4K channels per instance using VPUs, significantly reducing power consumption and TCO.
* **Automated configuration & presets**: Automatically populate ABR ladders, codecs, packaging formats, DRM, subtitles, and manifests based on predefined templates.
* **Built-in scheduling & GUI**: Manage 24/7 channels and event-based streams easily with an intuitive scheduling and control interface.
* **Comprehensive monitoring & reliability**: Detect and resolve issues faster with real-time monitoring, logging, alerting, and support for high-availability configurations.

### Use cases

**Cloud-Based Live Transcoding and Origin Deployment**
Broadcasters deploy live transcoding and Origin services entirely in the cloud to launch channels quickly without on-premises infrastructure. Cloud-based CPU or VPU resources scale dynamically while integrated Origin delivery ensures consistent, low-latency streams to the CDN. This model enables fast market entry with predictable performance and cost control.

**Cloud Disaster Recovery for Live Streaming**
A cloud-based live transcoding and Origin setup serves as a disaster recovery environment for on-premises or primary cloud deployments. In the event of failure, channels can be activated instantly using pre-defined templates, maintaining uninterrupted live delivery. This approach guarantees service continuity while minimizing idle infrastructure costs.

**Event and Gaming Channels with Multi-View in the Cloud**
For live events and gaming tournaments, cloud-based transcoding enables rapid deployment of event-specific channels, including multi-view and parallel feeds. High-density cloud processing supports multiple camera angles and perspectives, while Origin services deliver synchronized streams globally. This allows platforms to scale instantly for peak audience demand and tear down resources when the event ends.

**Launch live and event channels with speed and confidence**
Scalstrm Live & Event-Based Transcoding lets you deploy channels in minutes using pre-configured templates that automate ingest, transcoding, packaging, and DRM. With high-density VPU processing, built-in scheduling, and real-time monitoring, you can scale effortlessly while reducing hardware, power, and operational costs. 

**Book a demo today** and discover how seamlessly Scalstrm integrates into your existing streaming workflow.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Video Input/Output** | **Live inputs:** Transport stream MPEG2-TS over IP (UDP/RTP) SRT with caller and listener <br /><br /> **Multiscreen live outputs:** CMAF live ingest to Scalstrm Origin |
| **Video processing** | **Video encoding profiles:** MPEG-4 AVC: MP @ L3, HP @ L4, HEVC: Main, AV1, HDR/BT.2020: PQ10, HDR10, HLG – 10bit support <br /><br /> **Video decoding profiles:** MPEG-2: MP@ML, MP@HL. MPEG-4 AVC: MP @ L3, HP @ L4, HEVC: Main <br /><br /> **Resolution and frame rate:** Resolution 240p to 1080p, 4K/UHD @50/60fps, PAL standard frame rates (25fps, 50fps), NTSC standard frame rates (30fps, 60fps) |
| **Audio processing** | **Audio encoding profiles:** MPEGA -> AAC-LC HE-AAC v1/v2, AC-3 -> AAC-LC HE-AAC v1/v2 (downmix) <br /><br /> **Audio passthrough:** MPEG-1 Layer II, AAC-LC/HE-AAC v1/v2, AC-3, E-AC-3 <br /><br /> **Audio processing features:** stereo and multichannel support, stereo/mono conversion, surround down-mixing, advanced audio frame repair |
| **Processing** | De-interlacer: R1.0 <br /> Auto-detection input: interlaced (TFF, BFF) or progressive <br /> Scene change detection <br /> IDR frame <br /> Keyframe - IDR frame insertion on SCTE35 markers <br /> GOP alignment, <br /> Slate insertion/Emulation mode/Blackout: PNG, JPG, and GIF |
| **Subtitles** | Teletext support converted to CMAF MP4VTT <br /> DVB subtitle - Burnt-in subtitles <br /> Teletext passthrough <br />Closed-caption passthrough <br /> Subtitle input (option with OCR/I2T) <br/> DVB bitmap subtitles to text (teletext/TTML) <br /> DVB Teletext |
| **Ad insertion** | SCTE 35 passthrough |
| **Management API** | Integrated within the Origin platform: <br/><br/> Modern Web-based UI <br />REST API <br /> Logs and Metrics Export <br /> Alerting Hooks |


![Scalstrm Live Transcoding Architecture](/assets/marketplace/scalstrm-live-transcoding-architecture.jpg)

### Live & Event Channel Process Flow

**Rapid Channel Creation**
Live or event channels are created in minutes using pre-defined templates. Operators simply select the source feed and target CDN, with minimal manual configuration required.

**Automated Service Configuration**
Encoding ladders, codecs (e.g. H.264, AAC), and packaging formats (HLS, DASH) are automatically applied based on presets. Subtitle tracks, DRM policies, and manifest options are pre-configured to ensure consistency and compliance.

**Integrated End-to-End Workflow**
Ingest, transcoding, packaging, and CDN delivery are seamlessly connected within a single workflow. This guarantees uniform encoding and streaming parameters across all channels.

**Scalable and Repeatable Operations**
Template-based workflows allow channels to be cloned and adapted quickly for similar events, regions, or markets. This makes the platform ideal for pop-up, seasonal, or large-scale event deployments.

**Operational Reliability and Visibility**
Real-time monitoring, logging, and alerting provide full visibility into every stage of the workflow, enabling rapid fault detection and resolution. High-availability and redundancy configurations ensure uninterrupted service.

**Future-Ready Platform**
Ongoing platform updates introduce support for new codecs, formats, and industry standards, helping broadcasters stay aligned with evolving devices, platforms, and viewer expectations.
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const scalstrmLiveTranscoding: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
