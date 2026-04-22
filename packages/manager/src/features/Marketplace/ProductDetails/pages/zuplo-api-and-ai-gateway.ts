/**
 * Product tab details for slug zuplo-api-and-ai-gateway.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Zuplo is a programmable gateway that adapts to virtually any API use case. It excels at the full spectrum of API product delivery from authentication, key management, and rate limiting to more agentic-driven use cases like AI gateway and MCP server management. Its combination of built-in policies and TypeScript extensibility means teams can implement exactly the behavior they need without operating or maintaining gateway infrastructure. Deployed on the Akamai Connected Cloud, Zuplo is directly embedded into Akamai’s distributed CDN to optimize performance and reliability.

At its core, Zuplo is a developer-first platform. The OpenAPI spec drives routing, schema validation, and documentation, while TypeScript handles the business logic with no proprietary DSLs or specialized gateway expertise required. Every project includes an integrated developer portal built from the same spec with interactive docs, a live API playground, and self-serve API key management so partners can onboard without manual provisioning. Zuplo stores all configurations as text-based files, making GitOps a natural fit. Every project connects natively to a Git repo and every branch gets its own isolated preview environment.

Zuplo extends naturally into agentic architectures, where its AI gateway governs how agents interact with LLM providers through token limits, dynamic routing, and semantic caching, while its MCP layer exposes backend APIs as structured tools that agents can discover and call, with consistent policy and observability across the full agentic workflow.

### Key features

**Programmable gateway logic**: Write custom request and response handling in TypeScript, versioned in source control and deployed automatically via a GitOps workflow without proprietary scripting languages or XML-based policies required.
**OpenAPI-first routing**: Import OpenAPI specifications to generate routes, enforce JSON schema validation, and keep gateway configuration in sync with your API contract.
**Built-in authentication**: Support JWT validation, API keys, OAuth 2.0, and mTLS out of the box, with fine-grained policy enforcement at the route level and the ability to stack multiple auth mechanisms.
**Rate limiting and quotas**: Apply configurable, globally distributed rate limits per user, tenant, or custom attribute to protect backend services and ensure fair API consumption across consumers.
**Integrated developer portal**: Empower partners and consumers with a self-serve, customizable experience for API key management, documentation, and subscription management.
**API monetization**: Define pricing plans and meter usage via Stripe integration, and enforce quotas at the gateway to turn APIs into revenue-generating products with controlled, tiered access.
**AI gateway and MCP support**: Proxy requests to language model providers with provider-switching, token-aware rate limiting, and spend controls. Expose APIs as callable tools for agents and language models via native MCP support.
**GitOps and CI/CD deployment**: Every Git push triggers an automatic deployment. Branch-based preview environments give teams isolated, production-equivalent instances for every pull request.
**Observability and integrations**: Forward structured logs and metrics to Datadog, Dynatrace, New Relic, Splunk, Grafana Loki, Google Cloud Logging, Sumo Logic, and others. Full OpenTelemetry support for distributed tracing.

### Use cases

**Securing API access for partners and external developers**
Enable authenticated API access using API keys, JWT, or OAuth, with partner onboarding and key lifecycle management handled via the integrated developer portal. Enforce endpoint-level access controls, custom rate limits, and schema validation, while protecting backend services from abuse.

**AI and MCP tool integration**
Govern every step of agentic workflows from LLM interactions, where Zuplo's AI gateway enforces token limits, dynamic routing, and semantic caching, to backend execution, where your APIs are exposed as structured tools that AI agents can discover and call.

**API transformation and orchestration**
Apply custom TypeScript logic to modify request and response payloads, route traffic based on headers or parameters, and aggregate responses from multiple backend services behind a single API surface. Useful for unifying legacy systems, adapting third-party APIs, or implementing API versioning strategies without changes to backend services.

**API monetization**
Define pricing tiers, meter API consumption at the gateway, and integrate with Stripe to charge consumers based on usage. Enforce hard and soft quota limits per plan, and give consumers real-time visibility into their usage through the developer portal, enabling a complete API-as-a-product workflow.

Ready to ship production-grade APIs and manage agentic workflows? Sign up at Zuplo to import your OpenAPI spec, configure policies, and deploy your first gateway in minutes.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment Model** | SaaS, deployed on Akamai Cloud |
| **API Type** | REST, GraphQL, WebSocket, HTTP/2, SOAP (via HTTP proxy) |
| **Programming Languages** | TypeScript (custom policies, handlers, and modules via @zuplo/runtime); shareable via npm packages |
| **Data Volume Limits** | 500 MB maximum request body limit (per request). You can find additional platform limits [here](https://zuplo.com/docs/articles/limits). |
| **Latency** | <br /> Zuplo adds approximately 20-30 ms of base latency with no policies. Individual policies typically add 1-5 ms each, while more complex policies, such as authentication, rate limiting, or custom code can add 5-15 ms. <br/><br/> The gateway is embedded in the Akamai Connected Cloud to optimize performance with the Akamai edge network. |
| **Availability SLA** | Enterprise SLA with contractual uptime guarantees; 24/7 incident response; redundant by design with no single point of failure and no maintenance windows |
| **Security** | TLS 1.2+ in transit, AES encryption at rest, mTLS (client-gateway and gateway-backend), IP allowlisting, native plugin for API security, and Firewall for AI |
| **Compliance** | SOC 2 Type II, Trust & Compliance Report available on request |
| **CI/CD and GitOps** | Native GitHub integration, branch-based preview environments, Zuplo CLI for pipeline-based deployments, deployments complete in under 20 seconds |

Zuplo is deployed on Akamai Connected Cloud, providing a programmable API and AI gateway deeply integrated within Akamai's CDN, traffic management, and security stack. Authentication, rate limiting, schema validation, and agentic workflows are enforced as requests flow through the gateway, before reaching your backend services. The result is a single, globally distributed control plane that governs both traditional API traffic and AI-driven workloads without additional infrastructure to operate or maintain.

![Zuplo Diagram](/assets/marketplace/zuplo-diagram.jpg)

`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const zuploApiAndAiGateway: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
