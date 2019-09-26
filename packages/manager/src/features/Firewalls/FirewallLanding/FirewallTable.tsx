import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'
import { Props as FireProps } from 'src/containers/firewalls.container';

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

import { ActionHandlers } from './FirewallActionMenu';
import FirewallRows from './FirewallTableRows';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

type FirewallProps = Omit<FireProps, 'getFirewalls'> & ActionHandlers;

type CombinedProps = FirewallProps;

const FirewallTable: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const {
    data: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated,
    listOfIDsInOriginalOrder: firewallsKeys,
    ...actionMenuHandlers
  } = props;

  return (
    <React.Fragment>
      <OrderBy data={Object.values(firewalls)} orderBy={'label'} order={'asc'}>
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
                  <Table aria-label="List of Your Firewalls">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          label={'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-firewall-label-header
                        >
                          Firewall
                        </TableSortCell>
                        <TableSortCell
                          active={orderBy === 'status'}
                          label={'status'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-firewall-status-header
                        >
                          Status
                        </TableSortCell>
                        <TableCell data-qa-firewall-rules-header>
                          Rules
                        </TableCell>
                        <TableCell data-qa-firewall-rules-header>
                          Linodes
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <FirewallRows
                        data={paginatedAndOrderedData}
                        loading={firewallsLoading}
                        error={firewallsError}
                        listOfIDsInOriginalOrder={firewallsKeys}
                        lastUpdated={firewallsLastUpdated}
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
                  eventCategory="Firewall Table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
    </React.Fragment>
  );
};

export default compose<CombinedProps, FirewallProps>(React.memo)(FirewallTable);
