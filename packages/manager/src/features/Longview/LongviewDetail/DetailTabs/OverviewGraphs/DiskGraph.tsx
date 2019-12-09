import { pathOr } from 'ramda';
import * as React from 'react';
import { withTheme, WithTheme } from 'src/components/core/styles';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { appendStats } from 'src/features/Longview/shared/utilities';
import { AllData, getValues } from '../../../request';
import { LongviewDisk, StatWithDummyPoint } from '../../../request.types';
import { convertData } from '../../../shared/formatters';

interface Props {
  clientAPIKey: string;
  isToday: boolean;
  timezone: string;
  start: number;
  end: number;
}

export type CombinedProps = Props & WithTheme;

export const MemoryGraph: React.FC<CombinedProps> = props => {
  const { clientAPIKey, end, isToday, start, theme, timezone } = props;

  const [data, setData] = React.useState<Partial<AllData>>({});
  const request = () => {
    return getValues(clientAPIKey, {
      fields: ['disk'],
      start,
      end
    }).then(response => {
      setData(response);
    });
  };

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  const { read, write, swap } = processCPUData(
    pathOr({ Disk: {} }, ['Disk'], data)
  );

  // console.log({ read, write, swap });

  return (
    <LongviewLineGraph
      title="Disk I/O"
      subtitle={'ops/second'}
      showToday={isToday}
      timezone={timezone}
      data={[
        {
          label: 'Swap',
          borderColor: theme.graphs.redBorder,
          backgroundColor: theme.graphs.red,
          data: _convertData(swap, start, formatDisk)
        },
        {
          label: 'Write',
          borderColor: theme.graphs.lightOrangeBorder,
          backgroundColor: theme.graphs.lightOrange,
          data: _convertData(write, start, formatDisk)
        },
        {
          label: 'Read',
          borderColor: theme.graphs.lightYellowBorder,
          backgroundColor: theme.graphs.lightYellow,
          data: _convertData(read, start, formatDisk)
        }
      ]}
    />
  );
};

const emptyState = {
  read: [],
  write: [],
  swap: []
};

const processCPUData = (d: LongviewDisk) => {
  if (!d) {
    return emptyState;
  }
  const disks = Object.values(d);
  if (disks.length === 0) {
    return emptyState;
  }
  let combinedReads: StatWithDummyPoint[] = [];
  let combinedWrites: StatWithDummyPoint[] = [];
  let swap: StatWithDummyPoint[] = [];
  disks.forEach(thisDisk => {
    if (thisDisk.isswap === 1) {
      swap = appendStats(
        pathOr([], ['reads'], thisDisk),
        pathOr([], ['writes'], thisDisk)
      );
    } else {
      // Not a swap
      combinedReads = appendStats(
        combinedReads,
        pathOr([], ['reads'], thisDisk)
      );
      combinedWrites = appendStats(
        combinedWrites,
        pathOr([], ['writes'], thisDisk)
      );
    }
  });

  return { read: combinedReads, write: combinedWrites, swap };
};

const formatDisk = (value: number | null) => {
  if (value === null) {
    return value;
  }

  // Round to nearest op/s.
  return Math.round(value);
};

export default withTheme(MemoryGraph);
