/**
 * Product tab details for slug myota.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Myota is a cyberstorage platform that protects data at the storage layer. It presents as S3-compatible object storage. Applications write data to Myota using the same S3 API they already use. At write time, Myota encrypts each chunk with a unique AES-256 key, shards the encrypted data across multiple storage locations using Reed-Solomon erasure coding, and splits the encryption keys themselves across distributed repositories using Shamir’s Secret Sharing. No single location holds a complete, readable copy of anything.

At read time, the application performs a standard S3 GET. Myota reassembles the minimum number of shards needed (two of four by default), decrypts in memory, and returns the data. The plaintext exists only in memory for the duration of the request. At rest, every location holds only unintelligible fragments. This is runtime-only decryption applied to object storage.

Myota is more storage-efficient than replica-based protection because it distributes shards, not full copies. It provides multi-region resilience without requiring a duplicate dataset in each region. And it delivers ransomware immunity at the storage layer: an attacker who breaches storage, steals a backup, or has insider access gets fragments that are mathematically impossible to reconstruct. Deployed on Akamai Cloud, Cortex runs on LKE or standard Linode compute and uses Akamai Object Storage across regions as shard repositories.

### What Myota Adds to the Akamai Cloud Ecosystem

Akamai Cloud provides compute, object storage with versioning and Object Lock, Kubernetes (LKE), and block storage. Myota adds cyberstorage capabilities that extend what the platform offers natively.

| **Capability** | **Akamai Native** | **What Myota Adds** |
| :---- | :---- | :---- |
| **Object immutability** | Object Lock (policy-based, Governance and Compliance modes) | Mathematical immutability via sharding. No admin override. No credentials can reverse it. Complementary to Object Lock. |
| **Data protection at rest** | Versioning retains object history in one region | Data encrypted, sharded, and distributed across regions at write time. Protection against credential compromise, insider access, and storage breach. |
| **Cross-region resilience** | Not available. Each bucket exists in a single region. | Shards distributed across Akamai regions by default. All regions are active. Lose a region, reconstruct from remaining shards. No replication needed. |
| **Shards distributed across Akamai regions by default. All regions are active. Lose a region, reconstruct from remaining shards. No replication needed.** |
| **Block storage protection** | No backup service for Block Storage volumes | Workloads that write to S3 (via Velero, application sync, or backup orchestrators) get Cyberstorage protection at the storage target. |
| **Kubernetes data protection** | No native LKE backup | S3 target for Velero or any K8s backup tool. Persistent volume data protected by Shard and Spread™. |
| **Cross-region backup automation** | Not available | Cross-region distribution is the default behavior. No replication jobs to configure or manage. |
| **Centralized data protection** | Linode Backups covers compute instances only (3-slot rotation, same region) | Single S3 endpoint protects data from any workload type: compute, containers, applications, AI pipelines. |
| **AI data security** | Not addressed | Runtime-only decryption for embeddings and vectors. 37% of AI data vulnerabilities addressed at the storage layer. Complements Akamai Firewall for AI. |
| **Protection against credential compromise** | Object Lock prevents deletion but authorized users still read data in plaintext | Authorized or compromised credentials cannot read complete data. Only fragments exist at any location. No master key. |

### Key features

* **Shard and Spread™**: Every chunk is encrypted with a unique AES-256 key, sharded via Reed-Solomon, keys split via Shamir’s Secret Sharing. Security is intrinsic to the data at write time.
* **S3-compatible**: Standard S3 API. Backup orchestrators, analytics engines (Spark, Presto, Trino), and any application that writes to S3 works with Myota without code changes.
* **Runtime-only decryption**: Data is only readable when the application performs a GET. At rest, no complete object exists anywhere.
* **Resilience without redundancy**: Shards distributed across Akamai regions. Lose a storage node or an entire region. Data reconstructed from remaining shards. No replication, no failover, no intervention.
* **More storage-efficient than replica-based protection**: Shards, not copies. Multi-region protection at less cost than single-region replication.
* **Multi-tenancy and cryptographic erasure**: Per-tenant Myota buckets with separate encryption keys. Shared shard repositories, isolated access. After deleting a bucket, key shards are destroyed across all repositories.
* **Immutability and instant rewind**: Every change logged as an immutable entry. Rewind to any point in time before an incident. Attackers who tamper with data have only registered changes that can be rolled back.
* **AI data protection**: 37% of AI data vulnerabilities can only be addressed at the storage layer. Myota protects embeddings, vectors, and document chunks the same way it protects any other data. OWASP LLM08 (Vector and Embedding Weaknesses) is addressed natively.

### Use cases

**Data protection for Akamai Cloud workloads**
Akamai Cloud offers Object Lock and versioning for object storage. Myota adds cross-region resilience, protection against credential compromise, and coverage for workloads that Object Lock and versioning do not reach: block storage, Kubernetes persistent volumes, and AI data pipelines.

Data written to Myota is encrypted, sharded, and distributed across Akamai regions at write time. Every write is captured. Rewind to any point in time before an incident. All regions are active simultaneously. No backup windows, no replication jobs, no separate DR infrastructure. Recovery Point Objective is continuous (the point of last write), and the Recovery Time Objective is immediate (reconstructed from any surviving shards). Object Lock prevents deletion. Myota prevents comprehension. Both are needed.

Compatible with third-party backup orchestration tools (Veeam, Commvault, Velero, and any S3-compatible platform) for customers who want traditional backup workflows alongside storage-layer protection.

**AI and RAG pipeline data protection**
AI systems store embeddings, vectors, and document chunks on S3. With Myota, that data is protected at the storage layer with runtime-only decryption. No complete embedding exists at rest. Validated against 48 vulnerability classes in a production AI security lab. Complements Akamai Firewall for AI, which protects the query path.

**Multi-region data resilience**
Akamai Object Storage buckets exist in a single region. Cross-region replication is not available natively. Myota provides multi-region resilience by distributing shards across Akamai regions at write time. Every region holds shards, not duplicates. All regions are active simultaneously. Lose a region and the data is still available from the remaining shards. More storage-efficient than traditional geo-replication.

**Compliance and regulated data**
HIPAA, NIST 800-171, DFARS, ITAR, FERPA, GDPR, PCI DSS, SEC WORM compliance. Data sovereignty configurable per shard repository. Cryptographic erasure via bucket deletion with auditable proof. SOC 2 compliant platform.

**SIEM and log retention**
Splunk SmartStore and any SIEM that writes to S3 can use Myota as the retention backend. Log data is protected by Shard and Spread™ from the moment it lands. Reduced storage cost for long-term retention without sacrificing search performance.

Contact the Myota team to schedule a live demonstration. We show Shard and Spread™ in action: data written, attacked, and recovered in real time. For qualified prospects, we offer a proof-of-concept deployment on Akamai Cloud scoped to your environment and data protection requirements. Typical POC runs two to four weeks.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment Model** | SaaS (Myota Cloud), on-prem (Myota-in-a-Box with StorONE), or hybrid. Cortex runs on Akamai LKE or standard Linode compute. |
| **Storage API** | S3-compatible (PutObject, GetObject, DeleteObject, ListObjects, multipart upload) |
| **Encryption** | AES-256 per chunk, unique key per object. Keys protected via Shamir’s Secret Sharing (no master key). |
| **Erasure Coding** | Reed-Solomon. Default 4 shards, 2 required for reconstruction. Configurable up to 90+ locations. |
| **Shard Repositories** | Any S3-compatible storage. Akamai Object Storage, AWS S3, Azure Blob, GCP, on-prem. |
| **Immutability** | WORM-compliant. Object lock with versioning. Tamper-proof change log for instant rewind. |
| **Multi-Tenancy** | Per-tenant Myota buckets with isolated encryption keys. Shared shard repositories, separate access. |
| **Latency** | Inline encryption at write with no meaningful overhead. Sub-millisecond with StorONE on-prem. |
| **Availability** | Survives loss of any shard location. Only 2 of 4 (default) shards needed for reconstruction. |
| **Compliance** | SOC 2 Type II, HIPAA, NIST 800-171, DFARS, ITAR, FERPA, GDPR, PCI DSS, SEC WORM |
| **Backup Integration** | Data protection for Akamai Cloud workloads at the storage layer. Compatible with third-party orchestration tools (Veeam, Commvault, Velero, Rubrik, Cohesity) via S3 API. |
| **AI Integration** | Protects embeddings, vectors, and RAG knowledge bases. OWASP LLM08 addressed. Complements Akamai Firewall for AI. |


![Myota Cyberstorage Architecture](/assets/marketplace/myota-cyberstorage.jpg)

Myota Cortex runs on Akamai LKE (Linode Kubernetes Engine) or standard Linode compute as the S3 gateway. Client applications (backup tools, enterprise apps, AI pipelines) connect to Cortex via standard S3 API. Cortex encrypts each chunk, shards the encrypted data, splits the encryption keys, and distributes the resulting fragments across multiple Akamai Object Storage nodes in different regions. Each region holds only unintelligible shard fragments. Only 2 of 4 shards are needed to reconstruct the original data, so the system survives the loss of any two regions without data loss or downtime.

The same architecture supports on-premises shard repositories, hybrid configurations (some shards on Akamai, some on-premises), or multi-cloud (shards on Akamai, AWS, Azure, and GCP simultaneously). The S3 API is the integration point at both ends: applications write to Cortex via S3, and Cortex writes shards to storage via S3.

`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const myota: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
