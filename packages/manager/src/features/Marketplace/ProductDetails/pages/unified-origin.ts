/**
 * Product tab details for slug unified-origin.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Use a single source to stream all your video content to any device. Unified Origin lets you stream live or VOD (Video on Demand) content to all devices while supporting all major DRM systems.

Ingest content in one of the available formats (MP4, fMP4, HLS) and package it on-the-fly to the HLS, MPEG-DASH, CMAF, HDS, HSS, HbbTV, and Progressive formats.

Live stream with restart and catch-up. Package and secure live video just-in-time (JIT) into formats that reach any internet-connected device, including HLS (TS & CMAF), (DVB-)DASH, HbbTV, HDS, and Smooth. Deliver 24/7 live linear channels, events, concerts, sports, or breaking news.

### Key features

* **All industry-standard playout formats**: HLS (TS & CMAF), (DVB-)DASH, HbbTV, HDS, and Smooth.
* **Cutting-edge codecs**: AV1, HEVC, Dolby Atmos, Dolby AC-4, DTS:X.
* **Content protection**: Supports every major DRM system, including FairPlay, Marlin, PlayReady, and Widevine.
* **Easy deployment**: Full flexibility in deploying from container to virtual machine (VM) using standard operating systems.

### Use cases

* Video on Demand (VOD) streaming, including AVOD, SVOD, and TVOD
* Live streaming (events or 24/7)
* Dynamic Ad Insertion (DAI), live ad replacement, or VOD ad insertion
* DRM and content protection, high-frequency key rotation

### Resources

* [Getting Started with Cloud](https://docs.unified-streaming.com/tutorials/cloud-guide/index.html)
* [Getting Started with DRM](https://docs.unified-streaming.com/tutorials/drm/index.html)
* [Getting Started with Origin - VOD Streaming](https://docs.unified-streaming.com/tutorials/vod/getting-started.html)
* [Getting Started with Origin - Live Streaming](https://docs.unified-streaming.com/tutorials/live/index.html)
* [Live streams with Dynamic Ad Replacement](https://docs.unified-streaming.com/documentation/live/scte-35.html)
`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Supported video codecs** | AOMedia AV1 (av1-isobmff v1.2.0), H.266 / VVC (ISO/IEC 23090-3), H.265 / HEVC (ISO/IEC 23008-2), H.264 / AVC3 (ISO/IEC 14496-10), H.264 / AVC1 (ISO/IEC 14496-10), LCEVC, VC-1 / SMPTE 421M, VP9 |
| **Supported audio codecs** | AAC / MPEG 4-AAC (LC, HE) (ISO/IEC 14496-3), DTS HD/Express, DTS:X (DTS-UHD profile 2), Dolby Digital (AC-3), Dolby Digital+ (EC-3), Dolby Atmos, Dolby AC-4, FLAC, Fraunhofer HE-AAC multichannel, xHE-AAC, MPEG 1-Audio Layer 3, MPEG-H, WMA Pro |
| **Supported DRM systems** | AES-128, China DRM, Conax PlayReady, Irdeto PlayReady, PlayReady Envelope, Verimatrix VCAS, Adobe Primetime DRM, SAMPLE-AES, FairPlay DRM, Cisco VG, Latens Titanium URM (Arris), Marlin, Microsoft PlayReady, Nagra Media PRM, ViaccesOrca (VODRM), Widevine |
| **Supported encoders** | For Live, all encoders that produce output according to Interface 1 of the DASH-IF Live Media Ingest specification are supported. For VOD, the basic requirement is that audio and video content is contained in ISO BMFF (i.e., (f)MP4) with GOP alignment across bitrates and all video fragments starting with an IDR frame. For text and timed metadata, additional formats are supported. Also, a HLS stream that adheres to a strict set of requirements may be used as ingest for Unified Origin for VOD (although this is not recommended). Furthermore, content should be encoded in one of the Supported Codecs for both Live and VOD. |
| **Supported formats** | DVB-DASH specification (ETSI TS 103 285), HbbTV 1.5 (MPEG-DASH), 2.0 (DVB-DASH), HDS Version 1 and version 2 (late binding), HLS Version 1 to 7 (Both TS and fMP4), ISO/IEC 23009-1 section 8.3 (ISO BMFF On Demand profile, Live profile, Main profile, MPEG-2 TS Main profile), DASH-AVC/264 section 6.3, HSS (Smooth Streaming) |
| **Supported ingest** | ISO/IEC 23000-19 Common Media Application Format, Protected Interoperable File Format (PIFF), MPEG-DASH (VOD only), ISO/IEC 14496-14 (MP4), HLS VOD only, Common File Format (CFF - ISO/IEC 14496-12) TTML (SMPTE-TT, EBU-TT, DFXP), SRT, ISMT, WebVTT, Dolby Vision, HDR10, HDR10+, HLG, Timed Metadata (ISO BMFF - MPEG-B part 18, SCTE 35, DASH Event Messages ("emsg"), ID3 tags) |
| **Supported operating systems** | Alpine, Amazon Linux, Debian, Rocky Linux, Ubuntu, Windows |
| **Supported deployment** | Hardware, Virtual Machine, (Docker) Container, Kubernetes |

Flows Unified demonstrates how Unified Origin can use both VOD and live input and how it works together with other Unified products.

![Unified Origin Flows](/assets/marketplace/unified-origin-flows.jpg)

Find more information on Unified Origin VOD [here](https://docs.unified-streaming.com/documentation/vod/index.html).

![Unified Origin VOD](/assets/marketplace/unified-origin-vod.jpg)

**Stream from a single source**
Package and secure a single Video on Demand (VOD) presentation just-in-time (JIT) into formats that reach any internet-connected device. This is a future-proof solution that scales to demand, is highly resilient, and meets the infinitely evolving needs of broadcasters, telcos and streaming providers looking to offer the most advanced, high-quality personalized service.

Find more information on Unified Origin Live [here](https://docs.unified-streaming.com/documentation/live/index.html).

![Unified Origin Live](/assets/marketplace/unified-origin-live.jpg)

**Live stream with restart and catch-up**
Package and secure live video just-in-time (JIT) into formats that reach any internet-connected device. Deliver 24/7 live linear channels, events, concerts, sports, or breaking news. Enable restart and catch-up functionality to improve the stream’s end user experience.

Find more information on Unified Origin DAI [here](https://docs.unified-streaming.com/documentation/live/scte-35.html).

![Unified Origin DAI](/assets/marketplace/unified-origin-dai.jpg)

**Live streaming with Dynamic Ad Replacement**
Ad replacement for live is built following industry specifications for assured interoperability with global ad vendors and partners. Chosen by major broadcasters, streaming providers, and telcos for its ease of integration, playout compatibility, and quality of user experience. A proven solution replacing advertisements in live streams watched by millions of viewers every day.

Find more information on Unified Origin DRM [here](https://docs.unified-streaming.com/documentation/drm/index.html).

![Unified Origin DRM](/assets/marketplace/unified-origin-drm.jpg)

**Live and VOD with encryption, DRM and content protection**
Unified Origin supports all major DRM systems. Using on-the-fly encryption means encryption is added when the fragment is served. This works for both clear and pre-encrypted content for VOD as well as for live content. 

Find all available documentation [here](https://docs.unified-streaming.com/index.html).



`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const unifiedOrigin: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
