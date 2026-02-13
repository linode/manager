import { apiMetrics } from './api-metrics';
import { cambriaStream } from './cambria-stream';
import { dynamicAdInsertion } from './dynamic-ad-insertion';
import { heroEncoder } from './hero-encoder';
import { multiplayerGameServerHostingOrchestration } from './multiplayer-game-server-hosting-orchestration';
import { myota } from './myota';
import { radSecurityPlatform } from './rad-security-platform';
import { scaleflexSmartMediaCloudAndDam } from './scaleflex-smart-media-cloud-and-dam';
import { sftpgo } from './sftpgo';
import { synadiaPlatform } from './synadia-platform';
import { titan } from './titan';
import { vindralLive } from './vindral-live';

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
  'dynamic-ad-insertion': dynamicAdInsertion,
  'hero-encoder': heroEncoder,
  'multiplayer-game-server-hosting-orchestration':
    multiplayerGameServerHostingOrchestration,
  myota,
  'rad-security-platform': radSecurityPlatform,
  'scaleflex-smart-media-cloud-and-dam': scaleflexSmartMediaCloudAndDam,
  sftpgo,
  'synadia-platform': synadiaPlatform,
  titan,
  'vindral-live': vindralLive,
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
