import { pathOr } from 'ramda';
import { LVClientData } from 'src/containers/longview.stats.container';
import { pluralize } from 'src/utilities/pluralize';
import { readableBytes } from 'src/utilities/unitConversions';
import { Disk, LongviewPackage } from '../request.types';

interface Storage {
  free: number;
  total: number;
}

export const getPackageNoticeText = (packages: LongviewPackage[]) => {
  if (!packages) {
    return 'Package information not available';
  }
  if (packages.length === 0) {
    return 'All packages up to date';
  }
  return `${pluralize(
    'package update',
    'package updates',
    packages.length
  )} available`;
};

export const getTotalSomething = (used: number, free: number) => {
  const total = used + free;
  const howManyBytesInGB = 1073741824;
  const memoryToBytes = total * 1024;
  return readableBytes(memoryToBytes, {
    unit: memoryToBytes > howManyBytesInGB ? 'GB' : 'MB'
  });
};

export const sumStorage = (DiskData: Record<string, Disk> = {}): Storage => {
  let free = 0;
  let total = 0;
  Object.keys(DiskData).forEach(key => {
    const disk = DiskData[key];
    free += pathOr(0, ['fs', 'free', 0, 'y'], disk);
    total += pathOr(0, ['fs', 'total', 0, 'y'], disk);
  });
  return { free, total };
};

export const generateUsedMemory = (
  used: number,
  buffers: number,
  cache: number
) => {
  /**
   * calculation comes from original implementation of Longview.JS
   */
  const result = used - (buffers + cache);
  return result < 0 ? 0 : result;
};

export const generateTotalMemory = (used: number, free: number) => used + free;

/**
 * Used for calculating comparison values for sorting by RAM
 */
export const sumUsedMemory = (data: LVClientData) => {
  const usedMemory = pathOr(0, ['Memory', 'real', 'used', 0, 'y'], data);
  const buffers = pathOr(0, ['Memory', 'real', 'buffers', 0, 'y'], data);
  const cache = pathOr(0, ['Memory', 'real', 'cache', 0, 'y'], data);

  return generateUsedMemory(usedMemory, buffers, cache);
};
