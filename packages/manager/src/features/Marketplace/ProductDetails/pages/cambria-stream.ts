import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Cambria Stream and Cambria Cluster are Live and VOD encoding software solutions that simplify live and file-based video workflows across cloud, on-prem, and hybrid. Cambria products can adapt to any media workflows. 

Cambria Stream is a live encoder and packager supporting modern streaming formats including HLS, DASH, and CMAF. It is deployable via Docker and is designed to scale efficiently using Kubernetes, making it suitable for cloud-native workflows. 

Together, Cambria Stream and Cambria Cluster are well suited to enterprise environments requiring predictable performance, transparent licensing, and architectural flexibility. Common use cases include OTT VOD processing, broadcast contribution, cloud-based media services, and hybrid production pipelines where cost control and operational consistency are critical.

### **Key features**

* **Scalable live encoding and packaging:** Encode and package live streams using modern formats including HLS, DASH, and CMAF, scaling horizontally to meet channel and event demand.
* **High-performance file transcoding:** Transcode professional video formats including AVC, HEVC, HDR, and broadcast mezzanine inputs with consistent quality and predictable throughput.
* **Cloud, on-prem, and hybrid deployment:** Run the same software across customer-managed infrastructure, public cloud, or hybrid environments without architectural changes or retooling.
* **Containerised and Kubernetes-ready:** Deploy using Docker and orchestrate at scale with Kubernetes for automated scheduling, resiliency, and efficient resource utilisation.
* **Centralised orchestration and load balancing:** Use Cambria Cluster to distribute jobs, monitor nodes, and balance workloads across multiple transcoding instances and locations.
* **Hybrid job distribution:** Seamlessly burst file workloads between on-prem and cloud resources to handle peak demand while maintaining cost control.
* **Enterprise integration via APIs:** Automate workflows and integrate with existing media pipelines using robust APIs designed for large-scale, production environments.

### **Use cases**

**Cloud-native live streaming workflows**
Deploy Cambria Stream in cloud environments to encode and package live channels and events using HLS, DASH, and CMAF. When deployed with NETINT VPUs, operators can achieve extremely high channel density and power-efficient live encoding at scale using containerised and Kubernetes-orchestrated infrastructure.

**Hybrid file-based transcoding at scale**
Use Cambria Cluster to distribute excess workloads to cloud instances during peak demand. By employing NETINT VPUs, file-based workflows can be massively accelerated while maintaining consistent performance across hybrid environments.

**OTT VOD processing pipelines**
Transcode large VOD libraries into multiple AVC and HEVC profiles for OTT delivery, including HDR and broadcast mezzanine inputs. NETINT VPU acceleration enables higher throughput per node, reducing infrastructure footprint while automating job scheduling, monitoring, and load balancing.

**Broadcast contribution and preparation**
Process inbound contribution feeds and mezzanine files for regional distribution or platform-specific requirements.

**Cloud-based production services**
Enable media service providers to offer elastic transcoding and live encoding services using customer-managed cloud infrastructure. Cambria Stream can be deployed rapidly using Docker and scaled under Kubernetes, with NETINT VPUs providing a highly efficient alternative to general-purpose compute.

Ready to simplify your live and file-based media workflows? Submit an enquiry to connect directly with the Capella Systems team to discuss your requirements, deployment options, and architecture. We’ll help you evaluate Cambria Stream and Cambria Cluster through a guided demo or proof-of-concept aligned to your environment.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment model** | Customer-managed software; deployable on-prem, cloud, or hybrid environments |
| **Packaging & orchestration** | Containerised (Docker); Kubernetes-ready for scheduling  and horizontal scaling |
| **Product scope** | Live encoding & packaging (Cambria Stream) |
| **Supported video codecs** | Cambria Stream Ingest a wide range of live inputs, then encode and package them as HLS, MPEG-DASH, CMAR, SRT and Zixi. |
| **File orchestration** | Centralised job distribution, load balancing, and node monitoring via Cambria Cluster |
| **Hybrid processing** | On-prem and cloud resources managed within a single workflow, including workload bursting |
| **Automation & integration** | REST APIs for workflow automation and integration with existing media systems |
| **Scalability model** | Horizontal scaling based on available compute resources (CPU/GPU/VPU, environment-dependent) |

### **Architectural diagrams**

![capella systems architecture](/assets/marketplace/capella-one-platform.jpeg)
![capella systems architecture](/assets/marketplace/capella-api-integration.jpeg)
![capella systems architecture](/assets/marketplace/capella-live-streaming.jpeg)
![capella systems architecture](/assets/marketplace/capella-cloud-auto-scale.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const cambriaStream: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
