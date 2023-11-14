export interface ObjStoragePriceObject {
  monthly: number;
  storage_overage: number;
  transfer_overage: number;
}

// These values will eventually come from the API, but for now they are hardcoded and
// used to generate the region based dynamic pricing.
export const NODEBALANCER_PRICE = 10;
export const LKE_HA_PRICE = 60;
export const OBJ_STORAGE_PRICE: ObjStoragePriceObject = {
  monthly: 5.0,
  storage_overage: 0.02,
  transfer_overage: 0.005,
};
export const UNKNOWN_PRICE = '--.--';
export const PRICE_ERROR_TOOLTIP_TEXT = 'There was an error loading the price.';
export const PRICES_RELOAD_ERROR_NOTICE_TEXT =
  'There was an error retrieving prices. Please reload and try again.';

// Other constants
export const PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE =
  'Select a region to view plans and prices.';
export const LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE =
  'Select a region, HA choice, and add a Node Pool to view pricing and create a cluster.';
export const DIFFERENT_PRICE_STRUCTURE_WARNING =
  'The selected region has a different price structure.';
export const MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED =
  '2023-10-05 00:00:00Z';
