import * as React from 'react';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
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
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import { Images } from 'src/documentation';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface Props {}

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
  }
});

type CombinedProps = Props & WithStyles<ClassNames>;

const ClusterList: React.FunctionComponent<CombinedProps> = props => {
  const { classes } = props;
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Images" />
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
              <AddNewLink disabled={true} onClick={() => null} label="Add a Cluster" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <OrderBy data={[]} orderBy={'label'} order={'asc'}>
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
                        <TableCell data-qa-kubernetes-clusters-created-header>
                          Created
                        </TableCell>
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
                      {data.map((image, idx) => (
                        <div>Hi</div>
                      ))}
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
  )
};

const styled = withStyles(styles);

export default styled(ClusterList);
