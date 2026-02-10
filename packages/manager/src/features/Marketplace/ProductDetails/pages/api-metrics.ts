/**
 * Product tab details for slug api-metrics.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
## APImetrics Overview

Continuous synthetic tests from APIContext monitor the performance and conformance of your mission-critical workflows across APIs, browsers, MCP servers, and the entire digital delivery chain. Our platform ensures reliability from hundreds of global points of presence and utilizes deep telemetry to provide unparalleled insights.

### Key features

- **Synthetic Monitoring:** Create advanced monitors with custom variables and simulate interactions to identify potential issues before they impact users, allowing for proactive management and continuous improvement.

- **Service Workflow Management:** Design, test, and monitor complex API, browser, and MCP sequences to ensure seamless integrations and operations across your tech stack. Validate against OAS for design drift and adhere to industry standards such as FDX, FHIR, and FAPI for compliance and interoperability.

- **Immediate Issue Alerting:** Identify issues affecting availability, speed, and conformance to system expectations and obligations. Set alerts and view detailed call results and journeys with comprehensive OpenTelemetry logs (native integrations with Trafficpeak, Datadog, Dynatrace, and more).

APIContext is available as a SaaS platform, hosted on Akamai for optimal performance and reliability. This package includes unlimited endpoints, unlimited workflows, automatic retries, and tiered synthetic monitoring calls.

- **API and service uptime and performance monitoring:** APIContext provides advanced synthetic testing that goes beyond traditional uptime checks. It ensures that mission-critical APIs and services are not just available, but are performing optimally. Real-time insights pre-empt issues before they impact users.

- **Regulatory compliance and reporting:** Regulatory demands for financial services and critical infrastructure in banking, finance, and other sectors are increasing. APIContext automates mandatory API performance reporting and ensures compliance with evolving standards like FAPI, FDX, PSD3, and others. This reduces the burden on internal teams and mitigates the risk of non-compliance.

- **Close observability gaps:** APIContext assesses and benchmarks multi-system workflows across machine-driven workflows. This ensures that autonomous processes and agents can act with integrity and consistency to remediate issues quickly.
`.trim();

const documentationMarkdown = `
## Documentation

Full platform documentation can be found [here](https://docs.apimetrics.io/docs/getting-started-projects-and-apis).

APIContext supports multiple deployment models:

**Self-Service Configuration** - The SaaS platform does not need to be integrated into your environment. It manages monitoring externally, to track end-to-end experience. Monitor configuration is straightforward, with comprehensive documentation available [here](https://docs.apimetrics.io/docs/getting-started-projects-and-apis). Add unlimited endpoints, URLs, schedules, and alerts to be monitored from public points of presence.

**Import Existing Configurations** - In addition to manual configuration, APIContext supports importing of API endpoints from Postman, OpenAPI Specification (OAS), and other tools, allowing customers to easily integrate their existing configurations into the platform. This feature streamlines the setup process. Detailed guidance on importing API calls can be found [here](https://docs.apimetrics.io/docs/importing-api-calls).

**Hybrid Deployment** - To monitor internal services, APIContext has private agents that can be installed in any environment. Telemetry from private agents is shared with the SaaS infrastructure.

**Setup Service** - For customers who prefer a guided approach, APIContext offers dedicated setup assistance. The service provides a guided setup and configuration of key use cases, ensuring that the solution is tailored to the customer’s specific needs. Additionally, it includes two 2-hour web training sessions for teams, delivered via video conferencing, to ensure smooth adoption and ongoing success.
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

export const apiMetrics: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
