import * as React from 'react';
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

import MonitorRow from './MonitorRow';


type ClassNames = 'root' | 'labelHeader';

const styles = (theme: Theme) =>
createStyles({
  root: {
  },
  labelHeader: {
    paddingLeft: theme.spacing(2) + 49
  }
});

interface Props {
  monitors: Linode.ManagedServiceMonitor[];
}

export type CombinedProps = Props & WithStyles<ClassNames>;

export const MonitorTable: React.FC<CombinedProps> = (props) => {
  const { classes, monitors } = props;
return (
  <>
  <DocumentTitleSegment segment="Managed Services" />
  <Grid
    container
    justify="flex-end"
    alignItems="flex-end"
    updateFor={[classes]}
    style={{ paddingBottom: 0 }}
  >
    <Grid item>
      <Grid container alignItems="flex-end">
        <Grid item className="pt0">
          <AddNewLink
            onClick={() => null}
            label="Add a Monitor"
            disabled
          />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
    <OrderBy data={monitors} orderBy={'label'} order={'asc'}>
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
                        Monitor
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'version'}
                        label={'version'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-kubernetes-clusters-version-header
                      >
                        Status
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'created'}
                        label={'created'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-kubernetes-clusters-created-header
                      >
                        Resource
                      </TableSortCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((monitor: Linode.ManagedServiceMonitor, idx: number) => (
                      <MonitorRow
                        key={`service-monitor-row-${idx}`}
                        monitor={monitor}
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
  </>
 )
}


const styled = withStyles(styles);
export default styled(MonitorTable);