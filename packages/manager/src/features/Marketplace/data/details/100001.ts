/**
 * Product tab details for id 100001.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const details: ProductTabDetails = {
  overview: {
    description: `
## SpinKube Overview

SpinKube is an open source project that streamlines the experience of deploying and operating Wasm workloads on Kubernetes, using Spin Operator in tandem with runwasi and runtime class manager.

With SpinKube, you can leverage the advantages of using WebAssembly (Wasm) for your workloads:

- Artifacts are significantly smaller in size compared to container images.
- Artifacts can be quickly fetched over the network and started much faster (Note: We are aware of several optimizations that still need to be implemented to enhance the startup time for workloads).
- Substantially fewer resources are required during idle times.

### Features include:

| Feature | Basic Plan | Middle Plan | Ultra Plan |
| :--- | :--- | :--- | :--- |
| Feature 1 | Plan 1 | Plan 3 | Plan 5 |
| Feature 2 | Plan 2 | Plan 4 | Plan 6 |
    `.trim(),
  },

  pricing: {
    description: `
## Pricing

Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
    `.trim(),
  },

  documentation: {
    description: `
## Getting started with SpinKube

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacus arcu, rhoncus id rhoncus nec, dictum nec arcu. Duis et ullamcorper libero. Cras eget dui fermentum, commodo mauris at, ultrices dolor. Nunc eleifend, nibh ac malesuada scelerisque, mi velit mollis erat, quis condimentum dolor metus vel dolor. Praesent id metus ac sem sollicitudin cursus. Nunc eleifend dui placerat magna scelerisque auctor. Donec venenatis vulputate bibendum. Donec sagittis, dui vel fringilla sagittis, nisl arcu bibendum dolor, ac viverra mauris nisi sit amet justo. Aenean efficitur varius bibendum.
    `.trim(),
  },

  support: {
    description: `
## Support

For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
    `.trim(),
  },
};

export default details;
