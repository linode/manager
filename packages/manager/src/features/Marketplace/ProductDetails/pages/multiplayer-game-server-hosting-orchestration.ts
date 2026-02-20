/**
 * Product tab details for slug multiplayer-game-server-hosting-orchestration.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Multiplayer game server hosting, solved.

Edgegap is a modern, game server orchestration platform built on the world's first and largest edge network. We help game developers deploy, scale, and efficiently operate multiplayer games worldwide at a fraction of traditional orchestration costs.

Instant, global distribution at one universal price – no tiers, no regional variations, 100% compute-based pricing, and no commitments. Pay only when players play.

Edgegap's platform includes edge server hosting and orchestration, automated matchmaking to group players, server browser to enable players to list and join servers and fleet management of persistent servers for social games and MMOs. Everything your multiplayer needs for hosting.

Integration takes minutes and gives you access to our patented orchestrator that delivers 58% latency reduction on average for eSports-level online play, scales up to 14M CCU in 60 minutes to deliver on the biggest game launches, and deploys game servers in 3 seconds on average from cold start for seamless matchmaking to game launch.

Edgegap powers AAA games and indies alike, including the legendary PAYDAY franchise, the #1 VR shooter Ghosts of Tabor, and games by KRAFTON Inc., Halfbrick Studios (Fruit Ninja series), AONIC, and MegaBits publishing.

### Key features

- **Global instant deployment:** Deploy game servers to 615+ worldwide locations on demand with regionless access, ensuring consistent player experiences at a single universal price.
- **Ultra-low latency performance, only Edgegap can deliver:** Deliver 58% average latency reduction compared to public cloud providers thanks to Edgegap's patented orchestration.
- **AAA rapid-scaling capacity:** Handle rapid growth with proven scaling of 40 deployments per second sustained, supporting up to 14 million concurrent users in 60 minutes.
- **High-availability & enterprise-grade uptime:** Guarantee 99.99% uptime with automatic failover. Optional enterprise-grade SLA is available.
- **Easy Integration & simple migration:** Get your game online in minutes or migrate easily using Edgegap's dedicated plugins for Unity, Unreal, and popular integrations like Heroic Labs' Nakama, Mirror Networking, PlayFab, and Photon.
- **Fully managed matchmaking:** Integrate ready-to-use matchmaking system without building infrastructure from scratch.
- **Hybrid orchestration:** Optimize costs by automatically balancing workloads between time-bound cloud deployments and persistent servers, based on demand and budget.
- **Fleet Manager & Server Browser:** Automated management of persistent servers and the user accessibility tools you need.
- **Free developer access:** Start testing immediately with a free account including essential resources to evaluate the platform.

### Use cases

**Launch day scaling for AAA-level multiplayer games**
Handle massive player influx during game launches without infrastructure bottlenecks. Edgegap's proven 40 deployments per second scaling supports up to 14 million concurrent users in 60 minutes, eliminating cold starts and ensuring every player gets into a match instantly regardless of launch traffic spikes.

**eSport-quality low latency game servers**
Deploy dedicated game servers automatically to the optimal location among 615+ worldwide locations based on player geography. Edgegap's patented orchestration analyzes real-time network metrics and player data to place servers where latency is minimized for all players in a match, reducing average latency by 58% versus public cloud. With average deployment times of 1.3 seconds and regionless access to edge locations, players experience consistent sub-50ms latency regardless of geographic location, ensuring fair competitive gameplay.

**Hybrid orchestration for cost optimization of live games**
Run predictable baseline player loads on persistent servers at lower fixed costs, then automatically burst to cloud during peak hours and weekends. Edgegap's hybrid orchestration seamlessly balances workloads between infrastructures, reducing operational costs while maintaining 99.99% uptime.

Do you want instant, global hosting at a universal price? Contact us and Edgegap's team will schedule a call to discuss your game and structure the ideal architecture for your needs.

Integration is easy and takes minutes for new games with our simple documentation. Edgegap offers free support throughout the process!

For clients with complex backends or live traffic, Edgegap helps you migrate in days with enterprise-grade integration support or, if preferred, a network of the best outsourcing studios for turnkey integration.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Network (Regions)** | 615+ locations worldwide, all available on demand |
| **Latency**  | Patented orchestration that delivers 58% avg. latency reduction vs. public cloud, 78% sub-50 ms latency vs 14% for public cloud |
| **Scaling** | Confirmed 40 deployments per seconds, sustained for 60 minutes for up to 14M CCU; faster rapid-scaling available upon request |
| **Integrations & Tools** | Unreal Engine server build tool, Unity dedicated plugin, alongside tools for Photon, PlayFab, Nakama, and many more. |
| **Availability SLA** | 99.99% uptime on edge cloud hosting, with enterprise SLA available (optional) |
| **Security** | TLS 1.3, AES-256 encryption at rest, VPC peering support |
| **Compliance – Age** | Age-related (COPPA (US), GDPR-K (EU), PIPEDA (Canada), CCPA (California), and the Personal Data Protection Act (Singapore)) |
| **Compliance – Security** | SOC 1, SOC2, and SOC 3 (upon request) |
| **Compliance – Regional**  | GDPR, EU-US Privacy Shield, Swiss-US Privacy Shield, HIPAA (upon request), FedRAMP (upon request) |

### "Fully details" variation (with some modifications)

![Edgegap Architecture](/assets/marketplace/eg-architecture.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const multiplayerGameServerHostingOrchestration: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
