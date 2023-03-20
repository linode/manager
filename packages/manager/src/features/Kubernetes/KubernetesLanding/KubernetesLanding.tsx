import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Hidden from 'src/components/core/Hidden';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import TransferDisplay from 'src/components/TransferDisplay';
import UpgradeVersionModal from '../UpgradeVersionModal';
import { DeleteKubernetesClusterDialog } from '../KubernetesClusterDetail/DeleteKubernetesClusterDialog';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useKubernetesClustersQuery } from 'src/queries/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { KubernetesClusterRow } from '../ClusterList/KubernetesClusterRow';
import KubernetesEmptyState from './KubernetesLandingEmptyState';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useHistory } from 'react-router-dom';
import { KubeNodePoolResponse } from '@linode/api-v4';

interface ClusterDialogState {
  open: boolean;
  loading: boolean;
  selectedClusterID: number;
  selectedClusterLabel: string;
  selectedClusterNodePools: KubeNodePoolResponse[];
}

interface UpgradeDialogState {
  open: boolean;
  selectedClusterID: number;
  selectedClusterLabel: string;
  currentVersion: string;
}

const defaultDialogState = {
  open: false,
  loading: false,
  selectedClusterID: 0,
  selectedClusterLabel: '',
  selectedClusterNodePools: [],
};

const defaultUpgradeDialogState = {
  open: false,
  selectedClusterID: 0,
  selectedClusterLabel: '',
  currentVersion: '',
  nextVersion: null,
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

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'desc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const { data, isLoading, error } = useKubernetesClustersQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const openUpgradeDialog = (
    clusterID: number,
    clusterLabel: string,
    currentVersion: string
  ) => {
    setUpgradeDialogState({
      open: true,
      selectedClusterID: clusterID,
      selectedClusterLabel: clusterLabel,
      currentVersion,
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
      open: true,
      loading: false,
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

  if (data?.results === 0) {
    return <KubernetesEmptyState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Kubernetes Clusters" />
      <LandingHeader
        title="Kubernetes"
        docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
        onButtonClick={() => push('/kubernetes/create')}
        entity="Cluster"
        removeCrumbX={1}
      />
      <Table aria-label="List of Your Kubernetes Clusters">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              label={'label'}
              direction={order}
              handleClick={handleOrderChange}
              data-qa-kubernetes-clusters-name-header
            >
              Cluster Label
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'k8s_version'}
                label={'k8s_version'}
                direction={order}
                handleClick={handleOrderChange}
                data-qa-kubernetes-clusters-version-header
              >
                Version
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'created'}
                label={'created'}
                direction={order}
                handleClick={handleOrderChange}
                data-qa-kubernetes-clusters-created-header
              >
                Created
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'region'}
              label={'region'}
              direction={order}
              handleClick={handleOrderChange}
              data-qa-kubernetes-clusters-region-header
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
              key={`kubernetes-cluster-list-${cluster.id}`}
              cluster={cluster}
              openDeleteDialog={openDialog}
              openUpgradeDialog={() =>
                openUpgradeDialog(
                  cluster.id,
                  cluster.label,
                  cluster.k8s_version
                )
              }
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="kubernetes landing"
      />
      <TransferDisplay spacingTop={18} />
      <DeleteKubernetesClusterDialog
        open={dialog.open}
        clusterLabel={dialog.selectedClusterLabel}
        clusterId={dialog.selectedClusterID}
        onClose={closeDialog}
      />
      <UpgradeVersionModal
        isOpen={upgradeDialog.open}
        clusterID={upgradeDialog.selectedClusterID}
        clusterLabel={upgradeDialog.selectedClusterLabel}
        currentVersion={upgradeDialog.currentVersion}
        onClose={closeUpgradeDialog}
      />
    </>
  );
};

export default KubernetesLanding;
