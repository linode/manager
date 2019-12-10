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
import Grid from 'src/components/Grid';

import LongviewLineGraph from 'src/components/LongviewLineGraph';
import { Stat } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    marginTop: theme.spacing(),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
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
  diskLabel: string;
  startTime: number;
  endTime: number;
}

type CombinedProps = Props & WithTheme;

const Grahps: React.FC<CombinedProps> = props => {
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
    endTime
  } = props;

  if (isSwap) {
    return (
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        <React.Fragment>
          {' '}
          (swap) &ndash; Longview doesn't gather data on swap partitions.
        </React.Fragment>
      </Typography>
    );
  }

  if (!isMounted) {
    return (
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        <React.Fragment>
          {' '}
          Longview doesn't gather data on Disks that are not mounted.
        </React.Fragment>
      </Typography>
    );
  }

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

  const diskIsOpenVZType = sysInfoType.toLowerCase() === 'openvz';

  /* if the disk is openVZ, there's only gonna be 2 graphs instead of 3 */
  const md = diskIsOpenVZType ? 6 : 4;

  return (
    <React.Fragment>
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
      </Typography>
      <Grid container className={classes.graphContainer}>
        {/* 
            openVZ disks don't have I/O stats. This logic comes straight from 
            old Longview.JS, so a big @todo here is to document why this
            is the way it is.
          */}
        {!diskIsOpenVZType && (
          <Grid item sm={12} md={md}>
            <LongviewLineGraph
              data={[
                {
                  /** idk yet lol */
                  data: [],
                  label: 'Disk I/O',
                  borderColor: theme.graphs.orangeBorder,
                  backgroundColor: theme.graphs.orange
                }
              ]}
              title="Disk I/O"
              showToday={isToday}
              subtitle="ops/s"
              timezone={timezone}
            />
          </Grid>
        )}
        <Grid item sm={12} md={md}>
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
        </Grid>
        <Grid item sm={12} md={md}>
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
            subtitle="millions"
            timezone={timezone}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export const formatINodes = (
  ifree: Stat[],
  itotal: Stat[]
): [number, number][] => {
  return itotal.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    eachTotalStat.y - pathOr(0, [index, 'y'], ifree)
  ]);
};

export const formatSpace = (
  free: Stat[],
  total: Stat[]
): [number, number][] => {
  return total.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    /* convert bytes to GB */
    (eachTotalStat.y - pathOr(0, [index, 'y'], free)) / 1024 / 1024 / 1024
  ]);
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(Grahps);
