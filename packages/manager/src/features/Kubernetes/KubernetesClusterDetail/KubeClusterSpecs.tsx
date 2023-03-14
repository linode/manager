import { KubernetesCluster } from '@linode/api-v4';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { dcDisplayNames } from 'src/constants';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useAllLinodeTypesQuery } from 'src/queries/linodes';
import { pluralize } from 'src/utilities/pluralize';
import {
  getTotalClusterMemoryCPUAndStorage,
  getTotalClusterPrice,
} from '../kubeUtils';

interface Props {
  cluster: KubernetesCluster;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2.5)} ${theme.spacing(2.5)} ${theme.spacing(3)}`,
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

export const KubeClusterSpecs = (props: Props) => {
  const { cluster } = props;
  const classes = useStyles();
  const { data: types } = useAllLinodeTypesQuery();

  const { data: pools } = useAllKubernetesNodePoolQuery(cluster.id);

  const { RAM, CPU, Storage } = getTotalClusterMemoryCPUAndStorage(
    pools ?? [],
    types ?? []
  );

  const region = dcDisplayNames[cluster.region] || 'Unknown region';

  const kubeSpecsLeft = [
    `Version ${cluster.k8s_version}`,
    region,
    `$${getTotalClusterPrice(
      pools ?? [],
      types ?? [],
      cluster.control_plane.high_availability
    ).toFixed(2)}/month`,
  ];

  const kubeSpecsRight = [
    pluralize('CPU Core', 'CPU Cores', CPU),
    `${RAM / 1024} GB RAM`,
    `${Math.floor(Storage / 1024)} GB Storage`,
  ];

  const kubeSpecItem = (spec: string, idx: number) => {
    return (
      <Grid
        key={`spec-${idx}`}
        item
        wrap="nowrap"
        alignItems="center"
        className={classes.item}
      >
        <Grid item className={classes.iconTextOuter}>
          <Typography>{spec}</Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid item container direction="row" xs={12} lg={3}>
      <Grid item lg={6}>
        {kubeSpecsLeft.map(kubeSpecItem)}
      </Grid>
      <Grid item lg={6}>
        {kubeSpecsRight.map(kubeSpecItem)}
      </Grid>
    </Grid>
  );
};

export default KubeClusterSpecs;
