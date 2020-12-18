import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import 'rxjs/add/operator/filter';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { DeleteClusterParams } from 'src/store/kubernetes/kubernetes.actions';
import { EntityError } from 'src/store/types';
import ClusterDialog from './../KubernetesClusterDetail/KubernetesDialog';
import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ClusterRow from './ClusterRow';

interface Props {
  clusters: KubernetesCluster[];
  deleteCluster: (data: DeleteClusterParams) => Promise<void>;
  error: EntityError;
  clearErrors: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithTypesProps;

interface ClusterDialogState {
  open: boolean;
  loading: boolean;
  selectedClusterID: number;
  selectedClusterLabel: string;
  selectedClusterNodePools: PoolNodeWithPrice[];
}

const defaultDialogState = {
  open: false,
  loading: false,
  selectedClusterID: 0,
  selectedClusterLabel: '',
  selectedClusterNodePools: []
};

export const ClusterList: React.FunctionComponent<CombinedProps> = props => {
  const { clearErrors, clusters, deleteCluster, error, history } = props;

  const [dialog, setDialogState] = React.useState<ClusterDialogState>(
    defaultDialogState
  );

  const openDialog = (
    clusterID: number,
    clusterLabel: string,
    clusterPools: PoolNodeWithPrice[]
  ) => {
    clearErrors();
    setDialogState({
      open: true,
      loading: false,
      selectedClusterID: clusterID,
      selectedClusterLabel: clusterLabel,
      selectedClusterNodePools: clusterPools
    });
  };

  const closeDialog = () => {
    setDialogState({ ...dialog, open: false });
  };

  const handleDeleteCluster = () => {
    setDialogState({ ...dialog, loading: true });
    deleteCluster({ clusterID: dialog.selectedClusterID })
      .then(() => {
        setDialogState({
          ...dialog,
          loading: false,
          open: false
        });
      })
      .catch(() => {
        setDialogState({ ...dialog, loading: false }); // Handle errors in Redux
      });
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Kubernetes Clusters" />
      <LandingHeader
        title="Kubernetes"
        docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
        onAddNew={() => history.push('/kubernetes/create')}
        entity="Cluster"
        removeCrumbX={1}
      />
      <OrderBy data={clusters} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              data,
              count,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize
            }) => (
              <>
                <Paper>
                  <Table
                    aria-label="List of Your Kubernetes Clusters"
                    rowCount={data.length}
                    colCount={6}
                  >
                    <TableHead role="rowgroup">
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
                        <Hidden smDown>
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
                        <Hidden xsDown>
                          <TableSortCell
                            active={orderBy === 'totalMemory'}
                            label={'totalMemory'}
                            direction={order}
                            handleClick={handleOrderChange}
                            data-qa-kubernetes-clusters-memory-header
                          >
                            Total Memory
                          </TableSortCell>
                          <TableSortCell
                            active={orderBy === 'totalCPU'}
                            label={'totalCPU'}
                            direction={order}
                            handleClick={handleOrderChange}
                            data-qa-kubernetes-clusters-cpu-header
                          >
                            Total CPUs
                          </TableSortCell>
                        </Hidden>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((cluster: ExtendedCluster, idx: number) => (
                        <ClusterRow
                          key={`kubernetes-cluster-list-${idx}`}
                          cluster={cluster}
                          openDeleteDialog={openDialog}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="kubernetes landing"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <ClusterDialog
        open={dialog.open}
        loading={dialog.loading}
        error={path(['delete', 0, 'reason'], error)}
        clusterLabel={dialog.selectedClusterLabel}
        clusterPools={dialog.selectedClusterNodePools}
        onClose={closeDialog}
        onDelete={handleDeleteCluster}
      />
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, Props>(withTypes);

export default enhanced(ClusterList);
