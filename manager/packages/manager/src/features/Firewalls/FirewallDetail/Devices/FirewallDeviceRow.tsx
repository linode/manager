import * as React from 'react';
import { Link } from 'react-router-dom';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Props as ActionProps } from './FirewallDeviceActionMenu';

export const FirewallDeviceRow: React.FC<ActionProps> = (props) => {
  const { deviceLabel, deviceID, deviceEntityID } = props;

  return (
    <TableRow
      data-testid={`firewall-device-row-${deviceID}`}
      ariaLabel={`Device ${deviceLabel}`}
    >
      <TableCell>
        <Link to={`/linodes/${deviceEntityID}`} tabIndex={0}>
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
