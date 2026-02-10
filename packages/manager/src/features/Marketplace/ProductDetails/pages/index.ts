import { apiMetrics } from './api-metrics';
import { edgegap } from './edgegap';
import { heroEncoder } from './hero-encoder';
import { myota } from './myota';
import { radSecurity } from './rad-security';
import { scaleflex } from './scaleflex';
import { sftpgo } from './sftpgo';
import { synadia } from './synadia';
import { vindral } from './vindral';

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
  edgegap,
  'hero-encoder': heroEncoder,
  myota,
  'rad-security': radSecurity,
  scaleflex,
  sftpgo,
  synadia,
  vindral,
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
