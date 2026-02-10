/**
 * Product tab details for slug scaleflex.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
## **Overview Tab Content:**

Scaleflex delivers a Visual Experience Platform built to help brands turn massive volumes of images and videos into fast, high-converting digital experiences. The platform runs fully on Akamai Cloud Compute and CDN, ensuring global performance, resilience, and scale. It solves a simple but critical problem: how to manage, optimize, and deliver images and videos at speed, at scale, and with measurable business impact. Scaleflex is trusted by high-volume brands in e-commerce, travel, and real estate.

Scaleflex offers two solutions: Smart Media Cloud, which provides dynamic media optimization and on-the-fly resizing for images and videos, extending Akamai Image Manager with AI capabilities and an integrated Asset Library. Key features include compression, transcoding, smart cropping, background removal, auto-tagging, auto-description, asset upload and search, and performance analytics. Digital Asset Management centralizes images and videos with advanced AI search, rich indexation, approval workflows, user permissions, media editing, and secure asset sharing through branded Portals. Both solutions are API-first, headless, MACH-compliant, and fully SaaS.

What makes Scaleflex different is its native, end-to-end integration with Akamai’s edge and cloud infrastructure, including Akamai Connected Cloud. This architecture lets teams manage assets once and deliver optimized, marketplace-ready, accessible media everywhere, instantly. Ideal for organizations managing millions of assets and billions of transformations, Scaleflex turns visual complexity into a performance advantage.

### **Key features**

* **High-Speed Global Ingestion:** Ingest images and videos at high speed through a globally distributed network running on Akamai Cloud Compute, securely connected to your CMS, PIM, and Martech stack.  
* **AI-Powered Retouch, Tags, Descriptions & Smart Search:** Create GenAI variants of each image and search intuitively using AI-powered, multilingual and custom metadata taxonomies that eliminate manual effort and reduce errors.  
* **Real-Time Optimization & CDN Delivery:** Automatically AI-adjust and optimize images and videos per device and channel via the Akamai CDN to cut load times and boost conversion. Includes plugins and libraries to ease frontend integration of responsive,   
* **Centralized Asset Hub (Single Source of Truth):** Centralize all visual assets in one system to prevent duplicates, wrong versions, and inconsistent branding across teams and regions.  
* **Automated Workflow Orchestration:** Validate, transform, and publish assets through automated workflows that shorten time to market for new collections and campaigns towards marketplace, social media, portals and online platforms.  
* **Data Governance & Classification Rules:** Enforce smart classification and approval rules to reduce storage waste, publishing errors, and performance issues that impact revenue.

### **Use cases**

**Managing Enterprise-Scale Product Catalogs**  
E-commerce teams struggling with millions of SKUs use the Ingestion and Centralization features to organize massive libraries without the chaos of duplicate files or lost assets.

**Boosting Core Web Vitals & Mobile SEO**  
Marketing and Tech teams use Real-Time Optimization to ensure their site passes Google’s speed requirements (LCP) and delivers content instantly to AI crawlers, maximizing visibility in both search rankings and AI-generated answers (GEO).

**Automated Multi-Vendors Product Feed and User-Generated Content Moderation**  
Community managers use AI workflows to instantly filter and approve customer-uploaded photos, ensuring brand safety without needing a human to review every single image.

**Multi-Channel Marketplace Syndication**  
Merchandisers use Automated Workflows to instantly format product shots to meet the strict requirements of each marketplace and acquisition platform.

Interested? Book a demo with our team. In this demo, you will:

* Discover the joint value proposition of Scaleflex & Akamai solutions combined  
* Learn how our joint clients solved their challenges with managing digital assets  
* Understand the impact of media performance on SEO and conversion  
* Explore the potential of Visual AI to automate manual tasks at each step of the asset lifecycle.
`.trim();

const documentationMarkdown = `
## **Documentation Tab Content**

| Specification | Details |
| :---- | :---- |
| Deployment Model | Cloud-native SaaS, composable MACH architecture with online hub and headless API access |
| Supported Data Sources | Visual assets (images, videos, documents), ingress via drag-and-drop, CSV, and API |
| API Type | RESTful headless APIs for media upload, management, optimization and enrichment platform functions; CLI and widgets available |
| Programming Languages | Language-agnostic REST APIs; typical SDK use in JavaScript or any language capable of REST calls |
| Availability SLA | 99.9% uptime |
| Security | Standard token/API auth, permissions/roles, SSO / MFA |
| Compliance | GDPR compliance, MACH Alliance certified, 10 Core accredited DAM vendor |

Full documentation under: [https://docs.scaleflex.com/](https://docs.scaleflex.com/)

### **Important links**

* [General 1-Pager Scaleflex DAM + Akamai](https://assets.scaleflex.com/Partners/Akamai%20Technologies%2C%20Inc/Scaleflex%20-%20Short%20-%20Visual%20Experience%20Platform%20with%20Akamai.pdf?vh=782aa1&func=proxy) (PDF)  
* [Scaleflex Visual Experience Platform](https://www.youtube.com/watch?v=AzVWhgqXotQ) (Video)  
* [Yuka’s Cofounder & CTO on Scaling Visual Performance with Scaleflex](https://www.youtube.com/watch?v=psl-VjuTn60) (Video)  
* [AI-Assisted Solutions for E-Commerce](https://www.youtube.com/watch?v=18kACnt_Coc) (Video)  
* [AI-Assisted Travel Solutions](https://www.youtube.com/watch?v=IxNTv3u60Lg) (Video)  
* [AI-Assisted Tool for Maximizing Real Estate Listings](https://www.youtube.com/watch?v=SrpmNbclGq0) (Video)  
    
  ![Scaleflex VXP Architecture](/assets/marketplace/Scaleflex-vxp-architecture.jpeg)  
    
* **Modular Platform:** At the heart of the system is the VXP Platform, comprising four integrated powerhouses: two core modules (Digital Asset Management & Smart Media Cloud/Dynamic Media Optimization) and two supporting modules (Portals & Visual AI) following each customer’s needs.  
* **Universal Input & Collaboration:** The platform aggregates creative output from Internal Teams (Marketing, IT, Designers) and External Partners (Agencies, Distributors) via Hubs, Portals, and APIs, fostering a unified workflow.  
* **Seamless Integration Ecosystem:** The VXP is designed to be "headless" and interoperable, connecting bidirectionally via APIs, Webhooks, and Plugins to essential business software including CMS, PIM, ERP, and Creative Apps.  
* **Multi-Channel Delivery:** The architecture focuses on performance, pushing optimized, "accelerated content" directly to Web Applications, E-Commerce platforms, and Mobile Apps, ensuring a consistent visual experience across all user endpoints.  
    
  ![Scaleflex Asset Lifecycle](/assets/marketplace/Scaleflex-Asset-lifecycle.jpeg)
  
  ![Scaleflex Create with VXP](/assets/marketplace/Scaleflex-Create-with-VXP.jpeg)
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

export const scaleflex: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
