import { akamaiCloudComputing } from './akamai-cloud-computing';

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
  'akamai-cloud-computing': akamaiCloudComputing,
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
