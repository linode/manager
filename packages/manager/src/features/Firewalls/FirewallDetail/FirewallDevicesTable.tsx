import { FirewallDevice } from 'linode-js-sdk/lib/firewalls/types';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableContentWrapper from 'src/components/TableContentWrapper.tsx';
import TableSortCell from 'src/components/TableSortCell';
import FirewallDeviceRow from './FirewallDeviceRow';

const useStyles = makeStyles((theme: Theme) => ({
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

interface Props {
  devices: FirewallDevice[];
  error?: APIError[];
  loading: boolean;
  lastUpdated: number;
  triggerRemoveDevice: (deviceID: number, label: string) => void;
}

type CombinedProps = Props;

const FirewallTable: React.FC<CombinedProps> = props => {
  const { devices, error, lastUpdated, loading, triggerRemoveDevice } = props;
  const classes = useStyles();

  return (
    <React.Fragment>
      <OrderBy data={devices} orderBy={'entity:label'} order={'asc'}>
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
                  <Table aria-label="List of Linodes attached to this Firewall">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'entity:label'}
                          label={'entity:label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-firewall-device-linode-header
                          className={classes.labelCell}
                        >
                          Linode
                        </TableSortCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        length={paginatedAndOrderedData.length}
                        loading={loading}
                        error={error}
                        lastUpdated={lastUpdated}
                      >
                        {paginatedAndOrderedData.map(thisDevice => (
                          <FirewallDeviceRow
                            key={`device-row-${thisDevice.id}`}
                            deviceLabel={thisDevice.entity.label}
                            deviceID={thisDevice.entity.id}
                            triggerRemoveDevice={triggerRemoveDevice}
                          />
                        ))}
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
                  eventCategory="Firewall Devices Table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(FirewallTable);
