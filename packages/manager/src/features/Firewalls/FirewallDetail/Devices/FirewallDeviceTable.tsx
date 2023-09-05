import { FirewallDevice } from '@linode/api-v4/lib/firewalls/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { formattedTypes } from './FirewallDeviceLanding';
import { FirewallDeviceRow } from './FirewallDeviceRow';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceTableProps {
  deviceType: FirewallDeviceEntityType;
  devices: FirewallDevice[];
  disabled: boolean;
  error?: APIError[];
  loading: boolean;
  triggerRemoveDevice: (deviceID: number) => void;
}

export const FirewallDeviceTable = React.memo(
  (props: FirewallDeviceTableProps) => {
    const {
      deviceType,
      devices,
      disabled,
      error,
      loading,
      triggerRemoveDevice,
    } = props;

    const _error = error
      ? // @todo change to Devices or make dynamic when NBs are possible as Devices
        getAPIErrorOrDefault(error, 'Unable to retrieve Linodes')
      : undefined;

    return (
      <OrderBy data={devices} order={'asc'} orderBy={'entity:label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              count,
              data: paginatedAndOrderedData,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize,
            }) => (
              <>
                <Table aria-label="List of Linodes attached to this Firewall">
                  <TableHead>
                    <TableRow>
                      <TableSortCell
                        active={orderBy === 'entity:label'}
                        colSpan={2}
                        data-qa-firewall-device-linode-header
                        direction={order}
                        handleClick={handleOrderChange}
                        label={'entity:label'}
                      >
                        {formattedTypes[deviceType]}
                      </TableSortCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      error={_error}
                      length={paginatedAndOrderedData.length}
                      loading={loading}
                    >
                      {paginatedAndOrderedData.map((thisDevice) => (
                        <FirewallDeviceRow
                          deviceEntityID={thisDevice.entity.id}
                          deviceID={thisDevice.id}
                          deviceLabel={thisDevice.entity.label}
                          deviceType={deviceType}
                          disabled={disabled}
                          key={`device-row-${thisDevice.id}`}
                          triggerRemoveDevice={triggerRemoveDevice}
                        />
                      ))}
                    </TableContentWrapper>
                  </TableBody>
                </Table>
                <PaginationFooter
                  count={count}
                  eventCategory="Firewall Devices Table"
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
    );
  }
);
