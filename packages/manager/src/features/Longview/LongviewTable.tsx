import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'
import { Props as LVProps } from 'src/containers/longview.container';

import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';

import { ActionHandlers } from './LongviewActionMenu';
import LongviewRows from './LongviewTableRows';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

type LongviewProps = Omit<LVProps, 'getLongviewClients'>;

type CombinedProps = LongviewProps & ActionHandlers;

const LongviewTable: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const {
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    ...actionMenuHandlers
  } = props;

  return (
    <React.Fragment>
      <OrderBy
        data={Object.values(longviewClientsData)}
        orderBy={'label'}
        order={'asc'}
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              data: paginatedAndOrderedData,
              count,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize
            }) => (
              <>
                <Paper>
                  <Table aria-label="List of Your Longview Clients">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          label={'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-longview-label-header
                        >
                          Client
                        </TableSortCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <LongviewRows
                        longviewClientsData={paginatedAndOrderedData}
                        longviewClientsError={longviewClientsError}
                        longviewClientsLastUpdated={longviewClientsLastUpdated}
                        longviewClientsLoading={longviewClientsLoading}
                        longviewClientsResults={longviewClientsResults}
                        {...actionMenuHandlers}
                      />
                    </TableBody>
                  </Table>
                </Paper>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="Longview Table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
    </React.Fragment>
  );
};

export default compose<CombinedProps, LongviewProps & ActionHandlers>(
  React.memo
)(LongviewTable);
