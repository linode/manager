import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { appendStats } from 'src/features/Longview/shared/utilities';

import { convertData } from '../../../shared/formatters';
import { useGraphs } from './useGraphs';

import type { Disk, StatWithDummyPoint } from '../../../request.types';
import type { GraphProps } from './types';

export const DiskGraph = (props: GraphProps) => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    timezone,
  } = props;

  const theme = useTheme();

  const {
    data,
    error: requestError,
    loading,
    request,
  } = useGraphs(['disk', 'sysinfo'], clientAPIKey, start, end);

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const { error, read, swap, write } = React.useMemo(
    () => processDiskData(data.Disk ?? {}, data.SysInfo?.type ?? 'kvm'),
    [data.Disk, data.SysInfo]
  );

  return (
    <LongviewLineGraph
      // Only show an error state if we don't have any data,
      ariaLabel="Disk I/O Graph"
      data={[
        {
          backgroundColor: theme.graphs.diskIO.swap,
          borderColor: 'transparent',
          data: _convertData(swap, start, end),
          label: 'Swap',
        },
        {
          backgroundColor: theme.graphs.diskIO.write,
          borderColor: 'transparent',
          data: _convertData(write, start, end),
          label: 'Write',
        },
        {
          backgroundColor: theme.graphs.diskIO.read,
          borderColor: 'transparent',
          data: _convertData(read, start, end),
          label: 'Read',
        },
      ]}
      // or in the case of special errors returned by processDiskData
      error={(!data.Disk && requestError) || error}
      loading={loading}
      nativeLegend
      showToday={isToday}
      subtitle={'ops/second'}
      timezone={timezone}
      title="Disk I/O"
      unit={' ops/second'}
    />
  );
};

interface DiskData {
  error?: string;
  read: StatWithDummyPoint[];
  swap: StatWithDummyPoint[];
  write: StatWithDummyPoint[];
}

export const emptyState: DiskData = {
  read: [],
  swap: [],
  write: [],
};

/**
 * Disk responses from LV look like:
 *
 * {
 *   Disk:
 *      {
 *         'dev/sda': {}: Disk,
 *         'dev/sdb': {}: Disk
 *      }
 * }
 *
 * One of these disks will usually be a swap disk.
 * This method checks for this, and then combines the
 * data for all remaining disks in to a single set of metrics
 * (`read` and `write`)
 */
export const processDiskData = (
  d: Record<string, Disk>,
  type: string
): DiskData => {
  // God alone knows what LV will return, so better check to be safe.
  if (!d) {
    return emptyState;
  }
  // Self-explanatory special (&extremely rare) error case
  if (type.toLowerCase() === 'openvz') {
    return {
      ...emptyState,
      error: 'Disk I/O not available for OpenVZ systems.',
    };
  }
  const disks = Object.values(d);
  // Before the initial request returns, the value of d will be {}
  if (disks.length === 0) {
    return emptyState;
  }
  // For some special cases, disk data is not available and we want to show an error.
  if (disks.some((thisDisk) => thisDisk.childof !== 0)) {
    return {
      ...emptyState,
      error: 'Disk I/O is not applicable for this type of device.',
    };
  }
  // We have real data now; sum up however many disks there are,
  // separating out swap.
  return disks.reduce(
    (acc: DiskData, thisDisk: Disk) => {
      if (thisDisk.isswap === 1) {
        // For swap, Classic combines reads and writes into a single metric
        // Note: we are assuming only one disk will have isswap === 1
        acc.swap = appendStats(thisDisk.reads ?? [], thisDisk.writes ?? []);
      } else {
        // Not a swap, add reads and writes to running total
        acc.read = appendStats(acc.read, thisDisk.reads ?? []);
        acc.write = appendStats(acc.write, thisDisk.writes ?? []);
      }
      return acc;
    },
    { ...emptyState }
  );
};
