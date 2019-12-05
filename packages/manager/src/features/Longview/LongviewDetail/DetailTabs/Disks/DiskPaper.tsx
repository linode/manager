import { pathOr } from 'ramda';
import * as React from 'react';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

import LongviewLineGraph from 'src/components/LongviewLineGraph';

import { Disk, Stat } from '../../../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    '& > h6': {
      color: theme.color.grey1,
      '& > strong': {
        color: theme.color.headline
      }
    }
  },
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

interface Props {
  diskLabel?: string;
  stats: Partial<Disk>;
  timezone: string;
}

type CombinedProps = Props & WithTheme;

const DiskPaper: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { diskLabel, stats, timezone } = props;

  const isSwap = pathOr(0, ['isswap'], stats);

  const iFree = pathOr([], ['fs', 'ifree'], stats);
  const iTotal = pathOr([], ['fs', 'itotal'], stats);
  const free = pathOr([], ['fs', 'free'], stats);
  const total = pathOr([], ['fs', 'total'], stats);

  return (
    <Paper className={classes.root}>
      <Typography variant="subtitle1">
        <strong>{diskLabel}</strong>
        {isSwap === 1 && (
          <React.Fragment>
            {' '}
            (swap) &ndash; Longview doesn't gather data on swap partitions.
          </React.Fragment>
        )}
      </Typography>

      {isSwap === 0 && (
        <Grid container className={classes.graphContainer}>
          <Grid item xs={4}>
            <LongviewLineGraph
              data={[
                {
                  /** idk yet lol */
                  data: [],
                  label: 'Disk I/O',
                  borderColor: props.theme.graphs.orangeBorder,
                  backgroundColor: props.theme.graphs.orange
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
                  borderColor: props.theme.graphs.salmonBorder,
                  backgroundColor: props.theme.graphs.salmon
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
                  borderColor: props.theme.graphs.pinkBorder,
                  backgroundColor: props.theme.graphs.pink
                }
              ]}
              title="Inodes"
              subtitle="millions"
              timezone={timezone}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

const formatINodes = (ifree: Stat[], itotal: Stat[]): [number, number][] => {
  return itotal.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    eachTotalStat.y - ifree[index].y
  ]);
};

const formatSpace = (free: Stat[], total: Stat[]): [number, number][] => {
  return total.map((eachTotalStat, index) => [
    eachTotalStat.x * 1000,
    /* convert bytes to GB */
    (eachTotalStat.y - free[index].y) / 1024 / 1024 / 1024
  ]);
};

export default withTheme(DiskPaper);
