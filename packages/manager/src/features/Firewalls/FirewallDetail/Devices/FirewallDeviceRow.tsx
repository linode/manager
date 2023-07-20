import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import {
  FirewallDeviceActionMenu,
  FirewallDeviceActionMenuProps as ActionProps,
} from './FirewallDeviceActionMenu';

export const FirewallDeviceRow = React.memo((props: ActionProps) => {
  const { deviceEntityID, deviceID, deviceLabel } = props;

  return (
    <TableRow
      ariaLabel={`Device ${deviceLabel}`}
      data-testid={`firewall-device-row-${deviceID}`}
    >
      <TableCell>
        <Link tabIndex={0} to={`/linodes/${deviceEntityID}`}>
          {deviceLabel}
        </Link>
      </TableCell>
      <TableCell actionCell>
        <FirewallDeviceActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
});
