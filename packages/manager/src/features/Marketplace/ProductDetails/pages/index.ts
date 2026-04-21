import { apiMetrics } from './api-metrics';
import { cambriaStream } from './cambria-stream';
import { cloudcasa } from './cloudcasa';
import { clouddat } from './clouddat';
import { cyclops } from './cyclops';
import { dynamicAdInsertion } from './dynamic-ad-insertion';
import { heroEncoder } from './hero-encoder';
import { liveEncoder } from './live-encoder';
import { multiplayerGameServerHostingOrchestration } from './multiplayer-game-server-hosting-orchestration';
import { myota } from './myota';
import { norskStudio } from './norsk-studio';
import { playback } from './playback';
import { portainer } from './portainer';
import { radSecurityPlatform } from './rad-security-platform';
import { scaleflexSmartMediaCloudAndDam } from './scaleflex-smart-media-cloud-and-dam';
import { scalstrmLiveTranscoding } from './scalstrm-live-transcoding';
import { scalstrmOriginPackagingPlatform } from './scalstrm-origin-packaging-platform';
import { scalstrmVODTranscoding } from './scalstrm-vod-transcoding';
import { sftpgo } from './sftpgo';
import { synadiaPlatform } from './synadia-platform';
import { titanVideoProcessingAndCompression } from './titan-video-processing-and-compression';
import { unifiedOrigin } from './unified-origin';
import { vindralLive } from './vindral-live';
import { vodEncoder } from './vod-encoder';
import { zuploApiAndAiGateway } from './zuplo-api-and-ai-gateway';

/**
 * Tab content structure for product details page.
 * Content is provided as Markdown strings which are rendered at runtime.
 */
export interface ProductTabDetails {
  documentation?: string;
  overview?: string;
  pricing?: string;
  support?: string;
}

/**
 * Map of all product detail modules.
 * Each product's details are imported statically and available synchronously.
 */
const detailsMap: Record<string, ProductTabDetails> = {
  'api-metrics': apiMetrics,
  'cambria-stream': cambriaStream,
  clouddat,
  cloudcasa,
  cyclops,
  'dynamic-ad-insertion': dynamicAdInsertion,
  'hero-encoder': heroEncoder,
  'live-encoder': liveEncoder,
  'multiplayer-game-server-hosting-orchestration':
    multiplayerGameServerHostingOrchestration,
  myota,
  'norsk-studio': norskStudio,
  playback,
  portainer,
  'rad-security-platform': radSecurityPlatform,
  'scaleflex-smart-media-cloud-and-dam': scaleflexSmartMediaCloudAndDam,
  'scalstrm-live-transcoding': scalstrmLiveTranscoding,
  'scalstrm-origin-packaging-platform': scalstrmOriginPackagingPlatform,
  'scalstrm-vod-offline-transcoding': scalstrmVODTranscoding,
  sftpgo,
  'synadia-platform': synadiaPlatform,
  'titan-video-processing-and-compression': titanVideoProcessingAndCompression,
  'unified-origin': unifiedOrigin,
  'vindral-live': vindralLive,
  'vod-encoder': vodEncoder,
  'zuplo-api-and-ai-gateway': zuploApiAndAiGateway,
  // Add more products here as you add their details files
};

/**
 * Looks up product tab details for a given product ID (slug).
 */
export const getProductTabDetails = (
  productId: string
): ProductTabDetails | undefined => {
  return detailsMap[productId];
};
