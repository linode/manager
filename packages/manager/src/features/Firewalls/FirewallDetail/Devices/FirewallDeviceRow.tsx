import * as React from 'react';

import { Link } from 'src/components/Link';
import { Skeleton } from 'src/components/Skeleton';
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
  const { id, label, type, url } = device.entity;

  const isInterfaceDevice = type === 'linode_interface';
  // for Linode Interfaces, the url comes in as '/v4/linode/instances/:linodeId/interfaces/:interfaceId
  // we need the Linode ID to create a link
  const entityId = isInterfaceDevice ? Number(url.split('/')[4]) : id;

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const link = isInterfaceDevice
    ? `/linodes/${entityId}/networking/interfaces/${id}`
    : `/${type}s/${id}/${type === 'linode' ? 'networking' : 'summary'}`;

  return (
    <TableRow data-testid={`firewall-device-row-${id}`}>
      <TableCell>
        {/* The only time a firewall device's label comes in as null is for Linode Interface devices. This label won't stay null - we do some
        processing to give the interface device its associated Linode's label. However, processing may take time, so we show a loading indicator first */}
        {isInterfaceDevice && !label ? (
          <Skeleton />
        ) : (
          <Link tabIndex={0} to={link}>
            {label}
          </Link>
        )}
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
