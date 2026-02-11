/**
 * Product tab details for slug sftpgo.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
SFTPGo provides a fully managed, secure Managed File Transfer (MFT) solution designed for organizations that require professional file exchange without the burden of infrastructure management. Unlike standard shared hosting, SFTPGo delivers a dedicated and isolated installation for every customer, ensuring maximum security and performance. Each environment is automatically deployed in the user's selected region, providing a turnkey solution that is ready to use in minutes with simple, predictable pricing.

The service supports a comprehensive suite of protocols, including SFTP, FTP, FTPS, and WebDAV, complemented by an intuitive WebClient for non-technical users. Every plan includes a dedicated S3-compatible storage quota, yet the platform remains storage-agnostic, allowing you to "Bring Your Own Storage" from providers like Azure Blob, GCS, or S3. Administrators can manage the entire system through a powerful WebAdmin interface, which offers granular access controls, real-time monitoring, and no software limits on the number of users or admins.

A primary differentiator is the integrated Event Manager, a powerful automation engine that executes conditional "if-this-then-that" actions based on system activity. Administrators can easily define rules to trigger real-time webhooks, send notifications, or automate complex tasks such as PGP encryption, and automated data retention policies. This transforms a passive storage service into an active data pipeline, seamlessly integrating secure file transfers into your existing business workflows.

### **Key features**

* **Dedicated Infrastructure:** Ensure maximum security and performance with a fully isolated, dedicated installation and dedicated resources for every customer environment.  
* **Regional Data Residency:** Meet strict compliance requirements by deploying your dedicated instance in your preferred geographic region for localized data sovereignty.  
* **Hybrid Storage Management:** Simplify data centralization by using the included S3-compatible storage or connecting your own backends like Azure, GCS, and S3.  
* **Unified File Access:** Enable secure file exchange via SFTP, FTPS, and WebDAV, or provide non-technical users with an intuitive WebClient.  
* **Smart Event Automation:** Accelerate data pipelines with an integrated Event Manager that triggers webhooks, notifications, and PGP encryption or decryption based on real-time file activity.  
* **Enterprise-Grade Protection:** Secure sensitive data with encryption at rest, two-factor authentication (2FA), and the flexibility to integrate advanced antivirus or DLP scanning workflows.  
* **Advanced Identity Integration:** Streamline user management and secure access with native support for SSO (OpenID Connect).  
* **Compliance Readiness:** Accelerate your audit processes with comprehensive logs, reporting, and automated data retention rules tailored for GDPR and HIPAA standards.

### **Use cases**

**Secure Data Sovereignty and Compliance**  
Deploy dedicated, isolated instances in specific geographic regions to meet strict GDPR, HIPAA, or local data residency requirements. Utilize built-in audit logs, PGP encryption, and automated data retention rules to ensure that sensitive files are managed and purged according to regulatory standards without manual intervention.

**Automated Cloud Data Ingestion**  
Streamline business workflows by using the Event Manager to automatically trigger webhooks or move files to cloud storage backends like S3, Google Cloud Storage, or Azure Blob upon upload. This transforms a standard SFTP server into an active data pipeline, allowing your internal systems to react instantly to incoming data from partners or IoT devices.

**Secure External Partner Collaboration**  
Provide non-technical partners with a secure, branded WebClient for browser-based file exchange and link sharing, protected by Single Sign-On (SSO) or Multi-Factor Authentication. Implement Role-Based Access Control (RBAC) to enforce strict data isolation with per-user and per-directory permissions, ensuring collaborators only access authorized files. This granular control allows you to define specific actions (read, write, delete) at the folder level, preventing unauthorized data exposure within your dedicated environment.

**Hybrid Cloud Storage Gateway**  
Use SFTPGo as a unified gateway to access and manage files across different cloud providers using legacy protocols like SFTP, FTP, or WebDAV. By abstracting the underlying storage (S3-compatible, Azure Blob, GCS, other SFTP servers), you can consolidate fragmented data sources into a single, manageable interface for your legacy applications and modern cloud services

Experience a secure, dedicated MFT environment today with a 10-day free trial included in all plans. Simply select the plan that best fits your needs and choose your preferred deployment region; your isolated instance will be provisioned automatically and ready for use in minutes. If you require a custom architecture, specialized compliance configurations, or would like to see a live demo, our team is available to help you design a proof-of-concept tailored to your specific business workflows.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment Model** | SaaS. Fully managed dedicated instances |
| **Supported Protocols** | SFTP, FTPS, WebDAV, and HTTPS (WebClient) |
| **Storage Backends** | Integrated S3-compatible storage plus Azure Blob, GCS, S3, and other SFTP/FTP servers |
| **Authentication** | Multi-factor (2FA), SSO (OpenID Connect/SAML), and LDAP/Active Directory integration |
| **Automation Engine** | Native EventManager (HTTP Hooks, Email, Filesystem actions) |
| **Advanced Security** | PGP Encryption and Decryption, ICAP support (Antivirus/DLP), Brute force protection |
| **API & DevOps** | Comprehensive REST API and official Terraform Provider |
| **Management** | Web-based Admin (WebAdmin) and User (WebClient) interfaces |
| **Compliance** | GDPR and HIPAA-ready (Small plans and above) |
| **Data Residency** | User-selected geographic regions on Akamai infrastructure |

![SFTPGo architecture](/assets/marketplace/sftpgo-architecture.jpeg)

### **Dedicated and Automated Managed File Transfer Workflow**

Every customer receives an isolated and dedicated installation for secure and high-performance file management. The architecture offers flexible identity management, featuring built-in authentication with Two-Factor Authentication support or centralized access through Single Sign-On integration. It features a storage-agnostic design that connects to S3-compatible storage, Microsoft Azure Blob, and Google Cloud Storage. An integrated event-driven engine automates notifications and data workflows triggered by file activity, fully controllable through a comprehensive Application Programming Interface.

### **Automated Data Ingestion and Event-Driven Flow**

The automated file transfer flow begins when a client initiates a connection using the Secure File Transfer Protocol or a secure web browser. Incoming traffic is routed to a dedicated and isolated installation to ensure security and data separation. After the user is authenticated, file operations are processed in real-time within the dedicated environment.

Following a successful file upload, the integrated event engine triggers predefined actions - such as email notifications or automated tasks - to streamline business workflows without manual intervention. Simultaneously, data is securely stored on the included S3-compatible backend or a preferred cloud storage provider such as Microsoft Azure Blob or Google Cloud Storage.
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
