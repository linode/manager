/**
 * Product tab details for slug portainer.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Portainer is an operator control plane for governing Docker, Podman, and Kubernetes environments from a single self-hosted system. It solves the operational gap that sits above managed Kubernetes services like Akamai LKE: how to centralize access control, enforce security policy, standardize deployments, and manage fleets of clusters without needing a dedicated platform engineering team. It is designed for the IT operations, infrastructure, and security teams that make up the majority of Akamai's enterprise customer base.

Portainer connects to Kubernetes environments through lightweight agents and provides centralized role-based access control with Active Directory, LDAP, and OIDC integration; governed application deployment through form-based or manifest-driven workflows; a GitOps engine with deterministic policy enforcement; and fleet-wide governance with automatic drift remediation. All user actions are audit logged and can be streamed to SIEM platforms, supporting the compliance requirements common in financial services, healthcare, defense, and public sector environments. Portainer runs entirely within the customer boundary with no external SaaS dependency, aligning directly with Zero Trust and data sovereignty requirements.

Portainer is the natural operational layer above Akamai LKE for teams running multiple clusters across cloud regions, hybrid environments, or distributed edge sites. It scales from a single cluster to one hundred thousand edge environments from one control plane and is designed for the eighty percent of enterprises that need modern container operations without the overhead of building and maintaining a bespoke internal platform.

### Key features

- **Govern access across every environment from one place:** Portainer centralizes authentication and role-based access control with support for Active Directory, LDAP, and OIDC, eliminating the need to distribute credentials or manage access cluster by cluster.
- **Deploy applications safely without Kubernetes expertise:** Guided form-based workflows and manifest-driven deployment options let IT generalists and developers ship applications consistently, with guardrails enforced automatically by the control plane.
- **Enforce security policy across your entire fleet automatically:** Fleet Governance Policies install, propagate, and auto-remediate policy across all connected clusters, so drift is detected and corrected without manual intervention.
- **Manage thousands of edge and remote environments reliably:** Asynchronous edge agents enable offline-safe operation across disconnected, air-gapped, and industrial sites, with updates queuing safely until connectivity is restored.
- **Maintain a complete audit trail for compliance:** Every user action and system event is logged at the control plane level and can be streamed to SIEM platforms such as Splunk or Microsoft Sentinel.
- **Adopt GitOps without rebuilding your infrastructure:** A centralized GitOps engine monitors repositories and enforces desired state deterministically, without embedding controllers inside each managed cluster.
- **Operate confidently in regulated and sovereign environments:** Portainer runs entirely within the customer boundary with no external SaaS dependency, and supports FIPS-140-3 compliant operation for government and defense requirements.


### Use cases

**Governing Kubernetes Fleet Operations Across Multiple Clusters**

Enterprises running Kubernetes across multiple environments quickly outgrow cluster-level tooling and need a single control plane for access, policy, and deployment governance. A global energy company with 100+ developers replaced a custom-built internal platform - which had taken five developers two years to build - with Portainer, achieving a 15% increase in developer productivity, $1.7M in savings, and a 99.99% uptime target across both Kubernetes and Docker Swarm environments. A leading French bank consolidated governance across 1,500+ containerized environments, reducing application onboarding from five days to three hours and recapturing $60K per year in platform team productivity.

**Enabling Container Adoption Without Kubernetes Specialists**

Most enterprise IT teams do not have dedicated Kubernetes engineers, yet increasingly face pressure to run containerized applications delivered by ISVs or internal development teams. A U.S. automotive manufacturer running 24x7 production across three shifts used Portainer to give non-technical shift staff the ability to monitor, restart, and triage containers without any CLI knowledge. A Turkish fashion retailer with 500 global stores adopted Portainer specifically because it allowed their 100-person IT team - most with no prior Kubernetes experience - to deploy and manage workloads through an intuitive GUI, without YAML expertise and at a fraction of the cost of OpenShift.

**Securing and Auditing Container Operations in Regulated Environments**

Financial services, healthcare, government, and defense organizations require centralized audit logging, enforced security policy, and verifiable compliance posture as conditions of operating. San Diego Superior Court containerized its public-facing infrastructure with Portainer, reducing outages from multiple per month to one in twelve months, improving availability to 99.9999%, and generating an estimated $10M in annual productivity savings - with Active Directory integration driving adoption across a Windows-centric IT team. A global AI-powered surgical intelligence platform operating in thousands of operating rooms used Portainer to enforce governance across globally distributed Kubernetes environments while cutting developer onboarding from six months to weeks.

**Managing Distributed and Edge Deployments at Scale**

Organizations operating across distributed sites - factories, vehicles, retail stores, city infrastructure - need a control plane that works reliably under intermittent connectivity, with no dependency on always-on networks. Cummins used Portainer to consolidate 35 separate telematics software variants into one unified architecture deployed over-the-air across thousands of connected vehicles, operating under low-bandwidth and intermittent connectivity constraints. Volkswagen built its Shopfloor Integration Management platform on Portainer to remotely deploy and lifecycle-manage IoT microservices across thousands of shopfloor devices globally. A U.S. building materials manufacturer uses Portainer to push updates simultaneously to edge cameras and sensors across 68 plants, replacing up to 40 manual daily deployments with one-click fleet rollouts and saving $100K per year.

**Enabling MSPs and Service Providers to Deliver Self-Service Container Platforms**

Managed service providers and technology companies building container platforms for their customers need a control plane that isolates tenants, reduces support burden, and scales without adding headcount. ilionx, a European managed IT services provider, replaced Rancher with Portainer after finding it too complex to operate, eliminating a daily bottleneck of 70–80 manual container restarts and enabling customers to manage their own isolated environments without contacting support. A major U.S. satellite and streaming radio provider managing 250 Kubernetes nodes estimated that operating without Portainer would require hiring two or more additional full-time engineers to handle update tasks alone.


Getting started with Portainer is straightforward and low-risk. Portainer offers a **free perpetual tier for up to three nodes** - no time limit and no credit card required - giving teams immediate hands-on access to the full management interface against real workloads.

For organizations evaluating at production scale, a **30-day free trial** of Portainer Business is available, supported by a structured **Proof of Concept guide** that walks teams through deployment, configuration, and validation against their own environment and use cases.

For enterprise evaluations, Portainer's solutions engineering team provides direct technical support throughout the trial period, including architecture reviews and guided onboarding. To get started, contact the Portainer team to arrange a live demo tailored to your infrastructure and requirements.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment Model** | Self-hosted; runs as a container entirely within the customer environment - on-premises, private cloud, air-gapped, hybrid, or edge |
| **Supported Container Runtimes** | Docker, Podman, Kubernetes (any distribution), Docker Swarm |
| **Agent Types** | LAN Agent (trusted networks), Remote Agent (outbound-only, no inbound firewall rules), Async Edge Agent (disconnected and OT environments) |
| **Fleet Scale** | Up to 100,000 edge environments managed from a single control plane |
| **Identity and Authentication** | Active Directory, LDAP, OIDC-compatible identity providers, local users for air-gapped environments |
| **Access Control** | Role-based access control (RBAC) with predefined roles: Environment Administrator, Operator, Namespace Operator, Standard User, Read-Only, Helpdesk |
| **GitOps Execution** | Centralized server-side GitOps engine; supports Git repository monitoring via schedule or webhook; compatible with Docker, Podman, and Kubernetes |
| **Security and Compliance** | FIPS 140-3 compliant operation; AES-256 encryption of internal database at rest; TLS for agent communication; SIEM integration via webhook (Splunk, Microsoft Sentinel, Elastic) |
| **Audit Logging** | Full user-action-level audit logging at the control plane; exportable to SIEM platforms |
| **Policy Enforcement** | OPA Gatekeeper integration; fleet-wide policy propagation with automatic drift remediation across all connected clusters |
| **External Dependencies** | None; no SaaS control plane, no call-home requirement, no cloud dependency |

Portainer uses a lightweight hub-and-spoke architecture consisting of two components: the Portainer Server and the Portainer Agent.

The Portainer Server is the central control plane, running as a container on a dedicated management environment. It serves the UI and REST API, stores all configuration in an embedded BoltDB database, and manages identity, RBAC, GitOps execution, policy enforcement, and audit logging across all connected environments. It requires persistent storage and runs on Docker Standalone, Docker Swarm, or Kubernetes.

Agents are deployed to each managed environment and act as execution proxies to the underlying container runtime. Three agent types support different network topologies. The Standard Agent accepts inbound connections from the Server on TCP port 9001, suited for private LAN environments. The Edge Agent reverses the connection direction — the agent calls home to the Server on ports 9443 and 8000 — eliminating the need for exposed inbound ports, suited for remote or internet-connected environments. The Async Edge Agent operates on the same outbound model but uses periodic snapshots rather than a live tunnel, designed for IoT, industrial, and satellite-connected environments with intermittent or limited connectivity.

A single Portainer Server manages Docker, Podman, Kubernetes, and Swarm environments simultaneously, with tested scale to 100,000 active edge environments


### Portainer Architecture

![Portainer Architecture](/assets/marketplace/portainer-architecture.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.

`.trim();

export const portainer: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
