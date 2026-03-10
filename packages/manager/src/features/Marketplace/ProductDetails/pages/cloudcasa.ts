/**
 * Product tab details for slug cloudcasa.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
CloudCasa delivers Kubernetes-native backup, disaster recovery, and migration for containerized applications running on Akamai Cloud's managed Kubernetes services, including LKE (Linode Kubernetes Engine). It solves the critical challenge of protecting stateful cloud-native workloads by ensuring application data, configurations, and persistent volumes are recoverable in the event of accidental deletion, ransomware, infrastructure failure, or regional outages. Designed specifically for modern Kubernetes environments, CloudCasa eliminates the complexity of manual backup scripts and infrastructure-dependent recovery processes. This enables organizations to confidently run production workloads on Akamai Cloud with enterprise-grade data protection.

The platform operates using Kubernetes-native APIs and integrates directly with Akamai LKE clusters without requiring additional infrastructure management. CloudCasa captures full application context - including namespaces, deployments, services, and persistent volume data - and stores backups securely in object storage such as Akamai Object Storage or S3-compatible targets. It supports automated scheduling, application-consistent backups through pre- and post-backup hooks, cross-cluster restores, and cluster migration capabilities. With a SaaS-based control plane, customers can centrally manage protection policies, monitor backup health, and perform granular restores through a simplified web interface.

CloudCasa's key differentiator is its Kubernetes-first, infrastructure-agnostic design, allowing seamless protection across hybrid and multi-cloud environments - not just Akamai. It is ideal for DevOps teams, MSPs, and enterprises seeking simple, agentless backup with built-in ransomware resilience and rapid recovery objectives. It also offers the most cost-effective solution on the market, costing less than half compared to alternatives, while refusing to compromise on features and functionality. In fact, CloudCasa offers the most comprehensive Kubernetes-native solution for both containers and containerized VMs, all in a very lightweight offering that is easy to deploy and simple to use.

### Key features

- **Most cost-effective Kubernetes backup for Akamai LKE:** Enterprise-grade protection at a fraction of the cost from competitors.
- **Comprehensive Kubernetes data protection with RBAC and ACLs:** Protects cluster state, namespaces, persistent volumes, and application data with immutable backups. Offering granular file-level recovery with built in RBAC and ACL controls.
- **Migration and recovery into Akamai LKE:** Move or recover Kubernetes workloads from other platforms directly into Akamai.
- **Protect Akamai LKE workloads with automated, policy-driven backups:** Schedule and manage Kubernetes-native backups for applications and persistent volumes running on Akamai Cloud, ensuring consistent and reliable data protection.
- **Accelerate disaster recovery across regions and clusters:** Rapidly restore entire applications or individual resources to the same or different Akamai LKE clusters to minimize downtime and meet RTO objectives.
- **Strengthen ransomware resilience with immutable backup storage:** Store backups in secure, S3-compatible object storage (including Akamai Object Storage) to protect against data corruption or malicious deletion.
- **Granular recovery options:** Recover entire clusters, individual namespaces, specific resources, even single files from PVC's.
- **Ensure application consistency with built-in app hooks:** Execute pre- and post-backup hooks to capture application-aware, transactionally consistent backups for stateful workloads.
- **Reduce infrastructure overhead with agentless, Kubernetes-native integration:** Deploy quickly to Akamai LKE using Helm and leverage native APIs without managing additional backup infrastructure.

### Use cases

**Granular Kubernetes backup & restore** 

Recover exactly what you need - whether it's a single namespace, deployment, or persistent volume - without restoring the entire cluster, reducing downtime and operational disruption.

**Self-service backup & recovery** 

Empower DevOps and application teams to initiate backups and perform restores directly through a simple UI, eliminating ticket bottlenecks and accelerating recovery time.

**Compliance & data retention**

Enforce policy-based retention schedules and maintain auditable backup records to meet regulatory and internal governance requirements.

**Ransomware protection (immutable backups)** 

Safeguard critical workloads with immutable, object-storage-based backups that prevent alteration or deletion, ensuring clean recovery points after an attack.

**Kubernetes migration to Akamai LKE** 

Seamlessly move applications and persistent data from other Kubernetes environments into Akamai LKE without re-architecting workloads or rebuilding clusters.

**Disaster recovery into LKE (active/standby)** 

Replicate and restore applications into a secondary Akamai LKE cluster to support active/standby configurations and maintain business continuity during regional outages.

Protect your Kubernetes workloads on Akamai LKE in minutes with CloudCasa's backup and disaster recovery platform. Request a personalized demo to see how CloudCasa streamlines backup, migration, and ransomware protection, and ask for a free trial of our offering. Our onboarding resources, guided setup, and expert support team ensure you can deploy quickly and confidently secure your Kubernetes workloads.

`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment Model** | Self-hosted, helm-based installation |
| **Supported Data Sources** | Kubernetes Version 1.23 or later and KubeVirt workloads |
| **API Type** | RESTful API |
| **CLI Tools** | Helm 3 (if using Helm installation method) kubectl access to the cluster |
| **Security** | TLS 1.3, AES-256 encryption at rest |


![Reference Architecture](/assets/marketplace/cloudcasa-diagram.jpeg)

**Process Flow**

![Process FLow](/assets/marketplace/cloudcasa-process-flow.jpg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.

`.trim();

export const cloudcasa: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
