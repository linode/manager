import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ActionMenu, { Props as ActionProps } from './FirewallDeviceActionMenu';

const useStyles = makeStyles(() => ({
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
  },
}));

interface Props {
  entityID: number;
}

export type CombinedProps = Props & ActionProps;

export const FirewallDeviceRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { deviceLabel, deviceID, entityID } = props;

  return (
    <TableRow
      data-testid={`firewall-device-row-${deviceID}`}
      ariaLabel={`Device ${deviceLabel}`}
    >
      <TableCell>
        <Link to={`/linodes/${entityID}`} tabIndex={0}>
          {deviceLabel}
        </Link>
      </TableCell>
      <TableCell className={classes.actionCell}>
        <ActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, CombinedProps>(React.memo)(
  FirewallDeviceRow
);
