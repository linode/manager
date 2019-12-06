import { pathOr } from 'ramda';
import { LVClientData } from 'src/containers/longview.stats.container';
import { pluralize } from 'src/utilities/pluralize';
import { readableBytes } from 'src/utilities/unitConversions';
import {
  CPU,
  Disk,
  LongviewPackage,
  Stat,
  StatWithDummyPoint
} from '../request.types';

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

// The LV API returns CPU usage statics as a map, with each key-value pair
// representing 1 CPU core. Data from a Linode with 2 CPU cores looks like this:
// {
//   cpu0: { system: Stat[], user: Stat[], wait: Stat[] },
//   cpu1: { system: Stat[], user: Stat[], wait: Stat[] }
// }
// When we display this data on the LV Overview Graphs, we want to see combined
// usage of each metric (i.e. `system` stats of all CPUs combined).
//
// Given a CPU usage statistics map, this function returns another CPU usage
// statistics map with combined Y values for each section (system, user, wait).
export const sumCPU = (CPUData: Record<string, CPU> = {}): CPU<'yAsNull'> => {
  const result: CPU<'yAsNull'> = {
    system: [],
    user: [],
    wait: []
  };

  // Protect against malformed data.
  if (!CPUData || typeof CPUData !== 'object') {
    return result;
  }

  // Iterate through each CPU and combine stats.
  Object.values(CPUData).forEach(thisCPU => {
    result.system = appendStats(result.system, thisCPU.system);
    result.user = appendStats(result.user, thisCPU.user);
    result.wait = appendStats(result.wait, thisCPU.wait);
  });

  return result;
};

/**
 * Given two Stat arrays, returns a Stat array with summed Y values if their
 * X values are equal. X values remain untouched.
 *
 * @param prevStats
 * @param newStats
 */
const appendStats = (
  prevStats: StatWithDummyPoint[],
  newStats: StatWithDummyPoint[]
) => {
  return newStats.reduce(
    (acc, { x, y }, idx) => {
      const existing = acc[idx];

      // If the point doesn't exist yet, create it.
      if (!existing) {
        acc[idx] = { x, y };
      }

      // A bit of null checking here is necessary here since Y can be null.
      // We also check that the X values match.
      else if (existing.y && y && existing.x === x) {
        existing.y += y;
      }
      return acc;
    },
    [...prevStats]
  );
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

export const statAverage = (stats: Stat[] = []): number => {
  if (stats.length === 0) {
    return 0;
  }

  const sum = stats.reduce((acc, { y }) => acc + y, 0);
  return sum / stats.length;
};

export const statMax = (stats: StatWithDummyPoint[] = []): number => {
  if (stats.length === 0) {
    return 0;
  }

  return stats.reduce((acc, { y }) => {
    if (y === null) {
      return acc;
    }
    if (y > acc) {
      return y;
    }
    return acc;
  }, 0);
};
