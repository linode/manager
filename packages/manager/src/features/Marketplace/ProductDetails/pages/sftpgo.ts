/**
 * Product tab details for slug sftpgo.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
SFTPGo is an enterprise-grade Managed File Transfer (MFT) solution designed for organizations that require high-performance file exchange without the overhead of infrastructure management.

By delivering a **single-tenant, isolated architecture** for every customer, SFTPGo ensures dedicated resources, localized **data residency**, and maximum security - entirely free from the performance bottlenecks of multi-tenant environments. Deploy your environment in minutes and transform a passive storage service into an **active data pipeline**.

### **Key Features**

* **Multi-Protocol Access:** Secure transfers via SFTP, SCP, FTP, FTPS, and WebDAV, plus an intuitive WebClient for non-technical users.  
* **Secure Public Sharing:** Collaborate effortlessly with external partners using unique, web-accessible links. Protect shares with passwords, expiration dates, or email-based authentication (OTP) without requiring account creation.  
* **Storage Agnostic (BYOS):** Includes S3-compatible storage, but allows you to "Bring Your Own Storage" from Azure Blob, Google Cloud Storage, or AWS S3 (Compatible).  
* **Smart Event Automation:** An integrated engine to trigger webhooks, notifications, and PGP tasks based on file activity, schedules, or Identity provider login events. It streamlines governance with automated lifecycle management - automatically handling inactivity, expirations, and usage limits for both users and public shares - and supports Just-in-Time provisioning from templates immediately after SSO login.  
* **Identity & Security:** Native SSO (OpenID Connect), 2FA, and granular RBAC. Integrate with ICAP servers for real-time antivirus scanning and DLP checks.  
* **Compliance Ready:** Simplify GDPR and HIPAA audits with comprehensive logs, reporting, and automated data retention policies.  
* **No Software Limits:** Scale freely without restrictions on the number of users or administrators.

### **Use Cases**

#### **Data Sovereignty & Compliance**

Deploy dedicated instances in specific geographic regions to meet strict local data residency requirements. Use PGP encryption and automated retention rules to ensure sensitive files are managed according to regulatory standards.

#### **Automated Cloud Data Ingestion**

Use the Event Manager to trigger real-time webhooks or move files to cloud backends (S3, GCS, Azure) or external SFTP/FTP servers upon upload, download, or schedule. Perfect for reacting instantly to data from partners or IoT devices.

#### **Secure Partner Collaboration**

Provide external partners with a branded WebClient or Public Shares. Enforce strict isolation with per-directory permissions and protect access via SSO or Email OTP, ensuring collaborators see only authorized files.

#### **Hybrid Cloud Storage Gateway**

Consolidate fragmented data sources into a single entry point. SFTPGo acts as a unified bridge, allowing legacy applications to interact with modern object storage (S3, Azure, GCS) via standard protocols like SFTP and WebDAV, while providing users with a feature-rich, responsive WebClient.

Experience a secure, dedicated MFT environment today with a 10-day free trial included in all plans. Simply select your plan and region; your isolated instance will be provisioned automatically. Need a custom architecture or a live demo? Our team is available to help you design a proof-of-concept tailored to your specific workflows.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment Model** | SaaS. Fully managed dedicated instances |
| **Supported Protocols** | SFTP, SCP, FTPS, WebDAV, and HTTPS (WebClient)  |
| **Storage Backends** | Integrated S3-compatible storage plus Azure Blob, GCS, S3, and other SFTP/FTP servers |
| **Authentication** | Multi-factor (2FA), SSO (OpenID Connect), and LDAP/Active Directory integration |
| **Automation Engine** | Native EventManager (HTTP Hooks, Email, Filesystem actions) |
| **Advanced Security** | PGP Encryption and Decryption, ICAP support (Antivirus/DLP), Brute force protection |
| **API & DevOps** | Comprehensive REST API and official Terraform Provider |
| **Management** | Web-based Admin (WebAdmin) and User (WebClient) interfaces |
| **Compliance** | GDPR and HIPAA-ready (Small plans and above) |
| **Data Residency** | User-selected geographic regions on Akamai infrastructure |

![SFTPGo architecture](/assets/marketplace/sftpgo-architecture.jpeg)

### **Dedicated Managed File Transfer Architecture**

Every deployment provides a single-tenant, isolated instance to ensure maximum security and performance. The architecture is built on four pillars:

* **Flexible Identity Management:** Local authentication with MFA, centralized access via SSO (OpenID Connect), or guest access via Email OTP for Public Shares.  
* **Storage-Agnostic Design:** Native integration with S3-compatible backends, Microsoft Azure Blob, and Google Cloud Storage.  
* **Event-Driven Automation:** An integrated engine to trigger notifications and data workflows, fully controllable via a comprehensive REST API.  
* **Security Orchestration:** Support for high-performance protocols and integration with ICAP servers for antivirus and DLP inspection.

### **Data Ingestion & Automation Flow**

The following steps outline the automated lifecycle of a file within SFTPGo:

* **Secure Connection:** A client connects via SFTP/SCP/FTPS/WebDAV or a branded WebClient.  
* **Isolated Processing:** Traffic is routed to your dedicated instance, ensuring complete data separation from other customers.  
* **Real-Time Authentication:** The system validates credentials against the internal database or your external identity provider (SSO).  
* **Active Event Triggering:** Upon upload, the Event Manager can stream the file to an ICAP server for scanning, execute PGP tasks, or fire webhooks.  
* **Secure Persistence:** Files are stored on your chosen backend with encryption at rest. The Event Manager ensures continuous compliance by automatically enforcing per-folder data retention rules and managing the full lifecycle of users and public shares - including inactivity-based deletion, password expiration, and token-limited access.
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const sftpgo: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
