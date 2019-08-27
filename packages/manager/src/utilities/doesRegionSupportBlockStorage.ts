export const doesRegionSupportBlockStorage = (
  region: string,
  regionsData: Linode.Region[]
) => {
  const regionMetaData = regionsData.find(thisRegion => {
    return thisRegion.id === region;
  });
  if (!regionMetaData) {
    return false;
  }
  return regionMetaData.capabilities.some(eachCapability => {
    return !!eachCapability.match(/block/i);
  });
};
