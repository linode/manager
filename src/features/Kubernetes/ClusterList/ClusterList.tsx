import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
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
import TableSortCell from 'src/components/TableSortCell';
import ClusterRow from './ClusterRow';

type ClassNames = 'root' | 'title' | 'labelHeader';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  },
  labelHeader: {
    paddingLeft: theme.spacing.unit * 2 + 49
  }
});

interface Props {
  clusters: Linode.KubernetesCluster[];
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

export const ClusterList: React.FunctionComponent<CombinedProps> = props => {
  const { classes, clusters, history } = props;

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
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <ClusterContent data={data} />
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
    </React.Fragment>
  );
};

interface ContentProps {
  data: Linode.KubernetesCluster[];
}

export const ClusterContent: React.FunctionComponent<ContentProps> = props => {
  const { data } = props;
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRouter
);

export default enhanced(ClusterList);
