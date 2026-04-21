/**
 * Product tab details for slug scalstrm-vod-offline-transcoding.
 *
 * Content is provided as Markdown strings which are rendered at runtime.
 */

import type { ProductTabDetails } from '.';

const overviewMarkdown = `
Scalstrm VOD Offline Transcoding delivers a streamlined, single-platform solution for video-on-demand workflows, enabling broadcasters and content providers to efficiently process, package, and deliver media for HLS and DASH streaming. By integrating seamlessly with Scalstrm Origin, it eliminates the complexity of traditional transcoding pipelines while ensuring high-performance, reliable streaming experiences. Both automated and manual workflows are supported, giving teams full control over content preparation without sacrificing efficiency.

Built on **a modular microservices architecture**, the platform separates transcoding and packaging into dedicated services. Jobs can be scheduled via the built-in GUI, API, or watch-folder, with multiple templates assignable to specific tasks. Scalstrm supports CPU, VPU, and GPU processing with multi-card scheduling, enabling fast, resource-efficient transcoding at any scale. Advanced monitoring and troubleshooting tools provide complete visibility into workflow status and performance.

Designed as a seamless extension of the Scalstrm ecosystem, the platform scales effortlessly from small VOD collections to extensive media libraries. Its combination of flexibility, modern technology, and robust reliability makes it an ideal choice for teams seeking a scalable, efficient, and fully managed offline transcoding solution.

### Key features

* **Single-platform efficiency**: Streamline VOD transcoding and packaging in one platform, fully integrated with Scalstrm Origin.
* **Flexible scheduling**: Automate jobs via GUI, API, or watch-folder to manage ingest and transcoding workflows effortlessly.
* **Advanced transcoding**: Leverage CPU, VPU, and GPU support with multi-card scheduling for faster, resource-efficient processing.
* **Template-driven workflows**: Assign multiple templates to jobs for consistent output and simplified content management.
* **Comprehensive monitoring**: Track job status, performance metrics, and troubleshoot issues with built-in tools.
* **HLS/DASH packaging**: Deliver ready-to-stream media with adaptive bitrate support for seamless playback across devices.
* **Scalable architecture**: Deploy micro-services independently for optimal performance, redundancy, and resource utilization.
* **Seamless integration**: Extend existing Scalstrm workflows without disruption, ensuring reliable, high-quality streaming.

### Use cases

#### Scalable, Resilient VOD Deployment with Offline Transcoding
A broadcaster needs a flexible VOD workflow that can efficiently handle offline transcoding and Just-in-Time packaging for HLS/DASH delivery. Using Scalstrm's microservices-based Origin platform, transcoding is handled by Mechanic/Mechmanager services and packaging by Librarian, which can be deployed on two separate on-premises servers for efficient, resource-optimized performance.
The management services and transcoding orchestrator run on a virtualized VM environment, enabling seamless integration with third-party APIs, monitoring platforms, and watch-folder workflows. 

#### Cloud-Backed VOD Origin for Resilient Delivery
To ensure uninterrupted VOD streaming, cloud-based Scalstrm Origin instances serve as a backup to on-premises servers. These instances can be activated instantly if on-premises hardware fails, fetching content from both local storage and S3. This architecture provides automatic failover, high availability, and scalable delivery, guaranteeing resilient streaming even during maintenance, hardware issues, or peak traffic periods.

#### Cloud-Based Upscaling for High-Volume VOD Transcoding
When broadcasters need to process large libraries or handle peak workloads, Scalstrm enables cloud-based upscaling of offline VOD transcoding. Additional cloud resources can be dynamically allocated to manage bursts of content, such as major events or full-library migrations from legacy systems. This ensures fast, efficient, and reliable transcoding across HLS/DASH formats without impacting ongoing operations, allowing teams to complete large-scale content preparation on-demand.

#### Simplify your VOD workflow with Scalstrm VOD Offline Transcoding
Easily schedule jobs, apply templates, and monitor performance through the intuitive GUI, API, or watch-folder.

**Book a demo today** to see how advanced CPU/VPU transcoding, HLS/DASH packaging, and built-in monitoring make content preparation fast, efficient, and reliable.

`.trim();

const documentationMarkdown = `
| Specification | Details |
| :---- | :---- |
| **Speed, cost, and quality for large-scale content libraries** | Scalstrm's VOD Offline Transcoding engine delivers the perfect balance between speed, cost, and quality for large-scale content libraries. Ideal for broadcasters, OTT platforms, and content owners, it efficiently processes massive volumes of assets with frame-accurate precision and consistent output across all codecs and resolutions. |
| **Orchestration - built-in workflow automation and advanced parallelization** | With built-in workflow automation and advanced parallelization, our solution reduces processing time and operational overhead, turning static libraries into high-quality streaming-ready content. |
| **Multi-format support** | High-throughput batch processing <br /> Multi-format support (H.264, HEVC, AV1, VP9, etc.) <br/> Intelligent load distribution for faster turnaround <br/> Optimized encoding profiles for every device and bandwidth |



![Scalstrm VOD Workflow](/assets/marketplace/scalstrm-vod-workflow.jpg)

### VOD Transcoding Workflow: Optimized for Efficiency, Consistency, and Control
Scalstrm's VOD Transcoding engine transforms large-scale content libraries into streaming-ready assets with speed, precision, and consistent quality. Designed for broadcasters, OTT platforms, and content owners, it handles massive volumes of video with frame-accurate transcoding across all popular codecs and resolutions.

The workflow begins with content ingestion, either via watch folder, API, or GUI, feeding assets into the Mechanic/Mechmanager transcoding services. Using high-throughput batch processing and intelligent load distribution, the system parallelizes encoding tasks to reduce turnaround times while minimizing operational overhead.

The platform's multi-format support (H.264, HEVC, AV1, VP9) ensures compatibility across a wide range of endpoints, while built-in workflow automation maintains consistent output quality, making it easy to scale processing for large libraries, peak events, or system migrations.

After transcoding, Librarian services package content into HLS and DASH formats, applying optimized encoding profiles for each device type and bandwidth.
`.trim();

const pricingMarkdown = `
Pricing details will be discussed directly with the third-party provider Sales team after your request is received, and the third-party provider contacts you. Costs of the product you will be purchasing from the third-party provider will be charged by the third-party provider. For the referral motion, Akamai is not a party in the purchase contract.

The full price of the product cost should be clarified between you and the third-party provider within the agreed upon terms and conditions of the purchase contract.
`.trim();

const supportMarkdown = `
For product support, reach out to the vendor directly. You can find contact information in the product documentation and on the vendor's website.
`.trim();

export const scalstrmVODTranscoding: ProductTabDetails = {
  overview: overviewMarkdown,
  documentation: documentationMarkdown,
  pricing: pricingMarkdown,
  support: supportMarkdown,
};
