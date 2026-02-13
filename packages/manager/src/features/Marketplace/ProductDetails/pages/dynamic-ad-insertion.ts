/**
 * Product tab details for slug dynamic-ad-insertion.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Yospace has been at the forefront of the digital video revolution for 25 years. From the early days of mobile delivery, to the mass consumption and monetisation of premium streaming, we have a history of driving business success for the world's biggest telcos, broadcasters, and media companies.

Our pioneering dynamic ad insertion technology has helped monetise seven Olympic Games, five FIFA World Cups, and forty Grand Slam tennis tournaments. We have over 2,000 live channels under management and stitch over 8 billion advertisements per month.

Yospace sits under RTL Group's adtech unit.

Yospace operates at the forefront of Dynamic Ad Insertion (DAI) innovation. We bridge the parallel worlds of streaming technology and adtech, addressing the opposing forces of dynamic streaming at scale (managing manifest manipulation and delivering a better-than-broadcast viewer experience) and advanced advertising (including programmatic, data protection, and accurate, trusted measurement) to deliver a world-class, premium advertising solution for OTT.

Yospace's ad stitching capabilities deliver over 8.5bn one-to-one addressable ads per month in a way that is completely seamless for the viewer. We have a track record of delivering maximum ad fill-rates during the most demanding live events using an advanced Prefetch solution to support scale. We also deliver transparent viewability tools that are IAB compliant to build advertiser trust.

The depth of our experience that is specific to Dynamic Ad Insertion sets us apart. Combined with the reliability of our solution at scale, our 24/7 support function ensures that customers have experts alongside them through testing, launch, and onwards.

### **Key features**

* **Maximise Ad Relevance:** Each online user, whatever the device, creates an individual request to your ad server, so you can track your precise audience demographics to tailor and frequency cap each ad on an individual user basis.
* **TV User Experience. TV Reliability:** Consumers expect a broadcast-like viewing experience, which delivers seamless ad insertion with total reliability. Having monetised flagship global events for more than a decade, we are trusted to deliver the operational reliability that broadcasters expect.
* **Build advertiser trust with best-in-class measurement:** With integrated best-in-class ad measurement, you can rely on us to build trust with your advertisers. Lightweight client SDKs are available allowing you to deliver custom ad experiences including supporting interactive formats such as SIMID. Furthermore, you can take advantage of our built-in IAB-certified viewability through the Open Measurement SDK.
* **Flexible Microtargeted Alternate Content:** Deliver on your content rights commitments using our alternate content targeting. Define arbitrary user groups to be selected to receive alternate content for programming with conditional access.
* **Monetisation Orchestrated:** Our Orchestrator module builds ephemeral monetisable channels from a dynamic schedule of live events. Single Live Events created in this way are fully integrated into monitoring and analytics dashboards.

### **Use cases**

* **One-to-one addressability at scale:** Yospace has a rich history of monetising the world's biggest events, including 7x Olympic Games and 6x FIFA World Cups. Our solution delivers a true TV quality experience, with full addressability to maximise the value of ad spots. We regularly stitch 8.5 billion advertisements per month.
* **Unlock new inventory:** Yospace's innovations help media owners unlock new inventory in their OTT streams and maximise advertising revenue potential. We help open up on-the-fly ad spots in live events based on the state of play, and we're part of the industry working groups that are developing new ad formats, such as L-banner squeezebacks, side-by-side ads, and pause ads.
* **The best possible ad performance:** Our live dashboards surface real-time log data to help media owners make better decisions about their advertising. We regularly surpass 98% technical fill-rates.
* **Measurement that adds value:** We help build advertiser trust by providing IAB-certified SDKs that capture the data they need to assess the impact of their ad spend. We help provide advertisers with the confidence they need in OTT to spend more. We're part of the working groups within the IAB to develop the next phase of measurement standards.

Ready to take the next step in your advertising journey to unlock more inventory, improve performance, and increase ad revenues? Contact our team to arrange an introduction to one of our experts and discuss your requirements. We'll assign a dedicated Solution Architect to map out your project, offer advice, and build out a proof-of-concept.
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| Which protocol and DRM schemes are supported? | We support HLS+TS, HLS+CMAF and MPEG-DASH. Our solution is DRM transparent and many of our customers use a combination cbcs and common encryption supporting FairPlay, WideVine and PlayReady DRM schemes to protect their content. |
| What is the difference between SSAI and SGAI? | In both cases, we will make a call to an ad server to determine which ads are to be inserted into the user's content stream.  In the case of Server-side Ad Insertion ("SSAI") we will insert or replace existing content segments with the ads that have been selected.  Each user receives their own tailored version of the content manifest.  It has the broadest device/player compatibility.  Server-Guided Ad Insertion ("SGAI") is, broadly speaking, a concept where the player performs the ad stitching, guided by instructions from the server. The protocol extensions needed to implement SGAI based have been established for HLS and will be ratified for MPEG-DASH sometime in 2025.  There have also been some earlier proprietary implementations with some limited device support.  SGAI offers three main advantages.  The first is that all users can receive a single copy of the content manifest, which means, for live streaming, a reduction in the server capacity required when compared with SSAI regardless of the size of the DVR window offered.  The second advantage is that ad breaks are resolved as they are needed, resulting in the ability to dynamically resolve historic ad breaks in a large DVR window live streaming manifest, and for VOD, to allow each break to be dynamically resolved, as opposed to at stream start. ‍ Finally, SGAI provides for better compatibility with ultra low latency live streaming. |
| How will I transition my streams from SSAI to SGAI? | At the moment, in terms of device compatibility, there is limited support for SGAI, but throughout 2025 and into 2026 we expect to see more options. Most broadcasters will operate a blend of SSAI and SGAI, with SSAI slowly phasing out over the next 5 years or more. Our service is designed to make this transition effortless. Customers using SSAI today can simply divert compliant players to the SGAI version of their streams with little or no change in configuration. |
| How do you do the ad targeting? | You will use your existing ad server and audience tracking solutions to perform the user targeting. VAST or VMAP compliant ad platforms are supported. A wide range of configuration options make integration and validation really straightforward. |
| Does Yospace handle high traffic volumes? | Yes, our geographically distributed platform is specifically designed to support the large audiences that are associated with live sport and event television. The service is trusted by some of the world's largest sporting rights holders. It is designed to work alongside your existing single or multi-CDN strategy for the delivery of the binary video data to end users. |
| Do you perform transcoding of the ad assets? | Ad transcoding is a core function of our solution. By normalising ad content we can not only better guarantee the user experience from a qualitative perspective (such as audio level normalisation), but it also guarantees stream integrity -- ensuring that an ad cannot "break" a user's streaming experience. Ad transcoding takes place automatically, although we have APIs to allow pre-loading of ad assets as part of the ad trafficking process by your ad operations teams. |
| Does Yospace require client-side SDKs | We provide an Ad Management SDK, which is optional for SSAI live streaming, but required for VOD streaming and Live SGAI streaming. The Ad Management SDK is available for iOS, Android, C++ and Roku as native SDKs. We also provide a TypeScript (JavaScript) SDK which is compatible with browsers and most connected TVs. The SDKs provide enhanced functionality for live streaming such as client-side ad tracking, clickthrough and overlays. We also offer built-in viewability measurement using an IAB-certified adapter to the Open Measurement SDK. ‍ We also offer enhanced server-side measurement for live streaming for when integrating an SDK is not practical. |
| Security | TLS 1.3, AES-256 encryption at rest, VPC peering support |

### **Live streaming high level architecture**

![Live streaming high level architecture](/assets/marketplace/Yospace-live-streaming-workflow.jpeg)

* **Live Stream Acquisition, Transcoding & Event Conditioning:** Responsible for acquiring the live signal and transcoding it into HLS or MPEG-DASH with SCTE-35 break markers. The ESAM Playout Automation Gateway is an optional Yospace component that can take real-time data from your automation system to inject SCTE-104/35 markers into your source stream
* **Origin Server:** The encoded live stream is placed onto an origin server, or a CDN entry point. It is from this location that the yospaceCDS service pulls a copy of only the stream manifest. Because our service doesn't need to inspect the content segments, it is agnostic to both plaintext or DRM protected content.
* **Real Time KPI Dashboard:** Our Dashboard provides you with the most critical up-to-date information regarding monetisation performance, giving you a near-real time insight into the interactions between our platform and your ad tech partners.
* **Data Integration:** For customers that need to integrate our platform data into their own reporting systems, we offer both a real time API providing key metrics found in our out-of-box dashboard. We also offer full access to all system log data, empowering you to develop your own custom reports to suit your operational requirements.
* **Ad Management SDK:** Our optional SDKs are responsible for handling best-in-class ad tracking as well as IAB-certified OM SDK viewability measurement. The SDKs also support the integration of interactive formats such as SIMID. Native implementations available for iOS, tvOS, Android, Roku, with all other platforms handled with our JavaScript/ECMAScript or C++ SDKs.
* **Ad Server Integration:** yospaceCDS integrates with VAST/2.0/3.0/4.0/4.2 compliant services through simple UI-based configuration. The service is currently active with customers using FreeWheel MRM, Google Ad Manager, smartclip, SpringServe, INVIDI, Magnite and countless downstream DSPs. Advertising copy is automatically transcoded by our platform and placed onto a nominated delivery CDN.
* **Ancillary Integration Touchpoints:** The yospaceCDS solution supports a variety of touch points to implement business requirements such as an SCTE-224 (or similar) endpoint for regional blackout; POIS - an external service to enrich the metadata associated with a break, allowing for enhanced targeting, or removal of placement opportunities based on business rules.

### **End-to-end high level architecture for VOD streaming DAI**

![End-to-end high level architecture for VOD streaming DAI](/assets/marketplace/Yospace-VOD-workflow.jpeg)

* **VOD Asset Creation Workflow:** Our VOD solution leverages your existing VOD asset creation workflow. Create and transcode content as you would normally, placing it on  one or multiple CDNs, and use Yospace SSAI to dynamically fetch content from the CDN and deliver ad-stitched VOD assets.
* **Ad Management SDK:** SDK responsible for handling ad performance tracking, and trick-play policy enforcement. Native implementations available for iOS, Android, and Roku.  Connected TVs and other devices are supported by the JavaScript or C++ versions.
* **Ad Server Integration:** For VOD DAI, we support VAST/3.0 or VAST/4.2 wrapped in a VMAP response. The ad request template can be configured easily through the yospaceCDS Management Console. Advertising copy is automatically transcoded by yospaceCDS and placed onto a nominated delivery CDN.
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const dynamicAdInsertion: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
