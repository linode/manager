import {
  useAllFirewallDevicesQuery,
  useAllLinodesQuery,
} from '@linode/queries';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { getLinodeIdFromInterfaceDevice } from '../../shared';
import { formattedTypes } from './constants';
import { FirewallDeviceRow } from './FirewallDeviceRow';

import type { FirewallDevice, FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceTableProps {
  deviceType: FirewallDeviceEntityType;
  disabled: boolean;
  firewallId: number;
  handleRemoveDevice: (device: FirewallDevice) => void;
  type: FirewallDeviceEntityType;
}

export const FirewallDeviceTable = React.memo(
  (props: FirewallDeviceTableProps) => {
    const {
      deviceType,
      disabled,
      firewallId,
      handleRemoveDevice,
      type,
    } = props;

    const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

    const { data: allDevices, error, isLoading } = useAllFirewallDevicesQuery(
      firewallId
    );
    const devices =
      allDevices?.filter((device) =>
        type === 'linode' && isLinodeInterfacesEnabled
          ? device.entity.type !== 'nodebalancer' // include entities with type 'interface' in Linode table
          : device.entity.type === type
      ) || [];

    const linodeInterfaceDevices =
      type === 'linode'
        ? allDevices?.filter((device) => device.entity.type === 'interface')
        : [];

    // only fire this query if we have linode interface devices. We fetch the Linodes those devices are attached to
    // so that we can add a label to the devices for sorting and display purposes
    const { data: linodesWithInterfaces } = useAllLinodesQuery(
      {},
      {},
      isLinodeInterfacesEnabled &&
        linodeInterfaceDevices &&
        linodeInterfaceDevices.length > 0
    );

    const updatedDevices = devices.map((device) => {
      if (device.entity.type === 'interface') {
        const linodeId = getLinodeIdFromInterfaceDevice(device.entity);
        const associatedLinode = linodesWithInterfaces?.find(
          (linode) => linode.id === linodeId
        );
        return {
          ...device,
          entity: {
            ...device.entity,
            label: associatedLinode?.label ?? null,
          },
        };
      } else {
        return device;
      }
    });

    const isLinodeRelatedDevice = type === 'linode';

    const _error = error
      ? getAPIErrorOrDefault(
          error,
          `Unable to retrieve ${formattedTypes[deviceType]}s`
        )
      : undefined;

    const ariaLabel = `List of ${formattedTypes[deviceType]}s attached to this firewall`;

    const {
      handleOrderChange,
      order,
      orderBy,
      sortedData: sortedDevices,
    } = useOrderV2({
      data: updatedDevices,
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
                data-qa-firewall-device-linode-header
                direction={order}
                handleClick={handleOrderChange}
                label={'entity:label'}
                sx={{ width: '30%' }}
              >
                {formattedTypes[deviceType]}
              </TableSortCell>
              {isLinodeInterfacesEnabled && isLinodeRelatedDevice && (
                <TableCell>Network Interface</TableCell>
              )}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableContentWrapper
              error={_error}
              length={sortedDevices?.length ?? 0}
              loading={isLoading}
            >
              {sortedDevices?.map((thisDevice) => (
                <FirewallDeviceRow
                  device={thisDevice}
                  disabled={disabled}
                  handleRemoveDevice={handleRemoveDevice}
                  isLinodeRelatedDevice={isLinodeRelatedDevice}
                  key={`device-row-${thisDevice.id}`}
                />
              ))}
            </TableContentWrapper>
          </TableBody>
        </Table>
        <PaginationFooter
          count={sortedDevices?.length ?? 0}
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
