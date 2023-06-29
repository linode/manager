import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import Link from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import formatDate from 'src/utilities/formatDate';
import { StatusIcon, Status } from 'src/components/StatusIcon/StatusIcon';
import { capitalize } from 'src/utilities/capitalize';
import {
  AccountLogin,
  AccountLoginStatus,
} from '@linode/api-v4/lib/account/types';
import { useProfile } from 'src/queries/profile';

const accessIconMap: Record<AccountLoginStatus, Status> = {
  failed: 'other',
  successful: 'active',
};

const AccountLoginsTableRow = (props: AccountLogin) => {
  const { datetime, ip, restricted, username, id, status } = props;
  const { data: profile } = useProfile();

  return (
    <TableRow key={id}>
      <TableCell>
        {formatDate(datetime, {
          timezone: profile?.timezone,
        })}
      </TableCell>
      <TableCell noWrap>
        <Link to={`/account/users/${username}`}>{username}</Link>
      </TableCell>
      <Hidden smDown>
        <TableCell>{ip}</TableCell>
      </Hidden>
      <Hidden mdDown>
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
