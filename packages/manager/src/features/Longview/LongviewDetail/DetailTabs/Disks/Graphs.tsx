import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { isToday as _isToday } from 'src/utilities/isToday';

import { convertData } from '../../../shared/formatters';
import GraphCard from '../../GraphCard';
import { StyledDiv } from './Graphs.styles';

import type { Stat, StatWithDummyPoint } from '../../../request.types';

export interface GraphProps {
  childOf: boolean;
  diskLabel: string;
  endTime: number;
  free: Stat[];
  iFree: Stat[];
  iTotal: Stat[];
  isMounted: boolean;
  isSwap: boolean;
  loading: boolean;
  reads: Stat[];
  startTime: number;
  sysInfoType: string;
  timezone: string;
  total: Stat[];
  writes: Stat[];
}

export const Graphs = React.memo((props: GraphProps) => {
  const {
    childOf,
    diskLabel,
    endTime,
    free,
    iFree,
    iTotal,
    isMounted,
    isSwap,
    loading,
    reads,
    startTime,
    sysInfoType,
    timezone,
    total,
    writes,
  } = props;

  const theme = useTheme();

  const isToday = _isToday(startTime, endTime);
  const labelHelperText = generateHelperText(sysInfoType, isSwap, isMounted);

  const _free = React.useMemo(() => formatSpace(free, total), [free, total]);
  const _inodes = React.useMemo(() => formatINodes(iFree, iTotal), [
    iFree,
    iTotal,
  ]);

  if (childOf) {
    /** @todo document the why here. This comes from old Longview.JS */
    return (
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        <React.Fragment>
          {' '}
          Longview doesn't gather data on this type of device.
        </React.Fragment>
      </Typography>
    );
  }

  return (
    <GraphCard helperText={labelHelperText} title={diskLabel}>
      <StyledDiv>
        {sysInfoType.toLowerCase() !== 'openvz' && (
          <div data-testid="diskio-graph">
            <LongviewLineGraph
              data={[
                {
                  backgroundColor: theme.graphs.diskIO.write,
                  borderColor: 'transparent',
                  data: convertData(writes, startTime, endTime, formatDiskIO),
                  label: 'Write',
                },
                {
                  backgroundColor: theme.graphs.diskIO.read,
                  borderColor: 'transparent',
                  data: convertData(reads, startTime, endTime, formatDiskIO),
                  label: 'Read',
                },
              ]}
              ariaLabel="Disk I/O Graph"
              loading={loading}
              nativeLegend
              showToday={isToday}
              subtitle="ops/s"
              timezone={timezone}
              title="Disk I/O"
            />
          </div>
        )}
        {
          /*
              only show inodes and space if the
              disk is mounted and is not a swap partition
              because longview doesn't track those stats
            */
          !isSwap && isMounted && (
            <React.Fragment>
              <div data-testid="space-graph">
                <LongviewLineGraph
                  data={[
                    {
                      backgroundColor: theme.graphs.space,
                      borderColor: 'transparent',
                      data: convertData(_free, startTime, endTime),
                      label: 'Space',
                    },
                  ]}
                  ariaLabel="Disk Space Graph"
                  nativeLegend
                  showToday={isToday}
                  subtitle="GB"
                  // @todo replace with byte-to-target converter after rebase
                  suggestedMax={total[0]?.y / 1024 / 1024 / 1024}
                  timezone={timezone}
                  title="Space"
                />
              </div>
              <div data-testid="inodes-graph">
                <LongviewLineGraph
                  data={[
                    {
                      backgroundColor: theme.graphs.inodes,
                      borderColor: 'transparent',
                      data: convertData(_inodes, startTime, endTime),
                      label: 'Inodes',
                    },
                  ]}
                  ariaLabel="Inodes Graph"
                  nativeLegend
                  showToday={isToday}
                  // @todo replace with byte-to-target converter after rebase
                  suggestedMax={iTotal[0]?.y}
                  timezone={timezone}
                  title="Inodes"
                />
              </div>
            </React.Fragment>
          )
        }
      </StyledDiv>
    </GraphCard>
  );
});

export const formatINodes = (
  ifree: StatWithDummyPoint[],
  itotal: StatWithDummyPoint[]
): StatWithDummyPoint[] => {
  return itotal.map((eachTotalStat, index) => {
    const { x: totalX, y: totalY } = eachTotalStat;
    const { y: freeY } = ifree?.[index] ?? { x: 0, y: null };

    const cleanedY =
      typeof totalY === 'number' && typeof freeY === 'number'
        ? +(totalY - freeY).toFixed(2)
        : null;

    return { x: totalX, y: cleanedY };
  });
};

/**
 * We want to show how much spaced is used on each disk,
 * and are given free space and total space from the LV API.
 *
 * If we have data for a given point in time (y is not null),
 * then we can calculate used space by total - free.
 * @param free
 * @param total
 */
export const formatSpace = (free: Stat[], total: Stat[]) => {
  return free.map((thisPoint, idx) => {
    const _total = total[idx]?.y;
    const newY =
      typeof thisPoint.y === 'number' && typeof _total === 'number'
        ? // @todo replace with byte-to-target converter after rebase
          // or possibly run getUnit() or equivalent here so it's not always GB
          +((_total - thisPoint.y) / 1024 / 1024 / 1024).toFixed(2)
        : null;
    return { x: thisPoint.x, y: newY };
  });
};

export const formatDiskIO = (value: number) => {
  return typeof value === 'number' ? +value.toFixed(2) : null;
};

export const generateHelperText = (
  type: string,
  isSwap: boolean,
  isMounted: boolean
) => {
  const diskIsOpenVZType = type.toLowerCase() === 'openvz';

  if (diskIsOpenVZType) {
    return "Longview doesn't gather Disk I/O on OpenVZ Linodes.";
  }

  if (isSwap) {
    return "Longview doesn't gather Space and Inode data on Swap disks.";
  }

  if (!isMounted) {
    return "Longview doesn't gather Space and Inode data on unmounted disks.";
  }

  return '';
};
