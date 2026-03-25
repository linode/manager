/**
 * Product tab details for slug clouddat.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
CloudDat<sup>®</sup> for Akamai is an accelerated file transfer server that lets you upload and download files and objects at gigabits per second from anywhere in the world. CloudDat is purpose-built for moving large data sets as a part of everyday file transfers, cloud ingest projects, cloud migrations, and customer onboarding initiatives.

CloudDat server software is hosted on an Akamai/Linode compute instance with access to a filesystem or object bucket in the same region.

CloudDat is not a service: you fully control your instance and storage. We never touch your data, giving you maximum security and control. Setup takes just a few minutes and easy-to-use clients can be downloaded and installed in seconds.

### Key features

- **High Performance:** Fastest possible upload from any location across internet, private, and stressed data paths.
- **Cost-Effective:** Simple and predictable pricing with no charges for bandwidth or data size (no per-GB charges) and no lock-in contracts.
- **Security:** CloudDat for Akamai is not a service: you fully control your instance and storage. We never touch your data, giving you maximum security and control.
- **Easy-to-Use:** Setup takes just a few minutes and easy-to-use and deploy clients can be downloaded and installed in seconds. Clients require no installation or administrative privileges: just download and run. It takes mere minutes to install CloudDat's powerful object server on a new or existing compute partner instance.
- **Free Trials:** Obtain free trials of CloudDat for Akamai from Data Expedition, Inc. and see for yourself.

### Use cases

**Cloud Migration**

Transfer bulk data from data-centers or cloud platforms into Akamai storage. Cross-platform CloudDat clients can be deployed for end-user or scripted data transfer. Each CloudDat server deployed in Akamai can receive data at up to three gigabits per second, allowing you to minimize total transfer time.

**Customer Onboarding**

New customers and projects often require uploading large amounts of data before work can begin. CloudDat clients are easy to deploy for end-users and automated systems, allowing you to complete this critical stage quickly and begin billable work sooner.

**Cloud Ingest**

Many cloud workflows require an ongoing stream of new data. Media post-production, industrial engineering, bioinformatics, and AI model training are just a few examples where cloud processes demand high-bandwidth inputs.

Ready to try CloudDat<sup>®</sup> for Akamai for yourself? Contact the Data Expedition, Inc. team to get your Free Trial today. We'll work with you to discuss the specifics of your use case and workflow to recommend the best deployment model for CloudDat<sup>®</sup> for Akamai to help achieve your accelerated data transfer goals. Simple, easy-to-use, and cost-effective!
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Deployment model** | Customer Deployed |
| **Linode services required** | Linux Compute |
| **Supported data storage** | Compute, Block, Object |
| **Client platforms supported** | Linux, Mac, Windows |
| **Security** | AES-128 In Transit, Customer deployed storage |
| **Maximum File/Object size** | 8 Exabytes |
| **Maximum total storage** | Unlimited Bytes / Unlimited Items |
| **Maximum bandwidth** | 3 Gigabits per second per Linode instance |
| **Maximum path latency** | 20,000 milliseconds default (higher with configuration) |
| **Maximum path packet loss** | 50% |

#### Full documentation could be found [here](https://www.dataexpedition.com/clouddat/akamai/).

#### CloudDat server software is hosted on an Akamai/Linode compute instance with access to a filesystem or object bucket in the same region. CloudDat clients accelerate the data transfer to and from the server, allowing for high performance over the WAN.

![CloudDat Architecture](/assets/marketplace/clouddat.svg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const clouddat: ProductTabDetails = {
  documentation: documentationMarkdown,
  overview: overviewMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
