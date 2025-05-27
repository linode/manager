import * as React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { FirewallDeviceActionMenu } from './FirewallDeviceActionMenu';

import type { FirewallDeviceActionMenuProps } from './FirewallDeviceActionMenu';

interface FirewallDeviceRowProps extends FirewallDeviceActionMenuProps {
  isLinodeRelatedDevice: boolean;
}

export const FirewallDeviceRow = React.memo((props: FirewallDeviceRowProps) => {
  const { device, isLinodeRelatedDevice } = props;
  const { id, label, type, parent_entity } = device.entity;

  const isInterfaceDevice = type === 'interface';

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const link =
    isInterfaceDevice && parent_entity
      ? `/linodes/${parent_entity.id}/networking/interfaces/${id}`
      : `/${type}s/${id}/${type === 'linode' ? 'networking' : 'summary'}`;

  return (
    <TableRow data-testid={`firewall-device-row-${id}`}>
      <TableCell>
        <Link tabIndex={0} to={link}>
          {isInterfaceDevice && parent_entity ? parent_entity.label : label}
        </Link>
      </TableCell>
      {isLinodeInterfacesEnabled && isLinodeRelatedDevice && (
        <TableCell>
          {isInterfaceDevice
            ? `Linode Interface (ID: ${id})`
            : 'Configuration Profile Interface'}
        </TableCell>
      )}
      <TableCell actionCell>
        <FirewallDeviceActionMenu {...props} device={device} />
      </TableCell>
    </TableRow>
  );
});
