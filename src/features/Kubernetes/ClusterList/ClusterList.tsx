import * as React from 'react';
import 'rxjs/add/operator/filter';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
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
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import { getKubernetesClusters } from 'src/services/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import ClusterRow from './ClusterRow';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  }
});

type CombinedProps = WithStyles<ClassNames>;

export const ClusterList: React.FunctionComponent<CombinedProps> = props => {
  const { classes } = props;
  const [clusters, setClusters] = React.useState<Linode.KubernetesCluster[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setLoading(true);
    getKubernetesClusters()
      .then(response => {
        setClusters(response.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(
          getErrorStringOrDefault(
            err,
            'There was an error loading your Kubernetes Clusters.'
          )
        );
      });
  }, []);

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
                disabled={true}
                onClick={() => null} // @todo enable creation flow
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
                          data-qa-kubernetes-clusters-name-header
                        >
                          Cluster Label
                        </TableSortCell>
                        <TableSortCell
                          active={orderBy === 'version'}
                          label={'version'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-kubernetes-clusters-name-header
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
                          data-qa-kubernetes-clusters-size-header
                        >
                          Region
                        </TableSortCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <ClusterContent
                        loading={loading}
                        error={error}
                        data={data}
                      />
                    </TableBody>
                  </Table>
                </Paper>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange()}
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
    </React.Fragment>
  );
};

interface ContentProps {
  loading: boolean;
  error?: string;
  data: Linode.KubernetesCluster[];
}

export const ClusterContent: React.FunctionComponent<ContentProps> = props => {
  const { data, error, loading } = props;
  if (error) {
    return <TableRowError data-qa-cluster-error message={error} colSpan={12} />;
  }

  if (loading) {
    return <TableRowLoading data-qa-cluster-loading colSpan={12} />;
  }

  if (data.length === 0) {
    return (
      <TableRow data-qa-cluster-empty>
        <TableCell>You don't have any Kubernetes Clusters.</TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {data.map((cluster, idx) => (
        <ClusterRow
          data-qa-cluster-row
          key={`kubernetes-cluster-list-${idx}`}
          cluster={cluster}
        />
      ))}
    </>
  );
};

const styled = withStyles(styles);

export default styled(ClusterList);
