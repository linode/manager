import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { formattedTypes } from './FirewallDeviceLanding';
import { FirewallDeviceRow } from './FirewallDeviceRow';

import type { FirewallDeviceEntityType } from '@linode/api-v4';
import type { FirewallDevice } from '@linode/api-v4/lib/firewalls/types';
import type { APIError } from '@linode/api-v4/lib/types';

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
      ? getAPIErrorOrDefault(
          error,
          `Unable to retrieve ${formattedTypes[deviceType]}s`
        )
      : undefined;

    const ariaLabel = `List of ${formattedTypes[deviceType]}s attached to this firewall`;

    const { handleOrderChange, order, orderBy } = useOrderV2({
      data: devices,
      initialRoute: {
        defaultOrder: {
          order: 'asc',
          orderBy: `entity:label`,
        },
        from:
          deviceType === 'linode'
            ? '/firewalls/$id/linodes'
            : '/firewalls/$id/nodebalancers',
      },
      preferenceKey: `${deviceType}s-order`,
    });

    const pagination = usePaginationV2({
      currentRoute:
        deviceType === 'linode'
          ? '/firewalls/$id/linodes'
          : '/firewalls/$id/nodebalancers',
      preferenceKey: `${deviceType}s-pagination`,
    });

    return (
      <>
        <Table aria-label={ariaLabel}>
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
              length={devices.length}
              loading={loading}
            >
              {devices.map((thisDevice) => (
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
          count={devices.length}
          eventCategory="Firewall Devices Table"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </>
    );
  }
);
