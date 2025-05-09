import { CircleProgress, ErrorState, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_BANNER_KEY,
  DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_COPY,
} from 'src/components/Encryption/constants';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { KubernetesClusterRow } from '../ClusterList/KubernetesClusterRow';
import { DeleteKubernetesClusterDialog } from '../KubernetesClusterDetail/DeleteKubernetesClusterDialog';
import { useKubernetesBetaEndpoint } from '../kubeUtils';
import UpgradeVersionModal from '../UpgradeVersionModal';
import { KubernetesEmptyState } from './KubernetesLandingEmptyState';

interface UpgradeDialogState {
  open: boolean;
  selectedClusterID: number;
}

const defaultUpgradeDialogState = {
  open: false,
  selectedClusterID: 0,
};

const preferenceKey = 'kubernetes';

export const KubernetesLanding = () => {
  const navigate = useNavigate();
  const match = useMatch({ strict: false });
  const pagination = usePagination(1, preferenceKey);
  const { clusterID } = useParams({ strict: false });

  const {
    data: selectedCluster,
    isFetching: isFetchingSelectedCluster,
    error: selectedClusterError,
  } = useKubernetesClusterQuery({
    id: Number(clusterID),
    enabled: !!clusterID,
  });

  const [upgradeDialog, setUpgradeDialogState] =
    React.useState<UpgradeDialogState>(defaultUpgradeDialogState);

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

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_lkes',
  });

  const { isUsingBetaEndpoint } = useKubernetesBetaEndpoint();
  const { data, error, isLoading } = useKubernetesClustersQuery({
    filter,
    isUsingBetaEndpoint,
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
  });

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const openUpgradeDialog = (clusterID: number) => {
    setUpgradeDialogState({
      open: true,
      selectedClusterID: clusterID,
    });
  };

  const closeUpgradeDialog = () => {
    setUpgradeDialogState({ ...upgradeDialog, open: false });
  };

  const closeDialog = () => {
    navigate({ to: '/kubernetes/clusters' });
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

  if (data?.results === 0) {
    return <KubernetesEmptyState isRestricted={isRestricted} />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Kubernetes Clusters" />
      {isDiskEncryptionFeatureEnabled && ( // @TODO LDE: once LDE is GA in all DCs, remove this condition
        <DismissibleBanner
          preferenceKey={DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_BANNER_KEY}
          spacingBottom={8}
          variant="info"
        >
          <Typography fontSize="inherit">
            {DISK_ENCRYPTION_UPDATE_PROTECT_CLUSTERS_COPY}
          </Typography>
        </DismissibleBanner>
      )}
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'LKE Clusters',
          }),
        }}
        disabledCreateButton={isRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine"
        entity="Cluster"
        onButtonClick={() => navigate({ to: '/kubernetes/create' })}
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
              cluster={cluster}
              key={`kubernetes-cluster-list-${cluster.id}`}
              openUpgradeDialog={() => openUpgradeDialog(cluster.id)}
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
        clusterError={selectedClusterError}
        clusterId={selectedCluster?.id ?? -1}
        clusterLabel={selectedCluster?.label ?? 'Unknown'}
        isFetching={isFetchingSelectedCluster}
        onClose={closeDialog}
        open={match.routeId === '/kubernetes/clusters/$clusterID/delete'}
      />
      <UpgradeVersionModal
        clusterID={upgradeDialog.selectedClusterID}
        isOpen={upgradeDialog.open}
        onClose={closeUpgradeDialog}
      />
    </>
  );
};
