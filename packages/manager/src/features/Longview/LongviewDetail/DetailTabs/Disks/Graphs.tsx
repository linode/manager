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
import { StatWithDummyPoint } from '../../../request.types';

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
  iFree: StatWithDummyPoint[];
  iTotal: StatWithDummyPoint[];
  free: StatWithDummyPoint[];
  total: StatWithDummyPoint[];
  reads: StatWithDummyPoint[];
  writes: StatWithDummyPoint[];
  diskLabel: string;
  startTime: number;
  endTime: number;
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

  const isToday = endTime - startTime < 60 * 60 * 25;
  const labelHelperText = generateHelperText(sysInfoType, isSwap, isMounted);

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
              data={[
                {
                  data: formatDiskIO(writes),
                  label: 'Write',
                  borderColor: theme.graphs.orangeBorder,
                  backgroundColor: theme.graphs.orange
                },
                {
                  data: formatDiskIO(reads),
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
                    data: formatSpace(free, total),
                    label: 'Space',
                    borderColor: theme.graphs.salmonBorder,
                    backgroundColor: theme.graphs.salmon
                  }
                ]}
                showToday={isToday}
                title="Space"
                subtitle="GB"
                timezone={timezone}
              />
            </div>
            <div data-testid="inodes-graph">
              <LongviewLineGraph
                data={[
                  {
                    data: formatINodes(iFree, iTotal),
                    label: 'Inodes',
                    borderColor: theme.graphs.pinkBorder,
                    backgroundColor: theme.graphs.pink
                  }
                ]}
                showToday={isToday}
                suggestedMax={1000000}
                title="Inodes"
                timezone={timezone}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export const formatINodes = (
  ifree: StatWithDummyPoint[],
  itotal: StatWithDummyPoint[]
): [number, number | null][] => {
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

    /* convert seconds to MS */
    return [totalX * 1000, cleanedY];
  });
};

export const formatSpace = (
  free: StatWithDummyPoint[],
  total: StatWithDummyPoint[]
): [number, number | null][] => {
  return total.map((eachTotalStat, index) => {
    const { y: totalY, x: totalX } = eachTotalStat;
    const { y: freeY } = pathOr(
      { y: null, x: 0 },
      [index],
      free
    ) as StatWithDummyPoint;

    const cleanedY =
      typeof totalY === 'number' && typeof freeY === 'number'
        ? /* convert bytes to GB */
          +((totalY - freeY) / 1024 / 1024 / 1024).toFixed(2)
        : null;

    return [
      /* convert seconds to MS */
      totalX * 1000,
      cleanedY
    ];
  });
};

export const formatDiskIO = (
  stat: StatWithDummyPoint[]
): [number, number | null][] => {
  return stat.map(eachStat => {
    const cleanedY =
      typeof eachStat.y === 'number' ? +eachStat.y.toFixed(2) : null;
    return [eachStat.x * 1000, cleanedY];
  });
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
