import type { LinodeType, Region } from '@linode/api-v4';

export const buildQueryStringForLinodeClone = (
  linodeId: number,
  linodeRegion: string,
  linodeType: null | string,
  types: LinodeType[] | null | undefined,
  regions: Region[]
): string => {
  const linodeRegionId =
    regions.find((region) => region.label === linodeRegion)?.id ?? '';
  const params: Record<string, string> = {
    linodeID: String(linodeId),
    regionID: linodeRegionId,
    type: 'Clone Linode',
  };

  // If the type of this Linode is a valid (current) type, use it in the QS
  if (types && types.some((typeEntity) => typeEntity.id === linodeType)) {
    params.typeID = linodeType!;
  }

  // If the region of this Linode is a valid region, use it in the QS
  if (regions && regions.some((region) => region.id === linodeRegion)) {
    params.regionID = linodeRegion;
  }

  return new URLSearchParams(params).toString();
};
