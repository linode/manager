import { useRegionsQuery, useSpecificTypes } from '@linode/queries';
import { Chip, Stack } from '@linode/ui';
import { Hidden } from '@linode/ui';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useAllKubernetesNodePoolQuery } from 'src/queries/kubernetes';
import { extendTypesQueryResult } from 'src/utilities/extendType';

import {
  getNextVersion,
  getTotalClusterMemoryCPUAndStorage,
  useLkeStandardOrEnterpriseVersions,
} from '../kubeUtils';
import { ClusterActionMenu } from './ClusterActionMenu';
import { ClusterChips } from './ClusterChips';

import type { KubeNodePoolResponse, KubernetesCluster } from '@linode/api-v4';

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

  const { data: pools } = useAllKubernetesNodePoolQuery(cluster.id);
  const typesQuery = useSpecificTypes(pools?.map((pool) => pool.type) ?? []);
  const types = extendTypesQueryResult(typesQuery);
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === cluster.region);

  const { versions } = useLkeStandardOrEnterpriseVersions(
    cluster.tier ?? 'standard' // TODO LKE: remove fallback once LKE-E is in GA and tier is required
  );

  const isLKEClusterReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'lkecluster',
    id: cluster.id,
  });

  const nextVersion = getNextVersion(cluster.k8s_version, versions ?? []);

  const hasUpgrade = nextVersion !== null;

  const { CPU, RAM } = getTotalClusterMemoryCPUAndStorage(
    pools ?? [],
    types ?? []
  );

  return (
    <TableRow
      data-qa-cluster-cell={cluster.id}
      data-testid={'cluster-row'}
      key={cluster.id}
    >
      <TableCell data-qa-cluster-label>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={1}
        >
          <Link tabIndex={0} to={`/kubernetes/clusters/${cluster.id}/summary`}>
            {cluster.label}
          </Link>
          <ClusterChips cluster={cluster} />
        </Stack>
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-cluster-version>
          {cluster.k8s_version}
          {hasUpgrade && !isLKEClusterReadOnly && (
            <Chip
              clickable
              label="UPGRADE"
              onClick={openUpgradeDialog}
              size="small"
              sx={{ mx: 2 }}
            />
          )}
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
          clusterId={cluster.id}
          clusterLabel={cluster.label}
          disabled={isLKEClusterReadOnly}
          openDialog={() =>
            openDeleteDialog(cluster.id, cluster.label, pools ?? [])
          }
        />
      </TableCell>
    </TableRow>
  );
};
