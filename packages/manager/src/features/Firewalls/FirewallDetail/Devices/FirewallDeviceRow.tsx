import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Props as ActionProps } from './FirewallDeviceActionMenu';

const useStyles = makeStyles(() => ({
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
  },
}));

export const FirewallDeviceRow: React.FC<ActionProps> = (props) => {
  const classes = useStyles();
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
      <TableCell className={classes.actionCell}>
        <ActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(FirewallDeviceRow);
