import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { dcDisplayNames } from 'src/constants';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { getClusterPrice, getTotalClusterMemoryAndCPU } from '../kubeUtils';

type ClassNames = 'root' | 'item';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  item: {
    padding: theme.spacing.unit
  }
});

interface Props {
  cluster: Linode.KubernetesCluster;
  types: ExtendedType[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const KubeSummaryPanel: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, cluster, types } = props;
  const region = dcDisplayNames[cluster.region] || 'Unknown region';
  const price = getClusterPrice(cluster.node_pools, types);
  const { CPU, RAM } = getTotalClusterMemoryAndCPU(cluster.node_pools, types);
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
        <Typography>{RAM / 1024}GB</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Typography>Total CPU Cores</Typography>
        <Typography>{CPU}</Typography>
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
        <Typography>{`$${price}/month`}</Typography>
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
