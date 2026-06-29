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
  cpus: number,
  isValkeyEngine?: boolean
) => {
  const memG = memory / 1024;
  const diskG = disk / 1024;
  return `${cpus} CPU, ${isValkeyEngine ? '' : `${diskG} GB Storage,`} ${memG} GB RAM`;
};
