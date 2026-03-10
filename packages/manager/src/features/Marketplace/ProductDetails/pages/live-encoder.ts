/**
 * Product tab details for slug live-encoder.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Bitmovin's Live Encoder is a SaaS product on Akamai Connected Cloud, enabling reliable, high-quality streaming with fast startup times for social platforms, sports, news, entertainment, and large-scale events.

It features an intuitive UI and robust API for quick configuration, management, and scaling. Supporting up to 4K resolution, it accepts RTMP(S), SRT, and Zixi inputs, and streams in codecs like h.264/AVC, h.265/HEVC, and VP9. Outputs include HLS and DASH, with features such as SCTE-35 monetization, input redundancy, Live to VOD, DRM protection, graphic overlays, and integration with other Bitmovin products (VOD Encoder, Player, and Analytics).

### Key features

- **Resilient and reliable:** Bitmovin's Live Encoder was built on the same backbone as our VOD Encoder, ensuring stream uptime is constant and reliable for global playback distribution.
- **Multi-protocol and codec support:** Ingest your live broadcasts seamlessly with support for RTMP, RTMPS, SRT, or Zixi single and redundant inputs, encoding h.264/AVC, h.265/HEVC, or royalty-free VP9 and package in HLS or DASH for distribution to end-user devices, helping you ensure your content can always be made available and viewable to your users on any device.
- **Live2VOD:** Stream and record your live content to give your users the ability to view it after the live event has ended or clip parts of it while it is still running to promote your ongoing stream.
- **Customizable with a robust API library:** Gain access to our extensive API library that enables you and your team to build out and customize the Bitmovin Live Encoder to fit your live streaming workflow needs.
- **Content security:** Keep your content protected with multi-DRM integrations that enable you to cost-effectively and securely deliver your media over the internet.
- **Simple and scalable:** Manage your live encoding process through our simple and Intuitive UI or API to get streaming quickly with the Bitmovin Live Encoder and scale the number of your live streams to meet your usage needs easily without worrying about peaks.


### Use cases

**SaaS scale for 1000s of encodings per day**

Deploy and manage large-scale live streaming operations effortlessly with Bitmovin's fully managed SaaS platform on the Akamai Connected Cloud. The Live Encoder automates infrastructure tasks - including compute allocation, storage, and networking - so teams can start or stop live events instantly without system configuration. Dynamic scaling ensures reliable performance during peak traffic, while consumption - based billing supports rapid recovery for 24/7 channels through on-demand redundancy and backup servers.

**How Live Encoder can help generate revenue**

Enable multiple monetization models - including SVOD, AVOD, and hybrid approaches - with Bitmovin's Live Encoder on the Akamai Connected Cloud. Support for SCTE‑35 ad markers, server ‑ and client‑side ad insertion (SSAI/CSAI), and DRM ensures secure, targeted ad delivery while protecting premium content. Integration with Akamai's global CDN and Bitmovin Analytics provides reliable distribution and actionable insights into viewer engagement and ad performance, allowing platforms to refine monetization strategies and maximize revenue.

**Reduce operating costs with Live Encoder**

Lower total cost of ownership with Bitmovin's Live Encoder on the Akamai Connected Cloud by optimizing encoding ladders to minimize egress and data transfer costs while maintaining broadcast-level quality. Unlike open-source implementations that demand heavy customization as scale increases, Bitmovin provides a secure, managed solution optimized for efficiency and performance. Its pay‑as‑you‑go model supports both continuous and event-based streaming, enabling flexible cost control without compromising reliability or viewer experience.

Ready to deliver stunning live events with our encoder? Contact our team to schedule a personalized demo and discuss your specific video streaming requirements.

`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Input resolutions** | SD (480i, 576i), HD (720p, 1080i, 1080p), 4K (2160p), Portrait (mobile) |
| **Input video codecs** | MPEG-2, MPEG-4, AVC/H.264, HEVC/H.265 |
| **Input audio codecs** | AAC, AC3, PCM |
| **Input transport protocols** | RTMP, Zixi Receiver, SRT Caller, SRT Listener |
| **Output file formats** | MPEG-2 TS, MP4, fMP4, MOV, WebM, CMAF, and more |
| **Output video codecs** | AVC/H.264, HEVC/H.265, VP9 |
| **Output audio codecs** | AAC-LC, HE-AACv1, HE-AACv2, AC3, Vorbis, Opus |
| **DRM** | Widevine, PlayReady, Marlin, FairPlay |
| **SCTE-35** | Inband MPEG-TS, API based cue insertion |
| **Subtitles & Closed captions** | WebVTT & OCR into WebVTT, CEA-608/708, Burnt-in Subtitles, and more |
| **Output streaming protocols** | MPEG-DASH, Apple HLS, DASH-IF Live Media Ingest, Progressive MP4 |

### Live Encoder Streaming Workflow

![Live Encoder Streaming Workflow](/assets/marketplace/bitmovin-live-encoder.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.

`.trim();

export const liveEncoder: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
