import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ActionMenu, { Props as ActionProps } from './FirewallDeviceActionMenu';

export const FirewallDeviceRow: React.FC<ActionProps> = (props) => {
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
        <ActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(FirewallDeviceRow);
