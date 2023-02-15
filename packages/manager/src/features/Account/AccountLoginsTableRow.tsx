import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import Link from 'src/components/Link';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import formatDate from 'src/utilities/formatDate';
import StatusIcon, { Status } from 'src/components/StatusIcon/StatusIcon';
import { capitalize } from 'src/utilities/capitalize';
import {
  AccountLogin,
  AccountLoginStatus,
} from '@linode/api-v4/lib/account/types';

const accessIconMap: Record<AccountLoginStatus, Status> = {
  failed: 'other',
  successful: 'active',
};

const AccountLoginsTableRow = (props: AccountLogin) => {
  const { datetime, ip, restricted, username, id, status } = props;

  return (
    <TableRow key={id}>
      <TableCell>{formatDate(datetime)}</TableCell>
      <TableCell noWrap>
        <Link to={`/account/users/${username}`}>{username}</Link>
      </TableCell>
      <Hidden xsDown>
        <TableCell>{ip}</TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell noWrap>
          {restricted ? 'Restricted' : 'Unrestricted'}
        </TableCell>
      </Hidden>
      <TableCell statusCell>
        <StatusIcon status={accessIconMap[status] ?? 'other'} pulse={false} />
        {capitalize(status)}
      </TableCell>
    </TableRow>
  );
};

export default AccountLoginsTableRow;
