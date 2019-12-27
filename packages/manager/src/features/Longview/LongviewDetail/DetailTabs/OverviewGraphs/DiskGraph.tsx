import { pathOr } from 'ramda';
import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { appendStats } from 'src/features/Longview/shared/utilities';
import { Disk, StatWithDummyPoint } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const DiskGraph: React.FC<CombinedProps> = props => {
  const {
    clientAPIKey,
    end,
    isToday,
    lastUpdated,
    lastUpdatedError,
    start,
    theme,
    timezone
  } = props;

  const { data, loading, error: requestError, request } = useGraphs(
    ['disk', 'sysinfo'],
    clientAPIKey,
    start,
    end
  );

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const { swap, read, write, error } = React.useMemo(
    () =>
      processDiskData(
        pathOr({}, ['Disk'], data),
        pathOr('kvm', ['SysInfo', 'type'], data)
      ),
    [data.Disk, data.SysInfo]
  );

  return (
    <LongviewLineGraph
      title="Disk I/O"
      // Only show an error state if we don't have any data,
      // or in the case of special errors returned by processDiskData
      error={(!data.Disk && requestError) || error}
      loading={loading}
      subtitle={'ops/second'}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'Swap',
          borderColor: theme.graphs.redBorder,
          backgroundColor: theme.graphs.red,
          data: _convertData(swap, start, end, formatDisk)
        },
        {
          label: 'Write',
          borderColor: theme.graphs.lightOrangeBorder,
          backgroundColor: theme.graphs.lightOrange,
          data: _convertData(write, start, end, formatDisk)
        },
        {
          label: 'Read',
          borderColor: theme.graphs.lightYellowBorder,
          backgroundColor: theme.graphs.lightYellow,
          data: _convertData(read, start, end, formatDisk)
        }
      ]}
    />
  );
};

interface DiskData {
  read: StatWithDummyPoint[];
  write: StatWithDummyPoint[];
  swap: StatWithDummyPoint[];
  error?: string;
}

export const emptyState: DiskData = {
  read: [],
  write: [],
  swap: []
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
      error: 'Disk I/O not available for OpenVZ systems.'
    };
  }
  const disks = Object.values(d);
  // Before the initial request returns, the value of d will be {}
  if (disks.length === 0) {
    return emptyState;
  }
  // For some special cases, disk data is not available and we want to show an error.
  if (disks.some(thisDisk => thisDisk.childof !== 0)) {
    return {
      ...emptyState,
      error: 'Disk I/O is not applicable for this type of device.'
    };
  }
  // We have real data now; sum up however many disks there are,
  // separating out swap.
  return disks.reduce(
    (acc: DiskData, thisDisk: Disk) => {
      if (thisDisk.isswap === 1) {
        // For swap, Classic combines reads and writes into a single metric
        // Note: we are assuming only one disk will have isswap === 1
        acc.swap = appendStats(
          pathOr([], ['reads'], thisDisk),
          pathOr([], ['writes'], thisDisk)
        );
      } else {
        // Not a swap, add reads and writes to running total
        acc.read = appendStats(acc.read, pathOr([], ['reads'], thisDisk));
        acc.write = appendStats(acc.write, pathOr([], ['writes'], thisDisk));
      }
      return acc;
    },
    { ...emptyState }
  );
};

export const formatDisk = (value: number | null) => {
  if (value === null) {
    return value;
  }
  // Don't round  to an integer if value is small, otherwise
  // it might not be displayed
  if (value < 1) {
    return Math.round(value * 100) / 100;
  }
  // Round to nearest op/s.
  return Math.round(value);
};

export default withTheme(DiskGraph);
