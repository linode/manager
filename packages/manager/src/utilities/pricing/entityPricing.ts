export const getBackupPrice = () => {
  // I am unsure where this value is actually coming from
  return 5;
};

export const getVolumePrice = (size: number) => {
  return size >= 10 ? size / 10 : 0;
};

export const getNodeBalancerPrice = () => {
  return 10;
};

export const getLKEClusterHAPrice = () => {
  return 60;
};
