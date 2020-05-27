import * as React from 'react';
import { compose } from 'recompose';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Props as ActionProps } from './FirewallDeviceActionMenu';

interface Props {
  entityID: number;
}

export type CombinedProps = Props & ActionProps;

export const FirewallDeviceRow: React.FC<CombinedProps> = props => {
  const { deviceLabel, deviceID, entityID } = props;

  return (
    <TableRow
      rowLink={`/linodes/${entityID}`}
      data-testid={`firewall-device-row-${deviceID}`}
      ariaLabel={`Device ${deviceLabel}`}
    >
      <TableCell>{deviceLabel}</TableCell>
      <TableCell>
        <ActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, CombinedProps>(React.memo)(
  FirewallDeviceRow
);
