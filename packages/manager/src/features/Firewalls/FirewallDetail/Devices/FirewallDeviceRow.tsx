import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import {
  FirewallDeviceActionMenu,
  FirewallDeviceActionMenuProps,
} from './FirewallDeviceActionMenu';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

interface ExtendedFirewallDeviceActionMenuProps
  extends FirewallDeviceActionMenuProps {
  deviceType: FirewallDeviceEntityType;
}

export const FirewallDeviceRow = React.memo(
  (props: ExtendedFirewallDeviceActionMenuProps) => {
    const { deviceEntityID, deviceID, deviceLabel, deviceType } = props;

    return (
      <TableRow
        ariaLabel={`Device ${deviceLabel}`}
        data-testid={`firewall-device-row-${deviceID}`}
      >
        <TableCell>
          <Link
            tabIndex={0}
            to={`/${deviceType}s/${deviceEntityID}/networking`}
          >
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
