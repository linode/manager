import { ExtendedType } from 'src/utilities/extendType';

export const titlecase = (string: string): string => {
  return `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;
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
  return `${cpus} CPU, ${diskG} GB Storage, ${memG} GB RAM`;
};

export const displayType = (
  linodeTypeId: null | string,
  types: Pick<ExtendedType, 'formattedLabel' | 'id'>[]
): string => {
  if (linodeTypeId === null) {
    return 'No Plan';
  }

  const foundType = types.find((t) => t.id === linodeTypeId);
  if (foundType && foundType.formattedLabel) {
    return foundType.formattedLabel;
  }

  return 'Unknown Plan';
};

export const displayClass = (category: string) => {
  const formattedCategory = category === 'highmem' ? 'High Memory' : category;
  return titlecase(formattedCategory);
};

export const displaySize = (memory: number) => {
  const memG = memory / 1024;
  return `${memG} GB`;
};

export const displayTypeForKubePoolNode = (
  category: string,
  memory: number,
  vcpus: number
) => {
  const label = displayClass(category);
  const size = displaySize(memory);
  const cpus = `${vcpus} CPU${vcpus !== 1 ? 's' : ''}`;
  return `${label} ${size}, ${cpus}`;
};
