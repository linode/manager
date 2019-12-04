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
    justifyContent: 'center'
    // '& > div': {
    //   flexGrow: 1,
    // }
  }
}));

export interface Props {
  isSwap: boolean;
  childOf: boolean;
  sysInfoType: string;
  timezone: string;
  iFree: Stat[];
  iTotal: Stat[];
  free: Stat[];
  total: Stat[];
  diskLabel: string;
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
    iTotal
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

  if (childOf) {
    /** @todo document the why here. This comes from old Longview.JS */
    return (
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        <React.Fragment>
          {' '}
          Disk I/O is not applicable for this type of device.
        </React.Fragment>
      </Typography>
    );
  }

  if (sysInfoType.toLowerCase() === 'openvz') {
    /** @todo document the why here. This comes from old Longview.JS */
    return (
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        <React.Fragment>
          {' '}
          Disk I/O not available for OpenVZ systems.
        </React.Fragment>
      </Typography>
    );
  }

  return (
    <Grid container className={classes.graphContainer}>
      <Grid item xs={4}>
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
          subtitle="ops/s"
          timezone={timezone}
        />
      </Grid>
      <Grid item xs={4}>
        <LongviewLineGraph
          data={[
            {
              data: formatSpace(free, total),
              label: 'Space',
              borderColor: theme.graphs.salmonBorder,
              backgroundColor: theme.graphs.salmon
            }
          ]}
          title="Space"
          subtitle="GB"
          timezone={timezone}
        />
      </Grid>
      <Grid item xs={4}>
        <LongviewLineGraph
          data={[
            {
              data: formatINodes(iFree, iTotal),
              label: 'Inodes',
              borderColor: theme.graphs.pinkBorder,
              backgroundColor: theme.graphs.pink
            }
          ]}
          title="Inodes"
          subtitle="millions"
          timezone={timezone}
        />
      </Grid>
    </Grid>
  );
};

export const formatINodes = (
  ifree: Stat[],
  itotal: Stat[]
): [number, number][] => {
  return itotal.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    eachTotalStat.y - ifree[index].y
  ]);
};

export const formatSpace = (
  free: Stat[],
  total: Stat[]
): [number, number][] => {
  return total.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    /* convert bytes to GB */
    (eachTotalStat.y - free[index].y) / 1024 / 1024 / 1024
  ]);
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(Grahps);
