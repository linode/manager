import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Ateme is a global leader of video compression and delivery solutions helping tier-one content providers, service providers and streaming platforms to boost their viewership and subscription engagement. With Ateme solutions you can build a platform for streaming, OTT or IPTV services that captivates your audience with outstanding experiences. And you do that while saving infrastructure costs and minimizing your carbon footprint.

Ateme helps by improving your end user experiences, reduces TCO, and simplifies operation.

With the partnership with Akamai, Ateme expands its video streaming ecosystem offering further with Akamai Cloud and CDN. 

Ateme's solutions are deployed by professional service teams on Akamai Cloud. The solution leverages Akamai shared compute instances, Block Storage, VLANs & Node Balancer, LKE Kubernetes platform, and Akamai CDN.

### **Benefits**

* **Offer a premium viewing experience:** Deliver the highest quality content at the lowest bitrate to delight your audiences with all kinds of content - including UHD, 4K, and HDR. Ensure low latency on all platforms and broadcast-level latency on streaming platforms, with reduced rebuffering.
* **Outstanding video experiences:** Launch broadcast-quality, low-latency TV services quickly and securely. Wow your audience with the ultimate viewing experience on any screen with 4K HDR and immersive sound. Engage with them based on personalized channels and interactive content enabled by 5G.
* **Reduce total cost of ownership:** Save bandwidth and storage requirements with the unmatched compression efficiency of TITAN encoders/decoders, faster-than-real-time capabilities, and simultaneous processing of all formats. Reduce waste and complexity with a single workflow for both live and file transcoding. Optimize your delivery platform by repurposing available cloud-native resources for file transcoding.
* **Go green:** Save bandwidth and storage requirements with the unmatched compression efficiency of Kyrion and TITAN. Optimize your delivery platform by repurposing available cloud-native resources for file transcoding. Reduce waste and complexity with a single workflow for both live and file transcoding. Go green – with no compromise on video quality.
`.trim();

const documentationMarkdown = `
The Ateme Live OTT solution provides a robust, three-tier delivery workflow on Akamai. The process begins with the Cloud Gateway (TITAN Edge), which ingests live feeds via a public SRT stream. Next, the Live Transcoders (TITAN Live) encode the video pipeline into adaptive bitrate video layers, which are then delivered through CMAF ingest to the final component, the Live Packager (NEA Live). This component formats the content for seamless delivery to end users via the Akamai Global CDN and OTT video players.

![Ateme Flow](/assets/marketplace/ateme-flow.jpeg)
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const titanVideoProcessingAndCompression: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
