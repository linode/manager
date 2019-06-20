import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { dcDisplayNames } from 'src/constants';
import { ExtendedCluster } from 'src/features/Kubernetes/types';

import { getTotalClusterPrice } from '../kubeUtils';

type ClassNames = 'root' | 'item';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    item: {
      padding: theme.spacing(1)
    }
  });

interface Props {
  cluster: ExtendedCluster;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const KubeSummaryPanel: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, cluster } = props;
  const region = dcDisplayNames[cluster.region] || 'Unknown region';
  return (
    <Paper className={classes.root}>
      <Paper className={classes.item}>
        <Typography variant="h3">Details</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Version</Typography>
        <Typography>{cluster.version}</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Total RAM</Typography>
        <Typography>{cluster.totalMemory / 1024}GB</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Total CPU Cores</Typography>
        <Typography>{cluster.totalCPU}</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Kubernetes API Endpoint</Typography>
        <Typography>8.8.8.8</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Region</Typography>
        <Typography>{region}</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Monthly Pricing</Typography>
        <Typography>{`$${getTotalClusterPrice(
          cluster.node_pools
        )}/month`}</Typography>
      </Paper>
    </Paper>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  styled
);

export default enhanced(KubeSummaryPanel);
