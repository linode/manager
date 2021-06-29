import * as React from 'react';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import Link from 'src/components/Link';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import capitalize from 'src/utilities/capitalize';
import { parseAPIDate } from 'src/utilities/date';
import formatDate from 'src/utilities/formatDate';

const useStyles = makeStyles(() => ({
  capitalize: {
    textTransform: 'capitalize',
  },
}));

const MaintenanceTableRow = (props: AccountMaintenance) => {
  const { entity, when, type, status, reason } = props;
  const classes = useStyles();

  const getStatusIcon = (
    status: 'pending' | 'ready' | 'started' | 'completed'
  ) => {
    switch (status) {
      case 'started':
        return 'other';
      case 'completed':
        return 'active';
      default:
        return 'inactive';
    }
  };

  return (
    <TableRow key={entity.id}>
      <TableCell>
        <Link to={`/${entity.type}s/${entity.id}`} tabIndex={0}>
          {entity.label}
        </Link>
      </TableCell>
      <TableCell>
        <div>{formatDate(when)}</div>
      </TableCell>
      <Hidden xsDown>
        <TableCell className={classes.capitalize}>
          {type.replace('_', ' ')}
        </TableCell>
      </Hidden>
      <TableCell>
        <StatusIcon status={getStatusIcon(status)} />
        {
          // @ts-expect-error api will change pending -> scheduled
          status === 'pending' || status === 'scheduled'
            ? 'Scheduled'
            : capitalize(status)
        }{' '}
      </TableCell>
      <Hidden smDown>
        <TableCell>{parseAPIDate(when).toRelative()}</TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>{reason}</TableCell>
      </Hidden>
    </TableRow>
  );
};

export default MaintenanceTableRow;
