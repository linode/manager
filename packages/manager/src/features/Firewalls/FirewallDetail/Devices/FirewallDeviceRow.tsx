import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { FirewallDeviceActionMenu } from './FirewallDeviceActionMenu';

import type { FirewallDeviceActionMenuProps } from './FirewallDeviceActionMenu';

export const FirewallDeviceRow = React.memo(
  (props: FirewallDeviceActionMenuProps) => {
    const { device } = props;
    const { id, label, type } = device.entity;

    return (
      <TableRow data-testid={`firewall-device-row-${id}`}>
        <TableCell>
          <Link tabIndex={0} to={`/${type}s/${id}/networking`}>
            {label}
          </Link>
        </TableCell>
        <TableCell actionCell>
          <FirewallDeviceActionMenu {...props} device={device} />
        </TableCell>
      </TableRow>
    );
  }
);
