/**
 * Product tab details for slug rad-security.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
## Overview

RAD is a runtime-native security platform built to operate inside dynamic, containerized environments. It ingests signals from cloud infrastructure, workloads, identity providers, and data flows, then correlates them in real time to surface risk rather than static posture drift or theoretical exposures. The system is designed to analyze behavior as it happens, detect deviations from established baselines, and produce security outcomes with traceable logic.

The platform includes RADBot, an AI-driven automation layer that performs continuous analysis across runtime, configuration, and identity data. It identifies blast radius, flags misconfigurations tied to active workloads, and reconstructs incidents without needing predefined rules. Findings are prioritized based on exploitability, business impact, and observed activity. Teams can interrogate the data directly through a natural language interface, with evidence attached to every conclusion.

RAD integrates cleanly into existing environments. It connects to your stack through agentless collectors or eBPF-based runtime instrumentation, supports structured ingestion from third-party tools, and outputs context-aware results into ticketing or messaging systems. Security teams use it to shrink investigation cycles, reduce false positives, and replace multiple disconnected workflows with a single operational layer grounded in real-time telemetry.

### Key features

* **Identify real risk instead of noise** - Correlate runtime behavior, config changes, and identity activity to surface what’s exploitable, not just what’s misconfigured.
* **Investigate incidents in seconds** - Use RADBot to reconstruct attack paths, find root cause, and gather evidence without pivoting between tools.
* **Track sensitive data in motion** - Monitor how PII moves through services and APIs in real time to catch violations early and support continuous compliance.
* **Shrink response time with smart automation** - Trigger remediation workflows, generate reports, and escalate tickets based on prioritized, contextual findings.
* **Baseline and detect behavioral anomalies** - Automatically learn normal workload behavior and flag deviations tied to potential compromise or lateral movement.
* **Map exposure across cloud environments** - Visualize blast radius and path-to-impact for any finding using live topology and access context.
* **Cut alert volume without losing fidelity** - De-duplicate signals across tools and enrich them with source metadata to focus teams on what actually matters.
* **Prove compliance with live evidence** - Generate audit-ready output aligned to frameworks like NIST, ISO 27001, and FAIR AI directly from operational telemetry.

### Use cases

**Triage and Investigate Cloud Incidents Without Switching Tools**

Security teams receive alerts from posture scanners and EDRs but often lack the runtime visibility to validate risk. RAD correlates misconfigurations, identity activity, and process behavior to reconstruct incidents automatically. Analysts can drill into execution paths, network flows, and user actions in a single view—no SIEM digging required.

**Detect and Contain PII Leaks Across Cloud Workloads**

Sensitive data flows between services, APIs, and regions without visibility in most environments. RAD monitors PII movement in real time and flags unauthorized access or transmission based on geo-boundaries, identity permissions, and workload behavior. Teams can enforce policy without needing static data tagging or complex labeling rules.

**Prioritize Vulnerabilities Based on Runtime Reachability**

Traditional CVE scanners report hundreds of issues, most of which aren't in active use. RAD watches which packages are loaded into memory, which binaries are executed, and which identities interact with vulnerable components. This allows teams to focus on real exposure instead of theoretical risk.

**Support Compliance with Continuous, Evidence-Backed Reporting**

Frameworks like SOC 2 and ISO 27001 require not just controls, but proof of enforcement. RAD generates audit-ready reports using live detections, policy mappings, and activity logs—automatically. GRC and security teams share a single source of truth, without chasing screenshots or duplicating effort.

**Govern Shadow AI and Unmanaged Model Deployments**

AI models and LLM integrations are showing up across cloud environments without oversight. RAD fingerprints AI activity in runtime, flags unsanctioned model usage, and tracks sensitive data flows to and from inference pipelines. This gives platform and security teams control over AI sprawl without blocking innovation.

Schedule a demo with our team to explore how agentic security can streamline your investigations, reduce alert fatigue, and deliver real-time risk insight across your cloud stack. We’ll walk you through key workflows, answer technical questions, and show exactly how RAD fits into your environment.
`.trim();

const documentationMarkdown = `
## Documentation

All RAD Security Documentation may be found here: [https://docs.rad.security/](https://docs.rad.security/)

| Specification | Details |
| :---- | :---- |
| **Deployment Model** | SaaS, partially On-premise |
| **Supported Data Sources** | Audit trails for: AWS, GCP, Azure, K8s, runtime sensors crowdstrike, tenable, okta, etc (lookup integrations) |
| **API Type** | RESTful API |
| **Programming Languages** | N/A |
| **Data Volume Limits** | Up to 5TB per day for current ingested runtime behavior data |
| **Latency** | <200ms for most operations |
| **Availability SLA** | 99.99% uptime |
| **Security** | TLS 1.3, AES-256 encryption at rest, VPC peering support |
| **Compliance** | SOC 2 Type II |

### High level architecture

![High level architecture](/assets/marketplace/rad-security-architecture.jpeg)
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

export const radSecurity: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
