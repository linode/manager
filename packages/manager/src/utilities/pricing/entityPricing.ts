// These values will eventually come from the API, but for now they are hardcoded and
// used to generate the region based dynamic pricing.

export const getBackupPrice = () => {
  // I am unsure where this value is actually coming from and if it should be included here
  // TODO - DYNAMIC_PRICING: confirm this should be hardcoded
  return 5;
};

export const getVolumePrice = (size?: number) => {
  return size ? (size >= 10 ? size / 10 : 0) : 0;
};

export const getNodeBalancerPrice = () => {
  return 10;
};

export const getLKEClusterHAPrice = () => {
  return 60;
};
