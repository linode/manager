import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import {
  FirewallDeviceActionMenu,
  FirewallDeviceActionMenuProps,
} from './FirewallDeviceActionMenu';

export const FirewallDeviceRow = React.memo(
  (props: FirewallDeviceActionMenuProps) => {
    const { deviceEntityID, deviceLabel } = props;

    return (
      <TableRow ariaLabel={`Device ${deviceLabel}`}>
        <TableCell>
          <Link tabIndex={0} to={`/linodes/${deviceEntityID}/networking`}>
            {deviceLabel}
          </Link>
        </TableCell>
        <TableCell actionCell>
          <FirewallDeviceActionMenu {...props} />
        </TableCell>
      </TableRow>
    );
  }
);
