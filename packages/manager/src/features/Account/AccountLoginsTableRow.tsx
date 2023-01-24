import { AccountLogin } from '@linode/api-v4/lib/account/types';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import Link from 'src/components/Link';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import formatDate from 'src/utilities/formatDate';

const AccountLoginsTableRow = (props: AccountLogin) => {
  const { datetime, ip, restricted, username, id } = props;

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
    </TableRow>
  );
};

export default AccountLoginsTableRow;
