import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import 'rxjs/add/operator/filter';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import TableRow from 'src/components/core/TableRow';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import H1Header from 'src/components/H1Header';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import Table_CMR from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { DeleteClusterParams } from 'src/store/kubernetes/kubernetes.actions';
import { EntityError } from 'src/store/types';
import ClusterDialog from './../KubernetesClusterDetail/KubernetesDialog';
import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ClusterRow from './ClusterRow';

import useFlags from 'src/hooks/useFlags';
import LandingHeader from 'src/components/LandingHeader';
import ClusterRow_CMR from './ClusterRow_CMR';
import Hidden from 'src/components/core/Hidden';

type ClassNames = 'root' | 'title' | 'labelHeader';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginBottom: theme.spacing(1) + theme.spacing(1) / 2
    },
    labelHeader: {
      paddingLeft: theme.spacing(2) + 49
    }
  });

interface Props {
  clusters: KubernetesCluster[];
  deleteCluster: (data: DeleteClusterParams) => Promise<void>;
  error: EntityError;
  clearErrors: () => void;
}

type CombinedProps = Props &
  RouteComponentProps<{}> &
  WithTypesProps &
  WithStyles<ClassNames>;

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
  const {
    classes,
    clearErrors,
    clusters,
    deleteCluster,
    error,
    history
  } = props;
  const [dialog, setDialogState] = React.useState<ClusterDialogState>(
    defaultDialogState
  );

  const flags = useFlags();

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
      {flags.cmr ? (
        <LandingHeader
          title="Kubernetes"
          docsLink="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/"
          onAddNew={() => history.push('/kubernetes/create')}
          entity="Cluster"
          removeCrumbX={1}
        />
      ) : (
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          updateFor={[classes]}
          style={{ paddingBottom: 0 }}
        >
          <Grid item>
            <H1Header
              title="Kubernetes Clusters"
              className={classes.title}
              data-qa-title
            />
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item className="pt0">
                <AddNewLink
                  onClick={() => history.push('/kubernetes/create')}
                  label="Add a Cluster"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
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
                  {flags.cmr ? (
                    <Table_CMR
                      aria-label="List of Your Kubernetes Clusters"
                      rowCount={data.length}
                      colCount={6}
                    >
                      <TableHead role="rowgroup">
                        <TableRow_CMR>
                          <TableSortCell_CMR
                            active={orderBy === 'label'}
                            label={'label'}
                            direction={order}
                            handleClick={handleOrderChange}
                            data-qa-kubernetes-clusters-name-header
                          >
                            Cluster Label
                          </TableSortCell_CMR>
                          <Hidden smDown>
                            <TableSortCell_CMR
                              active={orderBy === 'k8s_version'}
                              label={'k8s_version'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-kubernetes-clusters-version-header
                            >
                              Version
                            </TableSortCell_CMR>
                          </Hidden>
                          <Hidden smDown>
                            <TableSortCell_CMR
                              active={orderBy === 'created'}
                              label={'created'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-kubernetes-clusters-created-header
                            >
                              Created
                            </TableSortCell_CMR>
                          </Hidden>
                          <TableSortCell_CMR
                            active={orderBy === 'region'}
                            label={'region'}
                            direction={order}
                            handleClick={handleOrderChange}
                            data-qa-kubernetes-clusters-region-header
                          >
                            Region
                          </TableSortCell_CMR>
                          <Hidden xsDown>
                            <TableSortCell_CMR
                              active={orderBy === 'totalMemory'}
                              label={'totalMemory'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-kubernetes-clusters-memory-header
                            >
                              Total Memory
                            </TableSortCell_CMR>
                          </Hidden>
                          <Hidden xsDown>
                            <TableSortCell_CMR
                              active={orderBy === 'totalCPU'}
                              label={'totalCPU'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-kubernetes-clusters-cpu-header
                            >
                              Total CPUs
                            </TableSortCell_CMR>
                          </Hidden>
                          <TableCell />
                        </TableRow_CMR>
                      </TableHead>
                      <TableBody>
                        {data.map((cluster: ExtendedCluster, idx: number) => (
                          <ClusterRow_CMR
                            key={`kubernetes-cluster-list-${idx}`}
                            cluster={cluster}
                            openDeleteDialog={openDialog}
                          />
                        ))}
                      </TableBody>
                    </Table_CMR>
                  ) : (
                    <Table
                      aria-label="List of Your Kubernetes Clusters"
                      rowCount={data.length}
                      colCount={6}
                    >
                      <TableHead>
                        <TableRow>
                          <TableSortCell
                            active={orderBy === 'label'}
                            label={'label'}
                            direction={order}
                            handleClick={handleOrderChange}
                            className={classes.labelHeader}
                            data-qa-kubernetes-clusters-name-header
                          >
                            Cluster Label
                          </TableSortCell>
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
                          <TableSortCell
                            active={orderBy === 'region'}
                            label={'region'}
                            direction={order}
                            handleClick={handleOrderChange}
                            data-qa-kubernetes-clusters-region-header
                          >
                            Region
                          </TableSortCell>
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
                  )}
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

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled, withTypes);

export default enhanced(ClusterList);
