import { dcDisplayCountry, dcDisplayNames } from 'src/constants';

export const titlecase = (string: string): string => {
  return `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;
};

export const formatRegion = (region: string) => {
  const country = dcDisplayCountry[region];
  const city = dcDisplayNames[region];
  return `${country || ''} ${city || ''}`;
};

export const typeLabelLong = (
  label: string,
  memory: number,
  disk: number,
  cpus: number
) => {
  return `${label}: ${typeLabelDetails(memory, disk, cpus)}`;
};

export const typeLabelDetails = (
  memory: number,
  disk: number,
  cpus: number
) => {
  const memG = memory / 1024;
  const diskG = disk / 1024;
  return `${cpus} CPU, ${diskG}GB Storage, ${memG}GB RAM`;
};

export const displayType = (
  linodeTypeId: null | string,
  types: Pick<Linode.LinodeType, 'id' | 'label'>[]
): string => {
  if (linodeTypeId === null) {
    return 'No Plan';
  }

  const foundType = types.find(t => t.id === linodeTypeId);
  if (foundType && foundType.label) {
    return foundType.label;
  }

  return 'Unknown Plan';
};
