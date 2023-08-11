// These utils will be used for pricing calculations based on a size variation

/**
 * Gets the base price of a volume based on its size.
 *
 * @param size The size of a Volume in GBs
 * @returns the base price of a volume based on its size
 */
export const getVolumePrice = (size?: number) => {
  return size ? (size >= 10 ? size / 10 : 0) : 0;
};
