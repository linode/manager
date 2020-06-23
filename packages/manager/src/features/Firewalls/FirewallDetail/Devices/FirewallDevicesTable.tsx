import { FirewallDevice } from '@linode/api-v4/lib/firewalls/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableSortCell from 'src/components/TableSortCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import FirewallDeviceRow from './FirewallDeviceRow';

interface Props {
  devices: FirewallDevice[];
  error?: APIError[];
  loading: boolean;
  lastUpdated: number;
  triggerRemoveDevice: (deviceID: number, deviceLabel: string) => void;
}

type CombinedProps = Props;

const FirewallTable: React.FC<CombinedProps> = props => {
  const { devices, error, lastUpdated, loading, triggerRemoveDevice } = props;

  const _error =
    error && lastUpdated === 0
      ? // @todo change to Devices or make dynamic when NBs are possible as Devices
        getAPIErrorOrDefault(error, 'Unable to retrieve Linodes')
      : undefined;

  return (
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
                      >
                        Linode
                      </TableSortCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      length={paginatedAndOrderedData.length}
                      loading={loading && lastUpdated === 0}
                      error={_error}
                      lastUpdated={lastUpdated}
                    >
                      {paginatedAndOrderedData.map(thisDevice => (
                        <FirewallDeviceRow
                          key={`device-row-${thisDevice.id}`}
                          deviceLabel={thisDevice.entity.label}
                          deviceID={thisDevice.id}
                          entityID={thisDevice.entity.id}
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
  );
};

export default compose<CombinedProps, Props>(React.memo)(FirewallTable);
