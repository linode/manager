/**
 * Product tab details for slug myota.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
## Overview

Myota is S3-compatible cyberstorage that makes data architecturally immune to ransomware and cloud outages. Traditional security sits on top of storage; when attackers get through, data remains vulnerable. Myota solves this by building protection into how data exists: files are automatically encrypted, sharded, and distributed across multiple independent locations. Attackers get useless fragments they can't reconstruct; authorized users get instant access.

The patented Shard & Spread technology encrypts each file at write time using zero-knowledge encryption, then cryptographically shards the data, metadata, and encryption keys across geographically distributed repositories. If one location goes down or is compromised, data reconstructs automatically from available shards. Myota works as primary storage for applications, media, and analytics, or as an immutable backup target for platforms like Veeam and enterprise file sync solutions.

Unlike standard object storage where security depends on configurations, credentials, and policies that can be compromised, Myota's protection is architectural—no single region, provider, or credential can impact access. And because data is distributed across independent locations, regional outages don't take your data offline. Organizations typically cut storage costs by 50% while gaining ransomware immunity and instant recovery to any second before an incident.

### Key features

* **Ransomware immunity at write time**: Protect data the moment it's created. Sharded data can't be encrypted, corrupted, or held for ransom, attackers get fragments they can't reconstruct.
* **Instant recovery to any second**: Rewind data to the exact moment before an incident with no recovery window and no data loss. No restore jobs, no waiting.
* **True immutability by design**: Shard, encrypt, and distribute data across independent storage targets so no single credential, system, or region can compromise it.
* **Regional resilience and high availability**: Stay online during cloud outages. If a region or provider goes down, data reconstructs automatically from available shards.
* **Unified namespace across environments**: Manage data consistently across cloud, multi-cloud, and on-prem from a single interface, no application or workflow changes required.
* **50% storage cost reduction**: Eliminate redundant copies and avoid vendor lock-in. Use heterogeneous storage to cut total costs while improving protection.
* **S3-compatible by default**: Works with any S3-compatible application, backup platform, or analytics pipeline. If it works with object storage today, it works with Myota.
* **Post-quantum encryption**: Future-proof your data. Post-quantum cryptography protects against emerging threats at the storage layer.

### Use cases

**Ransomware-proof primary storage**

Protect production data-application databases, media assets, analytics pipelines against ransomware by enforcing immutability at write time. Even if attackers compromise endpoints, credentials, or network access, sharded data remains unreadable and unrecoverable to them. Recover to any second before an incident without restoring jobs or data loss.

**Multi-cloud disaster recovery**

Maintain continuous access to critical data across Akamai Cloud, AWS, Azure, and on-prem storage without managing separate DR infrastructure. Shards distributed across independent providers enable automatic reconstruction during regional outages - no failover triggers, no recovery windows, no data loss.

**Backup replacement and cost reduction**

Eliminate traditional backup jobs, retention schedules, and restore operations. Myota provides continuous protection at write time, removing the gap between production data and recoverable data. Organizations typically reduce storage costs by 50% while consolidating backup, DR, and primary storage into a single architecture.

**Compliance and data sovereignty**

Meet GDPR, HIPAA, SEC 17a-4, and data residency requirements by controlling exactly where shards are placed geographically. Built-in WORM enforcement, immutable audit logs, and post-quantum encryption provide audit-ready storage without manual compliance overhead.

**Hybrid and multi-cloud data management**

Manage data across on-prem and cloud storage through a unified S3-compatible namespace. Applications continue operating without modification while data is automatically sharded and distributed for protection and availability. Enable gradual cloud migrations without disrupting operations or sacrificing security.

**Sensitive data protection**

Protect CUI, PHI, PII, and other regulated data in object storage. Ransomware like Codefinger encrypts cloud storage using legitimate credentials with attacker-controlled keys, your data exists but you can't read it. Myota encrypts and shards data at write time, so compromised credentials can't expose recoverable information. Roll back to the second before an attack. Satisfies NIST 800-171, HIPAA, and CMMC requirements architecturally, not through policies attackers can disable.

**Analytics and data lake protection**

Keep Tableau, Databricks, and SIEM pipelines running through ransomware incidents. S3-compatible API means existing integrations work unchanged, with protection applied at write time, not query time. If ransomware encrypts your production data lake, rewind to any second before the attack with complete transaction integrity.

**Large-scale unstructured data**

Protect petabyte-scale storage, media assets, engineering files, genomic data, without tripling storage costs. Traditional 3-2-1 backup for 2PB requires 6PB of copies. Myota's Shard & Spread delivers equivalent fault tolerance at 50% less cost with recovery at local disk speed.

**Regulated records and compliance**

Meet HIPAA, SOX, SEC 17a-4, GDPR, and PCI DSS with WORM compliance enforced by architecture. Even with admin access, attackers cannot modify protected shards, enforcement happens at the shard level. Zero-knowledge encryption supports HIPAA's breach notification safe harbor.

**Disaster recovery without the recovery window**

Replace traditional DR with continuous protection across distributed locations. Traditional DR: hours to restore. Myota: sub-second failover because data is already distributed. 50% cost reduction versus traditional DR architectures.

**Backup infrastructure protection**

93% of successful ransomware attacks compromise backup data. Myota integrates as a backup storage target, backup data is sharded and distributed at write time. When ransomware hits your backup repository, you still have recoverable data. Myota works with all object compatible backup solutions, and is a certified Veeam Ready cyberstorage target.

Ready to make your data architecturally immune to ransomware and cloud outages? Schedule a demo to see Shard & Spread™ in action or start with a proof-of-concept on your own infrastructure. Our team will help you design a deployment that fits your storage environment and compliance requirements.
`.trim();

const documentationMarkdown = `
## Documentation

| Specification | Details |
| :---- | :---- |
| **Deployment Model** | SaaS, integrates with Akamai Cloud and existing storage infrastructure |
| **API Compatibility** | Full S3 API compatible |
| **Supported Storage Targets** | Akamai Cloud (Linode Object Storage), AWS S3, Azure Blob, Google Cloud, Oracle Cloud Infrastructure (OCI), IBM Cloud, Min.io, on-prem object storage |
| **Encryption** | Zero-knowledge AES-256 encryption at write time, post-quantum cryptography |
| **Data Protection** | Shard & Spread™ distributes encrypted fragments across independent storage locations |
| **Immutability** | Architectural WORM enforcement at shard level, no admin override |
| **Recovery** | Instant rollback to any second, no restore windows |
| **Backup Integration** | Veeam Ready certified cyberstorage target |
| **Resilience** | Automatic reconstruction from available shards during regional outages |
| **Compliance** | HIPAA, SOC 2, GDPR, SEC 17a-4, PCI DSS, NIST 800-171, FedRAMP |
| **Availability** | Multi-region by design, no single point of failure |

### Myota Cyberstorage Architecture

#### Overview

The Myota Cyberstorage Architecture provides ransomware-immune data protection through a distributed storage system that cryptographically fragments and disperses data across multiple independent storage repositories. The architecture operates on Akamai Connected Cloud infrastructure and delivers storage-native security without requiring changes to existing applications.

![Myota Cyberstorage Architecture](/assets/marketplace/myota-cyberstorage-architecture.jpeg)

### Components

#### Workload Entry Points (Left Side)

* **Enterprise Apps (S3 API):** Production applications connect via standard S3-compatible interfaces, requiring zero code changes for integration.
* **Custom Applications (API Integration):** Developer applications leverage Myota's API for programmatic data operations.
* **Backup Software (Veeam, Commvault, etc.):** Backup solutions write directly to Myota as an immutable storage target.
* **Myota Command (Admin Console):** Administrative interface for policy configuration, monitoring, and management.

#### Myota Mesh

The Myota Mesh is the core distributed storage fabric containing:

* **Myota Edge:** The gateway layer that handles all data ingestion and retrieval.
  * **Myota Bucket:** Unified storage interface presenting a single namespace to applications regardless of underlying shard distribution.
  * **Myota Cortex:** Secure execution layer deployable on Kubernetes clusters or virtual machines. Performs encryption, data sharding using Shamir's Secret Sharing, and policy enforcement.
* **Myota Shard Pool:** Distributed storage backend containing multiple Shard Repositories across diverse infrastructure:
  * Cloud Provider A
  * Cloud Provider B
  * On-Premises storage
  * Additional targets as needed

#### Data Flow

1. **Ingest:** Applications write data through the S3 API to Myota Bucket.
2. **Encrypt & Shard:** Myota Cortex encrypts data with AES-256, then cryptographically fragments it using Shamir's Secret Sharing into multiple shards.
3. **Spread:** Shards are distributed across geographically and administratively separated repositories in the Shard Pool.

#### Key Architectural Benefits

* **Mathematical Immunity:** Data cannot be reconstructed without a threshold number of shards (N-T resilience model).
* **Software Airgap:** No single repository contains enough information to reconstruct data.
* **Zero Trust:** Each shard is independently encrypted and meaningless in isolation.
* **Application Transparency:** Standard S3 interface requires no application modifications.

### Myota Shard & Spread™ Process Flow

![Myota Shard & Spread Process Flow](/assets/marketplace/myota-process-flow.jpeg)

#### Write Path

When data enters Myota, protection happens immediately.

1. **Encrypt**: Each file is encrypted at write time using zero-knowledge AES-256 encryption with post-quantum cryptography.
2. **Shard**: The encrypted data, metadata, and encryption keys are split into fragments using cryptographic secret sharing. Each shard in isolation contains zero recoverable information.
3. **Spread**: Shards are distributed across multiple independent storage locations—different regions, providers, or on-prem systems. No single location holds enough data to reconstruct the original file.

#### Read Path

Authorized users retrieve data instantly, even during partial outages.

1. **Reconstruct**: Shards are gathered from available locations. Only a quorum is needed—if one region is down, reconstruction continues from remaining locations automatically.
2. **Decrypt**: The file is reassembled and decrypted using zero-knowledge key reconstruction. Data is returned to the user with no perceivable latency impact.

#### Why This Matters

* Ransomware hits? Attackers get fragments they can't reconstruct. Roll back to any second before the attack.
* Cloud outage? Data reconstructs from remaining shards. No failover trigger, no recovery window.
* Credential compromised? No single location contains usable data. Breach one system, get nothing.
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

export const myota: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
