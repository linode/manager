import { KubernetesCluster } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { pluralize } from 'src/utilities/pluralize';
import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';
import { getDCSpecificPrice } from 'src/utilities/pricing/dynamicPricing';
import { getTotalClusterPrice } from 'src/utilities/pricing/kubernetes';

import { getTotalClusterMemoryCPUAndStorage } from '../kubeUtils';

interface Props {
  cluster: KubernetesCluster;
}

const useStyles = makeStyles((theme: Theme) => ({
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
  },
  item: {
    '&:first-of-type': {
      paddingTop: 0,
    },
    '&:last-of-type': {
      paddingBottom: 0,
    },
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  mainGridContainer: {
    position: 'relative',
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between',
    },
  },
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2.5)} ${theme.spacing(2.5)} ${theme.spacing(3)}`,
  },
}));

export const KubeClusterSpecs = (props: Props) => {
  const { cluster } = props;
  const classes = useStyles();
  const { data: regions } = useRegionsQuery();

  const { data: pools } = useAllKubernetesNodePoolQuery(cluster.id);

  const typesQuery = useSpecificTypes(pools?.map((pool) => pool.type) ?? []);
  const types = extendTypesQueryResult(typesQuery);

  const flags = useFlags();

  const { CPU, RAM, Storage } = getTotalClusterMemoryCPUAndStorage(
    pools ?? [],
    types ?? []
  );

  const region = regions?.find((r) => r.id === cluster.region);

  const displayRegion = region?.label ?? cluster.region;

  const dcSpecificPrice = cluster.control_plane.high_availability
    ? getDCSpecificPrice({
        basePrice: LKE_HA_PRICE,
        flags,
        regionId: region?.id,
      })
    : undefined;

  const highAvailabilityPrice = dcSpecificPrice
    ? parseFloat(dcSpecificPrice)
    : undefined;

  const kubeSpecsLeft = [
    `Version ${cluster.k8s_version}`,
    displayRegion,
    `$${getTotalClusterPrice({
      flags,
      highAvailabilityPrice,
      pools: pools ?? [],
      region: region?.id,
      types: types ?? [],
    }).toFixed(2)}/month`,
  ];

  const kubeSpecsRight = [
    pluralize('CPU Core', 'CPU Cores', CPU),
    `${RAM / 1024} GB RAM`,
    `${Math.floor(Storage / 1024)} GB Storage`,
  ];

  const kubeSpecItem = (spec: string, idx: number) => {
    return (
      <Grid
        alignItems="center"
        className={classes.item}
        key={`spec-${idx}`}
        wrap="nowrap"
      >
        <Grid className={classes.iconTextOuter}>
          <Typography>{spec}</Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container direction="row" lg={3} spacing={0} xs={12}>
      <Grid lg={6}>{kubeSpecsLeft.map(kubeSpecItem)}</Grid>
      <Grid lg={6}>{kubeSpecsRight.map(kubeSpecItem)}</Grid>
    </Grid>
  );
};

export default KubeClusterSpecs;
