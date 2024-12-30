import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import {
  FirewallDeviceActionMenu,
  FirewallDeviceActionMenuProps,
} from './FirewallDeviceActionMenu';

import type { TableRowOwnProps } from '@mui/material';

interface Props extends FirewallDeviceActionMenuProps {
  hover?: TableRowOwnProps['hover'];
}

export const FirewallDeviceRow = React.memo((props: Props) => {
  const { deviceEntityID, deviceID, deviceLabel, deviceType, hover } = props;

  return (
    <TableRow data-testid={`firewall-device-row-${deviceID}`} hover={hover}>
      <TableCell>
        <Link tabIndex={0} to={`/${deviceType}s/${deviceEntityID}/networking`}>
          {deviceLabel}
        </Link>
      </TableCell>
      <TableCell actionCell>
        <FirewallDeviceActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
});
