import produce from 'immer';
import { pathOr } from 'ramda';
import { LVClientData } from 'src/containers/longview.stats.container';
import { pluralize } from 'src/utilities/pluralize';
import { readableBytes } from 'src/utilities/unitConversions';
import {
  CPU,
  Disk,
  InboundOutboundNetwork,
  LongviewNetwork,
  LongviewPackage,
  LongviewProcesses,
  ProcessStats,
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

export const getTotalMemoryUsage = (used: number, free: number) => {
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

// The LV API returns Network usage statics as a map, with each key-value pair
// representing 1 Network Interface. Data from a Linode with 2 Network
// Interfaces looks like this:
// {
//   eth0: { rx_bytes: Stat[], tx_bytes: Stat[] },
//   eth1: { rx_bytes: Stat[], tx_bytes: Stat[] }
// }
// When we display this data on the LV Overview Graphs, we want to see combined
// usage of each metric (i.e. `rx_bytes` stats of all Network Interfaces
// combined).
//
// Given a Network usage statistics map, this function returns another Network
// usage statistics map with combined Y values for each section (rx_bytes,
// tx_bytes).
type LongviewNetworkInterface = LongviewNetwork['Network']['Interface'];

export const sumNetwork = (
  networkData: LongviewNetworkInterface = {}
): InboundOutboundNetwork<'yAsNull'> => {
  const result: InboundOutboundNetwork<'yAsNull'> = {
    tx_bytes: [],
    rx_bytes: []
  };

  // Protect against malformed data.
  if (!networkData || typeof networkData !== 'object') {
    return result;
  }

  // Iterate through each CPU and combine stats.
  Object.values(networkData).forEach(thisNetworkInterface => {
    result.rx_bytes = appendStats(
      result.rx_bytes,
      thisNetworkInterface.rx_bytes
    );
    result.tx_bytes = appendStats(
      result.tx_bytes,
      thisNetworkInterface.tx_bytes
    );
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
export const appendStats = (
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
      else if (existing.y !== null && y !== null && existing.x === x) {
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

/**
 * sumStatsObject
 *
 * Generalized version of utilities such as sumNetwork.
 * Many LV endpoints return an indeterminate number of stats fields,
 * in a format something like:
 *
 * Network: {
 *  eth0: {
 *     rx_bytes: Stat[],
 *     tx_bytes: Stat[]
 * },
 *  eth1: {
 *     rx_bytes: Stat[],
 *     tx_bytes: Stat[],
 * }}
 *
 * A common task is to sum up total usage across all of these series
 * (e.g. total IO for all disks, total traffic across all net interfaces, etc.)
 * which is what this method does.
 *
 * @param data a Record<string, something> as in the example above. The
 * output will be a single data series of type T, where the y values will
 * be summed for each matching value of X.
 */
export const sumStatsObject = <T>(
  data: Record<string, T>,
  emptyState: T = {} as T
): T => {
  if (!data || typeof data !== 'object') {
    return emptyState;
  }
  return Object.values(data).reduce(
    (accum, thisObject) => {
      return produce(accum, draft => {
        Object.keys(thisObject).forEach(thisKey => {
          if (thisKey in accum) {
            draft[thisKey] = appendStats(accum[thisKey], thisObject[thisKey]);
          } else {
            draft[thisKey] = thisObject[thisKey];
          }
        });
      });
    },
    { ...emptyState }
  );
};

/**
 * Sometimes, there are several processes returned by
 * a single query, such as mysql, mysqld and safe_mysql.
 *
 * The shape will be:
 * {
 *  Processes:
 *    {
 *       process1: {
 *          user1: StatsWeNeedToSum
 *          user2: StatsWeNeedToSum
 *          user3: StatsWeNeedToSum
 *       },
 *       process2: {
 *          user1: StatsWeNeedToSum
 *          user2: StatsWeNeedToSum
 *          user3: StatsWeNeedToSum
 *       },
 *    }
 * }
 *
 * ...etc. All of the StatsWeNeedToSum will have the same shape
 * (ProcessStats)
 *
 * We have to reduce our way through this object, summing
 * stats as we go. The output will be a UserProcess object.
 */
export const sumRelatedProcessesAcrossAllUsers = (
  relatedProcesses: LongviewProcesses
) =>
  Object.values(relatedProcesses).reduce((accum, thisProcess) => {
    Object.keys(thisProcess).forEach(thisUser => {
      if (thisUser !== 'longname') {
        accum = sumStatsObject(
          { thisUser: thisProcess[thisUser] },
          { ...accum }
        );
      }
    });
    return accum;
  }, {} as ProcessStats);

export type NetworkUnit = 'b' | 'Kb' | 'Mb';
/**
 * converts bytes to either Kb (Kilobits) or Mb (Megabits)
 * depending on if the Kilobit conversion exceeds 1000.
 *
 * @param networkUsed inbound and outbound traffic in bytes
 */
export const generateNetworkUnits = (networkUsed: number): NetworkUnit => {
  /** Thanks to http://www.matisse.net/bitcalc/ */
  const networkUsedToKilobits = (networkUsed * 8) / 1024;
  if (networkUsedToKilobits <= 1) {
    return 'b';
  } else if (networkUsedToKilobits <= 1000) {
    return 'Kb';
  } else {
    return 'Mb';
  }
};

export const convertNetworkToUnit = (
  valueInBits: number,
  maxUnit: NetworkUnit
) => {
  if (maxUnit === 'Mb') {
    // If the unit we're using for the graph is Mb, return the output in Mb.
    const valueInMegabits = valueInBits / 1024 / 1024;
    return valueInMegabits;
  } else if (maxUnit === 'Kb') {
    // If the unit we're using for the graph is Kb, return the output in Kb.
    const valueInKilobits = valueInBits / 1024;
    return valueInKilobits;
  } else {
    // Unit is 'b' so just return the unformatted value, rounded to the nearest bit.
    return Math.round(valueInBits);
  }
};

export const getMaxUnitAndFormatNetwork = (
  rx_bytes: StatWithDummyPoint[],
  tx_bytes: StatWithDummyPoint[]
) => {
  // Determine the unit based on the largest value.
  const max = Math.max(statMax(rx_bytes), statMax(tx_bytes));
  const maxUnit = generateNetworkUnits(max);

  const formatNetwork = (valueInBytes: number | null) => {
    if (valueInBytes === null) {
      return valueInBytes;
    }

    const valueInBits = valueInBytes * 8;

    return convertNetworkToUnit(valueInBits, maxUnit);
  };

  return { maxUnit, formatNetwork };
};

export const getMaxUnit = (stats: Stat[][]) => {
  const max = Math.max(...stats.map(statMax));
  return readableBytes(max * 1024).unit; // LV always returns in KB, need bytes here
};
