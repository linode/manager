import { useLinodeQuery } from '@linode/queries';
import { CircleProgress } from '@linode/ui';
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
  const { id, label, type, url } = device.entity;

  const isInterfaceDevice = type === 'interface';
  const entityId = isInterfaceDevice ? Number(url.split('/')[4]) : id;

  // Since we're not given the Linode's label for a Linode Interface device, we must fetch it
  const { data: linode, isLoading } = useLinodeQuery(
    entityId,
    isInterfaceDevice
  );

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  return (
    <TableRow data-testid={`firewall-device-row-${id}`}>
      <TableCell>
        {isLoading ? (
          <CircleProgress size="xs" />
        ) : (
          <Link
            to={`/${
              isInterfaceDevice ? 'linode' : type
            }s/${entityId}/networking`}
            tabIndex={0}
          >
            {label ?? linode?.label}
          </Link>
        )}
      </TableCell>
      {isLinodeInterfacesEnabled && isLinodeRelatedDevice && (
        <TableCell>
          {isInterfaceDevice && id !== 24
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
