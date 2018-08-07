import { dcDisplayCountry, dcDisplayNames } from 'src/constants';

export function titlecase(string: string): string {
  return `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;
}

export function formatRegion(region: string) {
  const country = dcDisplayCountry[region];
  const city = dcDisplayNames[region];
  return `${country || ''} ${city || ''}`;
}

export function typeLabelLong(label: string, memory: number, disk: number, cpus: number) {
  return `${label}: ${typeLabelDetails(memory, disk, cpus)}`;
}

export function typeLabelDetails(memory: number, disk: number, cpus: number) {
  const memG = memory / 1024;
  const diskG = disk / 1024;
  return `${cpus} CPU, ${diskG}G Storage, ${memG}G RAM`;
}

export function displayType(
  linodeTypeId: null | string,
  types: Pick<Linode.LinodeType, 'id' | 'label'>[],
): string {
  const plans = [
    ...types,
    /** Legacy Types */
    { id: 'standard-1', label: 'Linode 4GB (pending upgrade)' },
    { id: 'standard-2', label: 'Linode 6GB (pending upgrade)' },
    { id: 'standard-3', label: 'Linode 8GB (pending upgrade)' },
    { id: 'standard-4', label: 'Linode 10GB (pending upgrade)' },
    { id: 'standard-5', label: 'Linode 16GB (pending upgrade)' },
    { id: 'standard-6', label: 'Linode 32GB (pending upgrade)' },
    { id: 'standard-7', label: 'Linode 64GB (pending upgrade)' },
    { id: 'standard-8', label: 'Linode 96GB (pending upgrade)' },
    { id: 'standard-9', label: 'Linode 128GB (pending upgrade)' },
    { id: 'standard-10', label: 'Linode 160GB (pending upgrade)' },
    { id: 'standard-46', label: 'Linode 4GB (pending upgrade)' },
    { id: 'standard-47', label: 'Linode 6GB (pending upgrade)' },
    { id: 'standard-48', label: 'Linode 8GB (pending upgrade)' },
    { id: 'standard-49', label: 'Linode 10GB (pending upgrade)' },
    { id: 'standard-50', label: 'Linode 16GB (pending upgrade)' },
    { id: 'standard-51', label: 'Linode 32GB (pending upgrade)' },
    { id: 'standard-52', label: 'Linode 64GB (pending upgrade)' },
    { id: 'standard-53', label: 'Linode 96GB (pending upgrade)' },
    { id: 'standard-54', label: 'Linode 128GB (pending upgrade)' },
    { id: 'standard-55', label: 'Linode 160GB (pending upgrade)' },
    { id: 'standard-92', label: 'Linode 4GB (pending upgrade)' },
    { id: 'standard-93', label: 'Linode 6GB (pending upgrade)' },
    { id: 'standard-94', label: 'Linode 8GB (pending upgrade)' },
    { id: 'standard-95', label: 'Linode 10GB (pending upgrade)' },
    { id: 'standard-96', label: 'Linode 16GB (pending upgrade)' },
    { id: 'standard-97', label: 'Linode 32GB (pending upgrade)' },
    { id: 'standard-98', label: 'Linode 64GB (pending upgrade)' },
    { id: 'standard-99', label: 'Linode 96GB (pending upgrade)' },
    { id: 'standard-100', label: 'Linode 128GB (pending upgrade)' },
    { id: 'standard-101', label: 'Linode 160GB (pending upgrade)' },
    { id: 'g4-standard-1', label: 'Linode 2GB (pending upgrade)' },
    { id: 'g4-standard-2', label: 'Linode 4GB (pending upgrade)' },
    { id: 'g4-standard-3-2', label: 'Linode 6GB (pending upgrade)' },
    { id: 'g4-standard-4', label: 'Linode 8GB (pending upgrade)' },
    { id: 'g4-standard-4-s', label: 'Linode 10GB (pending upgrade)' },
    { id: 'g4-standard-6', label: 'Linode 16GB (pending upgrade)' },
    { id: 'g4-standard-8', label: 'Linode 32GB (pending upgrade)' },
    { id: 'g4-standard-12', label: 'Linode 64GB (pending upgrade)' },
    { id: 'g4-standard-16', label: 'Linode 96GB (pending upgrade)' },
    { id: 'g4-standard-20', label: 'Linode 128GB (pending upgrade)' },
    { id: 'g4-standard-20-s1', label: 'Linode 160GB (pending upgrade)' },
    { id: 'g4-standard-20-s2', label: 'Linode 192GB (pending upgrade)' },
    { id: 'g5-standard-1', label: 'Linode 2GB (pending upgrade)' },
    { id: 'g5-standard-2', label: 'Linode 4GB (pending upgrade)' },
    { id: 'g5-standard-3-s', label: 'Linode 6GB (pending upgrade)' },
    { id: 'g5-standard-4', label: 'Linode 8GB (pending upgrade)' },
    { id: 'g5-standard-4-s', label: 'Linode 10GB (pending upgrade)' },
    { id: 'g5-standard-6', label: 'Linode 16GB (pending upgrade)' },
    { id: 'g5-standard-8', label: 'Linode 32GB (pending upgrade)' },
    { id: 'g5-standard-12', label: 'Linode 64GB (pending upgrade)' },
    { id: 'g5-standard-16', label: 'Linode 96GB (pending upgrade)' },
    { id: 'g5-standard-20', label: 'Linode 128GB (pending upgrade)' },
    { id: 'g5-standard-20-s1', label: 'Linode 160GB (pending upgrade)' },
    { id: 'g5-standard-20-s2', label: 'Linode 192GB (pending upgrade)' },
    { id: 'g5-nanode-1', label: 'Nanode 1GB (pending upgrade)' },
    { id: 'g5-highmem-1', label: 'Linode 24GB (pending upgrade)' },
    { id: 'g5-highmem-2', label: 'Linode 48GB (pending upgrade)' },
    { id: 'g5-highmem-4', label: 'Linode 90GB (pending upgrade)' },
    { id: 'g5-highmem-8', label: 'Linode 150GB (pending upgrade)' },
    { id: 'g5-highmem-16', label: 'Linode 300GB (pending upgrade)' },
  ];

  if (linodeTypeId === null) {
    return 'No Plan';
  }

  const foundType = plans.find(t => t.id === linodeTypeId);
  if (foundType && foundType.label) {
    return foundType.label;
  }

  return 'Unknown Plan';
}
