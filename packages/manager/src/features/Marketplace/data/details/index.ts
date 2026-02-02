import product100001 from './100001';

/**
 * Tab content structure for product details page.
 * Content is provided as Markdown strings which are rendered at runtime.
 */
export interface ProductTabDetails {
  documentation?: {
    description: string;
  };
  overview?: {
    description: string;
  };
  pricing?: {
    description: string;
  };
  support?: {
    description: string;
  };
}

/**
 * Map of all product detail modules.
 * Each product's details are imported statically and available synchronously.
 */
const detailsMap: Record<number, ProductTabDetails> = {
  100001: product100001,
  // Add more products here as you add their details files
};

/**
 * Looks up product tab details for a given numeric product ID.
 */
export const getProductTabDetails = (
  productId: number
): ProductTabDetails | undefined => {
  return detailsMap[productId];
};
