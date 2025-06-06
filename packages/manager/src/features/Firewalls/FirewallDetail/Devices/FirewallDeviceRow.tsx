import * as React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { getDeviceLinkAndLabel } from '../../FirewallLanding/FirewallRow';
import { FirewallDeviceActionMenu } from './FirewallDeviceActionMenu';

import type { FirewallDeviceActionMenuProps } from './FirewallDeviceActionMenu';

interface FirewallDeviceRowProps extends FirewallDeviceActionMenuProps {
  isLinodeRelatedDevice: boolean;
}

export const FirewallDeviceRow = React.memo((props: FirewallDeviceRowProps) => {
  const { device, isLinodeRelatedDevice } = props;
  const { id, type } = device.entity;

  const isInterfaceDevice = type === 'interface';

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { entityLabel, entityLink } = getDeviceLinkAndLabel(device.entity);

  return (
    <TableRow data-testid={`firewall-device-row-${id}`}>
      <TableCell>
        <Link tabIndex={0} to={entityLink}>
          {entityLabel}
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
