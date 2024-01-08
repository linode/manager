import { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Chip } from 'src/components/Chip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  useAllKubernetesNodePoolQuery,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';

import {
  getNextVersion,
  getTotalClusterMemoryCPUAndStorage,
} from '../kubeUtils';
import { ClusterActionMenu } from './ClusterActionMenu';

const useStyles = makeStyles()(() => ({
  clusterRow: {
    '&:before': {
      display: 'none',
    },
  },
  labelStatusWrapper: {
    alignItems: 'center',
    display: 'flex',
    flexFlow: 'row nowrap',
    whiteSpace: 'nowrap',
  },
  link: {
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
    display: 'block',
    fontSize: '.875rem',
    lineHeight: '1.125rem',
  },
  version: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-start',
  },
}));

export interface Props {
  cluster: KubernetesCluster;
  openDeleteDialog: (
    clusterID: number,
    clusterLabel: string,
    clusterNodePools: KubeNodePoolResponse[]
  ) => void;
  openUpgradeDialog: () => void;
}

export const KubernetesClusterRow = (props: Props) => {
  const { cluster, openDeleteDialog, openUpgradeDialog } = props;
  const { classes } = useStyles();

  const { data: versions } = useKubernetesVersionQuery();
  const { data: pools } = useAllKubernetesNodePoolQuery(cluster.id);
  const typesQuery = useSpecificTypes(pools?.map((pool) => pool.type) ?? []);
  const types = extendTypesQueryResult(typesQuery);
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === cluster.region);

  const nextVersion = getNextVersion(cluster.k8s_version, versions ?? []);

  const hasUpgrade = nextVersion !== null;

  const { CPU, RAM } = getTotalClusterMemoryCPUAndStorage(
    pools ?? [],
    types ?? []
  );

  return (
    <TableRow
      ariaLabel={`Cluster ${cluster.label}`}
      className={classes.clusterRow}
      data-qa-cluster-cell={cluster.id}
      data-testid={'cluster-row'}
      key={cluster.id}
    >
      <TableCell data-qa-cluster-label>
        <Grid
          alignItems="center"
          container
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Grid className="py0">
            <div className={classes.labelStatusWrapper}>
              <Link
                className={classes.link}
                tabIndex={0}
                to={`/kubernetes/clusters/${cluster.id}/summary`}
              >
                {cluster.label}
              </Link>
            </div>
          </Grid>
          {cluster.control_plane.high_availability ? (
            <Grid>
              <Chip
                data-testid={'ha-chip'}
                label="HA"
                outlineColor="green"
                size="small"
                variant="outlined"
              />
            </Grid>
          ) : null}
        </Grid>
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-cluster-version>
          <div className={classes.version}>
            {cluster.k8s_version}
            {hasUpgrade ? (
              <Chip
                clickable
                inTable
                label="UPGRADE"
                onClick={openUpgradeDialog}
                size="small"
              />
            ) : null}
          </div>
        </TableCell>
        <TableCell data-qa-cluster-date>
          <DateTimeDisplay value={cluster.created} />
        </TableCell>
      </Hidden>
      <TableCell data-qa-cluster-region>
        {region?.label ?? cluster.region}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-cluster-memory>{`${RAM / 1024} GB`}</TableCell>
        <TableCell data-qa-cluster-cpu>
          {`${CPU} ${CPU === 1 ? 'CPU' : 'CPUs'}`}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ClusterActionMenu
          openDialog={() =>
            openDeleteDialog(cluster.id, cluster.label, pools ?? [])
          }
          clusterId={cluster.id}
          clusterLabel={cluster.label}
        />
      </TableCell>
    </TableRow>
  );
};
