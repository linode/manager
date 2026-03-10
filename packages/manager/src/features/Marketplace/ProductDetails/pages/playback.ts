/**
 * Product tab details for slug playback.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Bitmovin's Playback solution, Player and Analytics, are fully managed SaaS tools designed to enhance streaming platforms by delivering high-quality content and superior viewer experiences across every device. 

The Player provides a robust features set, such as adaptive bitrate streaming, offline playback, ad integrations, and CMCD support, with dedicated SDKs for the broadest range of devices, including web, mobile, smart TVs, and game consoles to maximize viewer reach. Bitmovin's Analytics provides real-time monitoring and actionable insights on audience, playback errors and quality of experience (QoE) metrics, allowing platforms to access over 200 parameters to quickly identify and resolve issues, optimize streams, and boost viewer retention and engagement.

### Key features

- **Reach more viewers faster:** Easy to deploy on Smart TVs, Mobile & Connected TV devices.
- **Monetize your content:** Built-in monetization support for SSAI, CSAI, and SGAI-enabled workflows.
- **Modular architecture:** Reduce your bounce rate by loading only the parts that you need for faster load times and lower distribution costs.
- **Configurable ABR:** Deliver stunning quality in all environments.
- **Real-time actionable insights:** Easily deploy and view actionable data that helps you increase viewer engagement and retention, track and fix playback issues before they impact your users, and optimize for the best viewing experience.
- **Improved quality assurance:** Stream Lab integration for automated, real-device playback testing.

### Use cases

**Advanced Monetization Capabilities**

Increase audience reach and ad revenue with Bitmovin's Player and Analytics (Playback) solutions. Flexible ad management supports both server‑side (SSAI) and client‑side (CSAI) ad insertion, ensuring smooth, targeted ad delivery across devices. With real‑time playback insights from Bitmovin Analytics and efficient global delivery powered by Akamai's CDN, platforms can optimize ad performance, boost conversions, and maintain a consistently high‑quality viewing experience.

**Lower Development Costs**

Reduce engineering effort and operational overhead with Bitmovin's dedicated Player SDKs. Pre‑built cross‑platform components eliminate the need for manual maintenance and customization common with open‑source or in‑house players. Continuous automated testing - over 150,000 daily tests and weekly updates - ensures reliability, while Stream Lab allows real‑device validation of active streams. With Bitmovin Analytics and Akamai CMCD data pre‑integrated, developers can identify and resolve playback or CDN issues faster, improving efficiency and minimizing downtime.

**Flawless Video Experiences**

Deliver premium, consistent playback across every device to strengthen viewer satisfaction and reduce churn. Bitmovin's Player, built with dedicated SDKs and a cross‑platform UI framework, ensures brand consistency and supports advanced features such as low‑latency streaming and multi‑view experiences. With Bitmovin Analytics providing session‑level insights, teams can proactively detect and resolve playback issues, integrate with observability tools for holistic user analysis, and maintain the highest quality of experience to grow and retain subscribers.

Ready to deliver flawless playback on every device? Contact our team to schedule a personalized demo and discuss your specific video streaming requirements.

`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Device SDKs** | Web, iOS, Android, smart TVs, set-top boxes, consoles, HbbTV, and more |
| **Browser SDKs** | Chrome, Edge, Firefox, Opera, Safari  |
| **Cross-platform SDKs** | React Native SDK, Flutter SDK |
| **Workflows & Protocols** | Video on demand (HLS, MPEG-DASH, HSS) and live (Low-Latency HLS/DASH over CMAF) |
| **Functions & Qualities** | ABR, Multi-Language Audio, Offline Playback, Playlists, Live DVR, and more |
| **Subtitles & Closed Captions** | WebVTT, SRT, TTML/DFXP, CEA-608/708, Multi-Language CC |
| **Content protection** | Widevine, PlayReady, FairPlay, Client-side Watermarking, Offline DRM, and more |
| **Advertising capabilities** | SSAI, CSAI, SGAI, VAST 3.0/4.0/4.1, VMAP + Ad Scheduling & Targeting, and more |
| **Other Playback Features** | Multi-view playback, Preview Thumbnails, Audio Only Player, and more |
| **Collectors** | Bitmovin Player, Shaka Player, dash.js, hls.js, video.js, Dolby OptiView, and more |
| **AI Features** | AI Session Interpreter, AI Anomaly Detection, Assistant  |



### Playback Workflow

![Playback Workflow](/assets/marketplace/bitmovin-playback.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.

`.trim();

export const playback: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
