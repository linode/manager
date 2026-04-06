/**
 * Product tab details for slug synadia-platform.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Synadia Platform provides managed [NATS.io](http://nats.io) infrastructure for connecting distributed applications, services, and devices across Akamai Cloud, AWS, Azure and Google Cloud. 

Built for edge-first and globally distributed systems, the platform uses an event-driven architecture to propagate data and service interactions across regions and environments in milliseconds. It supports streaming, request/reply, key-value, and object storage, with built-in replication and digital twins that keep data close to where it's needed. Deploy rapidly as a managed global service or extend it directly into edge sites and customer environments via the Akamai global cloud infrastructure —without gateways, service meshes, or complex networking dependencies.

### **Key features**

* **Global real-time connectivity**: Connect applications and services across clouds and edge locations with millisecond latency using a single global data plane.  
* **Multi-cloud and edge reach**: Run seamlessly across Akamai, AWS, Azure, GCP, private clouds, and edge environments without gateways, proxies, or load balancers.  
* **Event-driven data distribution**: Propagate changes instantly using publish/subscribe and streaming to keep systems in sync everywhere.  
* **Local data access with digital twins**: Keep data close to users and devices using mirrored streams and key-value replicas that automatically stay in sync.  
* **Single platform for multiple services**: Combine messaging, durable streams, key-value, and object storage in one platform to reduce system complexity.  
* **Edge-first resilience**: Operate autonomously during network disruptions and automatically resync.

### **Use cases**

**Multi-cloud architectures**  
Run applications across multiple cloud providers with real-time data and service synchronization in a cloud agnostic architecture. Keep systems active in every cloud without relying on centralized brokers or complex failover logic.

**Telemetry/Command & Control - Edge data collection and processing**   
Ingest, process, and distribute data at the edge with millisecond latency. Operate autonomously during network disruptions and automatically resync with cloud systems when connectivity returns.

**Global service-to-service communication**  
Connect microservices across regions, clouds, and edge locations using a single global messaging fabric. Enable low-latency request/reply and event streaming without load balancers or service meshes.

Ready to start your free trial of Synadia Platform on the Akamai Cloud? Contact our team to schedule a technical discovery session with one of our architects.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment model** | Managed BYOC on Akamai Cloud or self-hosted. |
| **Cloud & edge support** | Native operation across Akamai, AWS, Azure, GCP, private clouds, and constrained edge environments. |
| **Operational footprint** | Lightweight, single-binary core with minimal dependencies and simplified operations at scale. |
| **Security** | Zero-trust security with mTLS, fine-grained authorization, and no shared secrets or stored credentials. |
| **Latency profile** | Millisecond-level data and service propagation with local-first access via mirrors and replicas. |
| **Architecture** | Event-driven, real-time messaging and streaming built on a single global connective fabric. |
| **Replication & locality** | Built-in geo-replication, mirroring, and digital twins for fast local reads and global consistency. |
| **Data capabilities** | Unified support for messaging, durable streams, key-value storage, and object storage. |

The Synadia Platform, running on Akamai, enables a globally connected NATS supercluster to act as a single logical event fabric spanning regions, clouds, and the edge. At the core, multiple regional NATS clusters form a supercluster, providing high availability, low latency, and seamless data routing across geographies.

Leaf node clusters extend this fabric outward to edge locations, branch offices, devices, or specialized environments. These leaf nodes securely connect back to the supercluster, allowing local workloads to publish and consume events with minimal latency while still participating in the global system.

This architecture enables a true "connectivity-first" model: events, streams, and services can flow transparently between core regions and the edge without complex gateways, brokers, or manual replication. The result is a resilient, self-healing, and scalable event fabric that supports real-time, streaming, and request/reply patterns everywhere—from central clouds to the far edge.  

![Synadia Architecture on Akamai](/assets/marketplace/synadia-akamai-arch.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const synadiaPlatform: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
