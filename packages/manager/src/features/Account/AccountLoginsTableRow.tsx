import {
  AccountLogin,
  AccountLoginStatus,
} from '@linode/api-v4/lib/account/types';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Status, StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useProfile } from 'src/queries/profile/profile';
import { capitalize } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';

const accessIconMap: Record<AccountLoginStatus, Status> = {
  failed: 'other',
  successful: 'active',
};

const AccountLoginsTableRow = (props: AccountLogin) => {
  const { datetime, id, ip, restricted, status, username } = props;
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
        <StatusIcon
          ariaLabel={`Status is ${status}`}
          pulse={false}
          status={accessIconMap[status] ?? 'other'}
        />
        {capitalize(status)}
      </TableCell>
    </TableRow>
  );
};

export default AccountLoginsTableRow;
