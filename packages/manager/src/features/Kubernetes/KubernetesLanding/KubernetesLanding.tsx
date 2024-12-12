import { CircleProgress, Typography } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_BANNER_KEY,
  DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_COPY,
} from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useProfile } from 'src/queries/profile/profile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { KubernetesClusterRow } from '../ClusterList/KubernetesClusterRow';
import { DeleteKubernetesClusterDialog } from '../KubernetesClusterDetail/DeleteKubernetesClusterDialog';
import UpgradeVersionModal from '../UpgradeVersionModal';
import { KubernetesEmptyState } from './KubernetesLandingEmptyState';

import type { KubeNodePoolResponse, KubernetesTier } from '@linode/api-v4';

interface ClusterDialogState {
  loading: boolean;
  open: boolean;
  selectedClusterID: number;
  selectedClusterLabel: string;
  selectedClusterNodePools: KubeNodePoolResponse[];
}

interface UpgradeDialogState {
  currentVersion: string;
  open: boolean;
  selectedClusterID: number;
  selectedClusterLabel: string;
  selectedClusterTier: KubernetesTier;
}

const defaultDialogState = {
  loading: false,
  open: false,
  selectedClusterID: 0,
  selectedClusterLabel: '',
  selectedClusterNodePools: [],
};

const defaultUpgradeDialogState = {
  currentVersion: '',
  nextVersion: null,
  open: false,
  selectedClusterID: 0,
  selectedClusterLabel: '',
  selectedClusterTier: 'standard' as KubernetesTier,
};

const preferenceKey = 'kubernetes';

export const KubernetesLanding = () => {
  const { push } = useHistory();
  const pagination = usePagination(1, preferenceKey);

  const [dialog, setDialogState] = React.useState<ClusterDialogState>(
    defaultDialogState
  );

  const [
    upgradeDialog,
    setUpgradeDialogState,
  ] = React.useState<UpgradeDialogState>(defaultUpgradeDialogState);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data: profile } = useProfile();

  const isRestricted = profile?.restricted ?? false;

  const { data, error, isLoading } = useKubernetesClustersQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter,
    !isRestricted
  );

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const openUpgradeDialog = (
    clusterID: number,
    clusterLabel: string,
    clusterTier: KubernetesTier | undefined, // TODO LKE-E: Make this required after LKE-E is in GA
    currentVersion: string
  ) => {
    setUpgradeDialogState({
      currentVersion,
      open: true,
      selectedClusterID: clusterID,
      selectedClusterLabel: clusterLabel,
      selectedClusterTier: clusterTier ?? 'standard',
    });
  };

  const closeUpgradeDialog = () => {
    setUpgradeDialogState({ ...upgradeDialog, open: false });
  };

  const openDialog = (
    clusterID: number,
    clusterLabel: string,
    clusterPools: KubeNodePoolResponse[]
  ) => {
    setDialogState({
      loading: false,
      open: true,
      selectedClusterID: clusterID,
      selectedClusterLabel: clusterLabel,
      selectedClusterNodePools: clusterPools,
    });
  };

  const closeDialog = () => {
    setDialogState({ ...dialog, open: false });
  };

  if (error) {
    return (
      <ErrorState
        errorText={getErrorStringOrDefault(
          error,
          'There was an error loading your Kubernetes clusters.'
        )}
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (isRestricted || data?.results === 0) {
    return <KubernetesEmptyState isRestricted={isRestricted} />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Kubernetes Clusters" />
      {isDiskEncryptionFeatureEnabled && (
        <DismissibleBanner
          preferenceKey={DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_BANNER_KEY}
          sx={{ margin: '1rem 0 1rem 0' }}
          variant="info"
        >
          <Typography>
            {DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_COPY}
          </Typography>
        </DismissibleBanner>
      )}
      <LandingHeader
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine"
        entity="Cluster"
        onButtonClick={() => push('/kubernetes/create')}
        removeCrumbX={1}
        title="Kubernetes"
      />
      <Table aria-label="List of Your Kubernetes Clusters">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              data-qa-kubernetes-clusters-name-header
              direction={order}
              handleClick={handleOrderChange}
              label={'label'}
            >
              Cluster Label
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'k8s_version'}
                data-qa-kubernetes-clusters-version-header
                direction={order}
                handleClick={handleOrderChange}
                label={'k8s_version'}
              >
                Version
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'created'}
                data-qa-kubernetes-clusters-created-header
                direction={order}
                handleClick={handleOrderChange}
                label={'created'}
              >
                Created
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'region'}
              data-qa-kubernetes-clusters-region-header
              direction={order}
              handleClick={handleOrderChange}
              label={'region'}
            >
              Region
            </TableSortCell>
            <Hidden smDown>
              <TableCell data-qa-kubernetes-clusters-memory-header>
                Total Memory
              </TableCell>
              <TableCell data-qa-kubernetes-clusters-cpu-header>
                Total CPUs
              </TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((cluster) => (
            <KubernetesClusterRow
              openUpgradeDialog={() =>
                openUpgradeDialog(
                  cluster.id,
                  cluster.label,
                  cluster?.tier,
                  cluster.k8s_version
                )
              }
              cluster={cluster}
              key={`kubernetes-cluster-list-${cluster.id}`}
              openDeleteDialog={openDialog}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="kubernetes landing"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <TransferDisplay spacingTop={18} />
      <DeleteKubernetesClusterDialog
        clusterId={dialog.selectedClusterID}
        clusterLabel={dialog.selectedClusterLabel}
        onClose={closeDialog}
        open={dialog.open}
      />
      <UpgradeVersionModal
        clusterID={upgradeDialog.selectedClusterID}
        clusterLabel={upgradeDialog.selectedClusterLabel}
        clusterTier={upgradeDialog.selectedClusterTier}
        currentVersion={upgradeDialog.currentVersion}
        isOpen={upgradeDialog.open}
        onClose={closeUpgradeDialog}
      />
    </>
  );
};

export const kubernetesLandingLazyRoute = createLazyRoute(
  '/kubernetes/clusters'
)({
  component: KubernetesLanding,
});
