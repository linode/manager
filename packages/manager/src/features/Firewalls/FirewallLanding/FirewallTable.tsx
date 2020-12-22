import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableSortCell from 'src/components/TableSortCell';
import { StateProps as FireProps } from 'src/containers/firewalls.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ActionHandlers } from './FirewallActionMenu';
import FirewallRow from './FirewallRow';

const useStyles = makeStyles(() => ({
  labelCell: {
    width: '25%'
  },
  statusCell: {
    width: '15%'
  },
  ruleCell: {
    width: '25%'
  },
  linodeCell: {
    width: '25%'
  }
}));

type FirewallProps = FireProps & ActionHandlers;

type CombinedProps = FirewallProps;

const FirewallTable: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    itemsById: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated,
    ...actionMenuHandlers
  } = props;

  const _error =
    firewallsError.read && firewallsLastUpdated === 0
      ? // @todo change to Devices or make dynamic when NBs are possible as Devices
        getAPIErrorOrDefault(
          firewallsError.read,
          'Unable to retrieve Firewalls'
        )
      : undefined;

  return (
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
                        className={classes.labelCell}
                      >
                        Firewall
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'status'}
                        label={'status'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-firewall-status-header
                        className={classes.statusCell}
                      >
                        Status
                      </TableSortCell>
                      <TableCell
                        data-qa-firewall-rules-header
                        className={classes.ruleCell}
                      >
                        Rules
                      </TableCell>
                      <TableCell
                        data-qa-firewall-rules-header
                        className={classes.linodeCell}
                      >
                        Linodes
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      loading={firewallsLoading && firewallsLastUpdated === 0}
                      lastUpdated={firewallsLastUpdated}
                      length={paginatedAndOrderedData.length}
                      error={_error}
                    >
                      {paginatedAndOrderedData.map(eachFirewall => {
                        return (
                          <FirewallRow
                            key={`firewall-row-${eachFirewall.id}`}
                            id={eachFirewall.id}
                            label={eachFirewall.label}
                            rules={eachFirewall.rules}
                            status={eachFirewall.status}
                            // These props are required
                            tags={[]}
                            created_dt=""
                            updated_dt=""
                            {...actionMenuHandlers}
                          />
                        );
                      })}
                    </TableContentWrapper>
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
  );
};

export default compose<CombinedProps, FirewallProps>(React.memo)(FirewallTable);
