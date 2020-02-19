import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { isToday as _isToday } from 'src/utilities/isToday';
import { Stat, StatWithDummyPoint } from '../../../request.types';
import { convertData } from '../../../shared/formatters';
import GraphCard from '../../GraphCard';

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    marginTop: theme.spacing(),
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-around',
    '& > div': {
      flexGrow: 1,
      width: '33%',
      [theme.breakpoints.down('md')]: {
        marginTop: theme.spacing(),
        width: '60%'
      }
    }
  }
}));

export interface Props {
  isSwap: boolean;
  childOf: boolean;
  sysInfoType: string;
  isMounted: boolean;
  timezone: string;
  iFree: Stat[];
  iTotal: Stat[];
  free: Stat[];
  total: Stat[];
  reads: Stat[];
  writes: Stat[];
  diskLabel: string;
  startTime: number;
  endTime: number;
  loading: boolean;
}

type CombinedProps = Props & WithTheme;

const Graphs: React.FC<CombinedProps> = props => {
  const {
    isSwap,
    childOf,
    sysInfoType,
    diskLabel,
    theme,
    loading,
    timezone,
    free,
    total,
    iFree,
    isMounted,
    iTotal,
    startTime,
    endTime,
    reads,
    writes
  } = props;

  const classes = useStyles();

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

  const isToday = _isToday(startTime, endTime);
  const labelHelperText = generateHelperText(sysInfoType, isSwap, isMounted);

  const _free = React.useMemo(() => formatSpace(free, total), [free, total]);
  const _inodes = React.useMemo(() => formatINodes(iFree, iTotal), [
    iFree,
    iTotal
  ]);

  return (
    <GraphCard title={diskLabel} helperText={labelHelperText}>
      <div className={classes.graphContainer}>
        {sysInfoType.toLowerCase() !== 'openvz' && (
          <div data-testid="diskio-graph">
            <LongviewLineGraph
              loading={loading}
              data={[
                {
                  data: convertData(writes, startTime, endTime, formatDiskIO),
                  label: 'Write',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.diskIO.write
                },
                {
                  data: convertData(reads, startTime, endTime, formatDiskIO),
                  label: 'Read',
                  borderColor: 'transparent',
                  backgroundColor: theme.graphs.diskIO.read
                }
              ]}
              title="Disk I/O"
              showToday={isToday}
              subtitle="ops/s"
              timezone={timezone}
              nativeLegend
            />
          </div>
        )}
        {/*
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
                    data: convertData(_free, startTime, endTime),
                    label: 'Space',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.space
                  }
                ]}
                showToday={isToday}
                title="Space"
                subtitle="GB"
                timezone={timezone}
                nativeLegend
                // @todo replace with byte-to-target converter after rebase
                suggestedMax={total[0]?.y / 1024 / 1024 / 1024}
              />
            </div>
            <div data-testid="inodes-graph">
              <LongviewLineGraph
                data={[
                  {
                    data: convertData(_inodes, startTime, endTime),
                    label: 'Inodes',
                    borderColor: 'transparent',
                    backgroundColor: theme.graphs.inodes
                  }
                ]}
                showToday={isToday}
                title="Inodes"
                timezone={timezone}
                nativeLegend
                // @todo replace with byte-to-target converter after rebase
                suggestedMax={iTotal[0]?.y}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </GraphCard>
  );
};

export const formatINodes = (
  ifree: StatWithDummyPoint[],
  itotal: StatWithDummyPoint[]
): StatWithDummyPoint[] => {
  return itotal.map((eachTotalStat, index) => {
    const { y: totalY, x: totalX } = eachTotalStat;
    const { y: freeY } = pathOr(
      { y: null, x: 0 },
      [index],
      ifree
    ) as StatWithDummyPoint;

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

export default compose<CombinedProps, Props>(React.memo, withTheme)(Graphs);
