import { pathOr } from 'ramda';
import { pluralize } from 'src/utilities/pluralize';
import { readableBytes } from 'src/utilities/unitConversions';
import { Disk, LongviewPackage, Stat } from '../request.types';

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

export const statAverage = (stats: Stat[] = []): number => {
  if (stats.length === 0) {
    return 0;
  }

  const sum = stats.reduce((acc, { y }) => acc + y, 0);
  return sum / stats.length;
};

export const statMax = (stats: Stat[] = []): number => {
  if (stats.length === 0) {
    return 0;
  }

  return stats.reduce((acc, { y }) => {
    if (y > acc) {
      return y;
    }
    return acc;
  }, 0);
};
