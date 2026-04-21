/**
 * Product tab details for slug cyclops.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Redflag AI is a premier content security platform designed to protect high-value live sports and entertainment assets from sophisticated piracy. We solve the "visibility gap" by detecting illicit streams/videos that use AI-cloaking, mirroring, and speed-manipulation to bypass standard security. Our platform ensures rights holders maintain absolute control over their broadcasts/assets, protecting rights valuation and reclaiming revenue from the "shadow ecosystem."

Powered by Cyclops AI, the platform provides real-time detection across global IPTV networks, internet websites and social media. Through our deep integration with Akamai’s edge, we deploy forensic watermarking that survives re-streaming to map leaks back to specific users. Once identified, our automated kill-switch executes a session-level override to terminate the pirate feed instantly, while our Content ID suite monetizes unauthorized highlights.

As an official YouTube partner and Google TCRP member, Redflag AI offers infrastructure-level enforcement at the speed of live sports. We are the only solution that combines surgical forensic attribution with a "zero-friction" deployment, making us the ideal choice for global leagues and broadcasters looking to turn piracy into a managed asset class.

### Key features

* **Real-time "Cyclops AI" Detection**: Identify illicit streams instantly with a proprietary engine that detects content even when it is mirrored, sped up, or obscured by AI-cloaking.
* **Edge-Native Forensic Watermarking**: Pinpoint the exact source of any leak using 1-in-1-out session tracking deployed directly at the Akamai edge without changing your packager.
* **Automated Live Kill-Switch**: Terminate pirate feeds in seconds by triggering a session-level override that swaps unauthorized streams for black frames or custom segments.
* **Unified Revenue Recovery**: Convert stolen views into profit through an integrated Content ID dashboard that automatically claims and monetizes unauthorized match highlights.
* **Infrastructure-Level Takedowns**: Accelerate removals via direct API escalations with CDNs, DNS providers, and registrars to collapse pirate networks at the source.
* **Google TCRP Integration**: Maintain search engine dominance by utilizing priority access to Google’s Trusted Copyright Removal Program for high-speed de-indexing.
* **Comprehensive Analytics Dashboard**: Track recovered revenue and monitor the global "shadow ecosystem" with real-time heatmaps and forensic attribution metrics.
* **Zero-Friction Deployment**: Protect your entire live roster in minutes using a language-agnostic, lightweight edge integration designed for high-stakes broadcasting.

### Use cases

**Live Sports Rights Protection**
Shield high-value broadcast windows for live events like football, racing, or combat sports. Detect illicit restreaming within minutes of kickoff and use the forensic kill-switch to terminate the specific sessions feeding pirate networks without affecting legitimate subscribers.

**Automated Highlight Monetization**
Convert viral piracy into a new revenue stream by automatically identifying and claiming unauthorized match highlights across YouTube and social media. Use the unified Content ID dashboard to redirect ad revenue from "shadow channels" back to the league’s official coffers.

**Infrastructure-Level Anti-Cloning**
Neutralize sophisticated pirate networks that clone entire OTT web platforms using cloaking and redirects to hide from search engines. Use Cyclops AI to unmask hidden infringements and trigger domain-level de-indexing through Google TCRP and direct CDN escalations.

**Forensic Leak Investigation**
Identify the exact source of pre-release VOD leaks or "insider" streaming by extracting embedded, session-specific watermarks. Trace the "digital DNA" of a video even if it has been screen-recorded, cropped, or filtered, providing the necessary evidence for legal action and account termination.

**Cross-Platform Social Enforcement**
Maintain brand integrity by monitoring and removing unauthorized live broadcasts and "clips" across TikTok, Instagram, and Facebook. Automate the submission of high-volume takedown notices through registered agent status to collapse infringing audiences in real-time.

Ready to reclaim your broadcast revenue and secure your live window? Contact our team to schedule a live demo of the Redflag AI platform and receive a Free Leak Audit of your current sports assets. We’ll work with your team to design a seamless, edge-integrated proof-of-concept that demonstrates our forensic detection and kill-switch capabilities in your specific environment.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment model** | SaaS-based Dashboard with Edge-native Logic |
| **Detection engine** | Cyclops AI: Proprietary Multi-modal Visual/Acoustic Watermarking |
| **Watermarking type** | Forensic 1-in-1-out: Session-specific, non-blind, and imperceptible |
| **Supported codecs** | Official: h264, libx265, VP9, AV1, VC2, J2K, FFV1, Rawvideo |
| **Packager compatibility** | Native: Shaka, Bento4, Unified Streaming, Harmonic, Ateme, MediaKind |
| **Edge integration** | Language-Agnostic: Akamai, CloudFront, Fastly (Requires KV Store access) |
| **Detection latency** | Live Window: <60 seconds from stream start |
| **Enforcement speed** | Kill-Switch: 1–10 minutes for identification and session termination |
| **Encoder requirements** | CPU/GPU: Linux/Windows VM (Min: 8GB vCPU / 1GB RAM or 2GB vRAM) |
| **Ingress support** | UDP or SRT (MPEG-TS, single program, h.264 video stream) |
| **Processing speed** | 3.6 seconds to read/modulate/write a 5-second 1080p60 chunk |
| **Compliance** | Registered Takedown Agent, Google TCRP Member, YouTube Partner |

Our forensic watermarking solution integrates directly into your broadcast path to provide real-time identification and control.

**Workflow**

* **Ingest & Splitting**: Your live encoder sends a feed to the Redflag AI engine, which generates unique A/B video segments and stores them in your cloud storage.
* **Edge Personalization**: As viewers request the stream, our software at the network edge assembles a unique sequence of these segments for each user. This creates an invisible, permanent forensic watermark tied to that specific session.
* **Instant Enforcement**: By utilizing a high-speed data store at the edge, the system can identify a pirate's session and trigger an immediate kill-switch. The "Edgeworker" swaps the pirate's feed for black frames in real-time without impacting legitimate subscribers.


![Cyclops Architecture Diagram](/assets/marketplace/Cyclops-Architecture-Diagram.jpg)

While your live streams occur, Redflag automatically deploys a fleet of bots across the internet to hunt down pirate-hosted copies of your stream, capture their footage, and decode the embedded invisible ID.

We cover 1,000s of piracy sites and continually add more as pirates create new domains and sites. New piracy sites can be added on demand. Each site is monitored 24/7 as we search for illegal streams of your content.

Once a bot has collected a sufficient sample of a piracy stream, it uploads this video to our decoding service, which then decodes the embedded watermark, and makes this information available to the Cyclops UI. You can then review the pirated content and take action against the pirates with a simple or real-time GUI.

![Cyclops Process Flow](/assets/marketplace/Cyclops-Process-Flow.jpg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const cyclops: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
