import * as React from 'react';
import { compose } from 'recompose';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Props as ActionProps } from './FirewallDeviceActionMenu';

export type CombinedProps = ActionProps;

export const FirewallDeviceRow: React.FC<CombinedProps> = props => {
  const { deviceLabel, deviceID } = props;

  return (
    <TableRow
      rowLink={`/linodes/${deviceID}`}
      data-testid={`firewall-device-row-${deviceID}`}
    >
      <TableCell>{deviceLabel}</TableCell>
      <TableCell>
        <ActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionProps>(React.memo)(
  FirewallDeviceRow
);
