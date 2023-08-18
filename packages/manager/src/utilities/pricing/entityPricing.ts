// These utils will be used for pricing calculations based on a size variation

export const getVolumePrice = (size?: number) => {
  return size ? (size >= 10 ? size / 10 : 0) : 0;
};
