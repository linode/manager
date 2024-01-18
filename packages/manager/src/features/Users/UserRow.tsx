import React from 'react';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { Hidden } from 'src/components/Hidden';
import { Stack } from 'src/components/Stack';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountUser, useAccountUserGrants } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';
import { capitalize } from 'src/utilities/capitalize';

import { UsersActionMenu } from './UsersActionMenu';

import type { User } from '@linode/api-v4';

interface Props {
  onDelete: (username: string) => void;
  user: User;
}

export const UserRow = ({ onDelete, user }: Props) => {
  const flags = useFlags();
  const { data: grants } = useAccountUserGrants(user.username);
  const { data: profile } = useProfile();
  const { data: activeUser } = useAccountUser(profile?.username ?? '');

  const isProxyUser = Boolean(
    flags.parentChildAccountAccess && user.user_type === 'proxy'
  );
  const showChildAccountAccessCol =
    flags.parentChildAccountAccess && activeUser?.user_type === 'parent';

  return (
    <TableRow ariaLabel={`User ${user.username}`} key={user.username}>
      <TableCell>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <GravatarByEmail email={user.email} />
          <Typography>{user.username}</Typography>
          <Box display="flex" flexGrow={1} />
          {user.tfa_enabled && <Chip color="success" label="2FA" />}
        </Stack>
      </TableCell>
      <Hidden smDown>
        <TableCell>{user.email}</TableCell>
      </Hidden>
      <TableCell>{user.restricted ? 'Limited' : 'Full'}</TableCell>
      {showChildAccountAccessCol && (
        <Hidden lgDown>
          <TableCell>
            {grants?.global?.child_account_access ? 'Enabled' : 'Disabled'}
          </TableCell>
        </Hidden>
      )}
      {!isProxyUser && (
        <Hidden lgDown>
          <TableCell>
            <LastLogin last_login={user.last_login} />
          </TableCell>
        </Hidden>
      )}
      <TableCell actionCell>
        <UsersActionMenu
          isProxyUser={isProxyUser}
          onDelete={onDelete}
          username={user.username}
        />
      </TableCell>
    </TableRow>
  );
};

/**
 * Display information about a Users last login
 *
 * - The component renders "Never" if last_login is `null`
 * - The component renders a date if last_login is a success
 * - The component renders a date and a status if last_login is a failure
 */
const LastLogin = (props: Pick<User, 'last_login'>) => {
  const { last_login } = props;

  if (last_login === null) {
    return <Typography>Never</Typography>;
  }

  if (last_login.status === 'successful') {
    return <DateTimeDisplay value={last_login.login_datetime} />;
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <DateTimeDisplay value={last_login.login_datetime} />
      <Typography>&#8212;</Typography>
      <StatusIcon status="error" />
      <Typography>{capitalize(last_login.status)}</Typography>
    </Stack>
  );
};
