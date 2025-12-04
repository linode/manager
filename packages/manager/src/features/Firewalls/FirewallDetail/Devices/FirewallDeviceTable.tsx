import { useAllFirewallDevicesQuery } from '@linode/queries';
import * as React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useGetAllUserEntitiesByPermission } from 'src/features/IAM/hooks/useGetAllUserEntitiesByPermission';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { formattedTypes } from './constants';
import { FirewallDeviceRow } from './FirewallDeviceRow';

import type { FirewallDevice, FirewallDeviceEntityType } from '@linode/api-v4';

export interface FirewallDeviceTableProps {
  deviceType: FirewallDeviceEntityType;
  disabled: boolean;
  firewallId: number;
  handleRemoveDevice: (device: FirewallDevice) => void;
  searchText: string;
  type: FirewallDeviceEntityType;
}

export const FirewallDeviceTable = React.memo(
  (props: FirewallDeviceTableProps) => {
    const {
      deviceType,
      disabled,
      firewallId,
      searchText,
      handleRemoveDevice,
      type,
    } = props;

    const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

    const {
      data: allDevices,
      error,
      isLoading,
    } = useAllFirewallDevicesQuery(firewallId);

    const {
      data: updatableLinodes = [],
      isLoading: isLinodePermissionsLoading,
      error: linodePermissionsError,
    } = useGetAllUserEntitiesByPermission({
      entityType: 'linode',
      permission: 'update_linode',
      enabled: type === 'linode',
    });

    const {
      data: updatableNodebalancers = [],
      isLoading: isNodebalancerPermissionsLoading,
      error: nodebalancerPermissionsError,
    } = useGetAllUserEntitiesByPermission({
      entityType: 'nodebalancer',
      permission: 'update_nodebalancer',
      enabled: type === 'nodebalancer',
    });

    const devices =
      allDevices?.filter((device) =>
        type === 'linode' && isLinodeInterfacesEnabled
          ? device.entity.type !== 'nodebalancer' // include entities with type 'linode_interface' in Linode table
          : device.entity.type === type
      ) || [];

    const filteredDevices = devices.filter((device) => {
      if (!searchText) return true;
      return (
        device.entity.label?.toLowerCase().includes(searchText) ||
        device.entity.parent_entity?.label?.toLowerCase().includes(searchText)
      );
    });

    const devicesWithEntityLabels = filteredDevices.map((device) => {
      // Linode Interface devices don't have a label, so we need to use their parent entity's label for sorting purposes
      if (
        device.entity.type === 'linode_interface' &&
        device.entity.parent_entity
      ) {
        return {
          ...device,
          entity: {
            ...device.entity,
            label: device.entity.parent_entity.label,
          },
        };
      } else {
        return device;
      }
    });

    const isLinodeRelatedDevice = type === 'linode';

    const permissionsError =
      linodePermissionsError || nodebalancerPermissionsError;

    const _error = error
      ? getAPIErrorOrDefault(
          error,
          `Unable to retrieve ${formattedTypes[deviceType]}s`
        )
      : permissionsError
        ? getAPIErrorOrDefault(
            permissionsError,
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
      data: devicesWithEntityLabels,
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
                  isLinodeUpdatable={updatableLinodes?.some(
                    (linode) => linode.id === thisDevice.entity.id
                  )}
                  isNodebalancerUpdatable={updatableNodebalancers?.some(
                    (nodebalancer) => nodebalancer.id === thisDevice.entity.id
                  )}
                  isPermissionsLoading={
                    isLinodePermissionsLoading ||
                    isNodebalancerPermissionsLoading
                  }
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
