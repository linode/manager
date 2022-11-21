import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { dcDisplayNames } from 'src/constants';
import { ExtendedCluster } from 'src/features/Kubernetes/types';
import { pluralize } from 'src/utilities/pluralize';
import { getTotalClusterPrice } from '../kubeUtils';

interface Props {
  cluster: ExtendedCluster;
  isClusterHighlyAvailable: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2) + 4}px ${
      theme.spacing(2) + 4
    }px ${theme.spacing(3)}px`,
  },
  mainGridContainer: {
    position: 'relative',
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between',
    },
  },
  item: {
    '&:first-of-type': {
      paddingTop: 0,
    },
    '&:last-of-type': {
      paddingBottom: 0,
    },
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
  },
}));

export const KubeClusterSpecs: React.FC<Props> = (props) => {
  const { cluster, isClusterHighlyAvailable } = props;
  const classes = useStyles();

  const region = dcDisplayNames[cluster.region] || 'Unknown region';

  const kubeSpecsLeft = [
    `Version ${cluster.k8s_version}`,
    region,
    `$${getTotalClusterPrice(
      cluster.node_pools,
      isClusterHighlyAvailable
    ).toFixed(2)}/month`,
  ];

  const kubeSpecsRight = [
    pluralize('CPU Core', 'CPU Cores', cluster.totalCPU),
    `${cluster.totalMemory / 1024} GB RAM`,
    `${Math.floor(cluster.totalStorage / 1024)} GB Storage`,
  ];

  const kubeSpecItem = (spec: string) => {
    return (
      <Grid item wrap="nowrap" alignItems="center" className={classes.item}>
        <Grid item className={classes.iconTextOuter}>
          <Typography>{spec}</Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid item container direction="row" xs={12} lg={3}>
      <Grid item lg={6}>
        {kubeSpecsLeft.map((spec) => kubeSpecItem(spec))}
      </Grid>
      <Grid item lg={6}>
        {kubeSpecsRight.map((spec) => kubeSpecItem(spec))}
      </Grid>
    </Grid>
  );
};

export default KubeClusterSpecs;
