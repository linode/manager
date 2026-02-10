/**
 * Product tab details for slug vindral.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
## Vindral Live Overview

Vindral Live is a low-latency real-time video streaming platform for applications where quality and synchronization are critical. It delivers consistent live video experiences under real-world network conditions.

Vindral Live provides precise control over latency and synchronized playout across streams and endpoints. Latency is configurable, with 500 ms or higher recommended when streaming over the public internet. The platform leverages modern transport technologies, including Media over QUIC, to improve resilience and reduce timing variability. Streams are created, managed, and monitored through APIs and a web-based control panel

Vindral Live is used in broadcast, sports, iGaming, and other mission-critical environments where timing accuracy matters. It is designed for teams that need reliable live streaming at scale without sacrificing operational control. Interactive experiences using live streaming are highly common in use cases.

### Key features

* **Stream synchronization**: Control synchronized playout across live video streams for accurate timing and alignment.
* **Configurable latency**: Adjust and manage latency to balance responsiveness and stability in real time workflows.
* **Deterministic performance**: Run live video streams with predictable behavior for mission critical use cases.
* **API driven workflows**: Create, manage, and automate live video streams using programmatic APIs.
* **Centralized operations**: Monitor and manage live streams through a web based control panel.

### Use cases

**Sports**
Vindral Live ensures deterministic playback timing so all viewers experience the same moment at the same time, even when streams originate from multiple camera feeds. Quick channel/angle switching is also an important aspect.

**Live casino**
Run live dealer and iGaming streams where fairness depends on all players seeing the same moment at the same time. Vindral Live provides controlled latency, down to 500ms, and synchronized delivery to prevent timing discrepancies between players, platforms, and operators. Together with Akamai’s infrastructure, the stability in growing regions for live casino is unmatched.

**Online auctions**
Live bidding on online auctions requires ultra-low latency, roughly half a second glass-to-glass. Stream live auctions where bids are placed against a shared timeline. Vindral Live ensures predictable delivery so all participants see bids and outcomes consistently, reducing disputes caused by latency differences.

**Public safety**
Support security operations with live video feeds that must remain aligned across teams and locations. Vindral Live delivers deterministic streaming performance, helping operators maintain a shared, real-time operational view.

**In venue**
Distribute live video across screens and devices inside arenas, venues, or large event spaces. Vindral Live handles high viewer density and network variability while maintaining synchronized playback across all endpoints and offloads the external bandwidth in arenas.

Ready to get started with Vindral Live? Explore the live demo to see the platform in action, or create a free account to start testing live streaming workflows. Contact the Vindral team for onboarding support or a tailored demonstration.
`.trim();

const documentationMarkdown = `
## Documentation Tab Content

| Specification | Details |
| :---- | :---- |
| **Product Type** | Real-time live video streaming platform |
| **Deployment Models** | Managed (LiveCloud), self-managed (LiveEngine), hybrid |
| **Primary Function** | Predictable live video delivery with controlled latency and synchronized playout |
| **Protocol Support** | MoQ (Media over QUIC), LLHLS, RTMP, SRT, and more |
| **Access Interfaces** | REST APIs, WebSDK, WebRTC Ingest SDK, and web-based portal |
| **Latency Management** | Configurable end-to-end latency with adaptive buffering for stability |
| **Stream Synchronization** | Synchronized playout for consistent viewer timing across clients |
| **Operational Control** | Create, manage, monitor, and control streams via API and portal |
| **Network Optimization** | Optimized for unpredictable public internet and private network conditions |
| **Integration Model** | API-driven integration into existing systems and applications |
| **Security & Access Control** | Support for channel keys, auth tokens, and geo-based restrictions (via portal/API) |
| **Target Use Cases** | Broadcast, sports, iGaming, auctions, public safety, in-venue live streaming, interactive video |

**Fully managed**
Many integrations for auctions, events, and webinars use standard hardware encoders, laptops running OBS, or Vindral’s WebRTC sender, which can be integrated into a web application.The live signal is sent to the Vindral Live CDN and distributed globally. The player can be embedded using an iframe or integrated into applications using Vindral’s SDK. It supports a wide range of platforms, including Chrome, iOS Safari, Apple TV, Google TV, Fire OS, Tizen, and LG webOS.

![Fully managed](/assets/marketplace/fully-managed.jpeg)

**Self-managed**
Deploy Vindral Live self-managed on your own infrastructure, in the cloud, or as a hybrid. This approach provides full control over the streaming environment, including hardware, traffic routing, and compliance. The deployment can be customized to meet specific legal, security, or business requirements, allowing you to decide where and how live content is delivered.

![Self-managed](/assets/marketplace/self-managed.jpeg)

**Hybrid**
If you already have an existing platform for handling users and content, Vindral Live can be integrated via API. White-label deployments are supported. This approach allows you to scale your live streaming product without rewriting the existing system. The Management API enables creation and management of channels, viewer access, recordings, and statistics. Vindral Live supports ultra-low latency delivery for studio employees, stakeholders, and premium customers.

![Hybrid](/assets/marketplace/hybrid.jpeg)
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

export const vindral: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
