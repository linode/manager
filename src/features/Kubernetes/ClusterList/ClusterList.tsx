import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
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
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { DeleteClusterParams } from 'src/store/kubernetes/kubernetes.actions';
import { EntityError } from 'src/store/types';
import ClusterDialog from './../KubernetesClusterDetail/KubernetesDialog';
import { ExtendedCluster, PoolNodeWithPrice } from './../types';
import ClusterRow from './ClusterRow';

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
  clusters: Linode.KubernetesCluster[];
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
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        updateFor={[classes]}
        style={{ paddingBottom: 0 }}
      >
        <Grid item>
          <Typography variant="h1" data-qa-title className={classes.title}>
            Kubernetes Clusters
          </Typography>
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
                  <Table aria-label="List of Your Kubernetes Clusters">
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
                          active={orderBy === 'version'}
                          label={'version'}
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRouter,
  withTypes
);

export default enhanced(ClusterList);
