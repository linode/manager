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
  const classes = useStyles();

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

  const isToday = _isToday(endTime, startTime);
  const labelHelperText = generateHelperText(sysInfoType, isSwap, isMounted);

  const _free = formatSpace(free, total);
  const _inodes = formatINodes(iFree, iTotal);

  return (
    <React.Fragment>
      <Typography variant="subtitle1">
        <React.Fragment>
          <strong>{diskLabel}</strong>
          {!!labelHelperText && <React.Fragment> &ndash; </React.Fragment>}
          {labelHelperText}
        </React.Fragment>
      </Typography>
      <div className={classes.graphContainer}>
        {/* 
            openVZ disks don't have I/O stats. This logic comes straight from 
            old Longview.JS, so a big @todo here is to document why this
            is the way it is.
          */}
        {sysInfoType.toLowerCase() !== 'openvz' && (
          <div data-testid="diskio-graph">
            <LongviewLineGraph
              loading={loading}
              data={[
                {
                  data: convertData(writes, startTime, endTime, formatDiskIO),
                  label: 'Write',
                  borderColor: theme.graphs.orangeBorder,
                  backgroundColor: theme.graphs.orange
                },
                {
                  data: convertData(reads, startTime, endTime, formatDiskIO),
                  label: 'Read',
                  borderColor: theme.graphs.yellowBorder,
                  backgroundColor: theme.graphs.yellow
                }
              ]}
              title="Disk I/O"
              showToday={isToday}
              subtitle="ops/s"
              timezone={timezone}
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
                    borderColor: theme.graphs.salmonBorder,
                    backgroundColor: theme.graphs.salmon
                  }
                ]}
                showToday={isToday}
                title="Space"
                subtitle="GB"
                timezone={timezone}
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
                    borderColor: theme.graphs.pinkBorder,
                    backgroundColor: theme.graphs.pink
                  }
                ]}
                showToday={isToday}
                title="Inodes"
                timezone={timezone}
                // @todo replace with byte-to-target converter after rebase
                suggestedMax={iTotal[0]?.y}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export const formatINodes = (
  ifree: Stat[],
  itotal: Stat[]
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
