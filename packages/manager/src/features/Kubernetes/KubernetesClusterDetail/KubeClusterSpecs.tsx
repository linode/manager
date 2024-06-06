import { Theme, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CircularProgress } from 'src/components/CircularProgress';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { pluralize } from 'src/utilities/pluralize';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';
import { getTotalClusterPrice } from 'src/utilities/pricing/kubernetes';

import { getTotalClusterMemoryCPUAndStorage } from '../kubeUtils';

import type { KubernetesCluster, PriceType } from '@linode/api-v4';

export const HA_PRICE_ERROR_MESSAGE = `The cost for HA Control Plane is not available at this time.`;

interface Props {
  cluster: KubernetesCluster;
  isErrorKubernetesTypes: boolean;
  isLoadingKubernetesTypes: boolean;
  kubernetesHighAvailabilityTypesData: PriceType[] | undefined;
}

const useStyles = makeStyles()((theme: Theme) => ({
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
  tooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 320,
    },
  },
}));

export const KubeClusterSpecs = React.memo((props: Props) => {
  const {
    cluster,
    isErrorKubernetesTypes,
    isLoadingKubernetesTypes,
    kubernetesHighAvailabilityTypesData,
  } = props;
  const { classes } = useStyles();
  const { data: regions } = useRegionsQuery();
  const theme = useTheme();
  const { data: pools } = useAllKubernetesNodePoolQuery(cluster.id);
  const typesQuery = useSpecificTypes(pools?.map((pool) => pool.type) ?? []);
  const types = extendTypesQueryResult(typesQuery);

  const { CPU, RAM, Storage } = getTotalClusterMemoryCPUAndStorage(
    pools ?? [],
    types ?? []
  );

  const region = regions?.find((r) => r.id === cluster.region);
  const displayRegion = region?.label ?? cluster.region;

  const dcSpecificPrice = cluster.control_plane.high_availability
    ? getDCSpecificPriceByType({
        regionId: region?.id,
        type: kubernetesHighAvailabilityTypesData?.[1],
      })
    : undefined;

  const highAvailabilityPrice = dcSpecificPrice
    ? parseFloat(dcSpecificPrice)
    : undefined;

  const kubeSpecsLeft = [
    `Version ${cluster.k8s_version}`,
    displayRegion,
    isLoadingKubernetesTypes ? (
      <CircularProgress size={16} sx={{ marginTop: 2 }} />
    ) : cluster.control_plane.high_availability && isErrorKubernetesTypes ? (
      <>
        (${UNKNOWN_PRICE}/month)
        <TooltipIcon
          sxTooltipIcon={{
            marginBottom: theme.spacing(1),
            marginLeft: theme.spacing(2),
            padding: 0,
          }}
          classes={{ popper: classes.tooltip }}
          status="help"
          text={HA_PRICE_ERROR_MESSAGE}
          tooltipPosition="bottom"
        />
      </>
    ) : (
      `$${getTotalClusterPrice({
        highAvailabilityPrice,
        pools: pools ?? [],
        region: region?.id,
        types: types ?? [],
      }).toFixed(2)}/month`
    ),
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
});
