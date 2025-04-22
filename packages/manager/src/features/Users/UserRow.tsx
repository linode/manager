import { useAccountUserGrants, useProfile } from '@linode/queries';
import { Box, Chip, Stack, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { UsersActionMenu } from './UsersActionMenu';

import type { User } from '@linode/api-v4';

interface Props {
  onDelete: (username: string) => void;
  user: User;
}

export const UserRow = ({ onDelete, user }: Props) => {
  const theme = useTheme();
  const { data: grants } = useAccountUserGrants(user.username);
  const { data: profile } = useProfile();

  const isProxyUser = Boolean(user.user_type === 'proxy');
  const showChildAccountAccessCol = profile?.user_type === 'parent';

  return (
    <TableRow data-qa-table-row={user.username} key={user.username}>
      <TableCell>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <Avatar
            color={
              user.username !== profile?.username
                ? theme.palette.primary.dark
                : undefined
            }
            username={user.username}
          />
          <MaskableText isToggleable text={user.username} />
          <Box display="flex" flexGrow={1} />
          {user.tfa_enabled && <Chip color="success" label="2FA" />}
        </Stack>
      </TableCell>
      <Hidden smDown>
        <TableCell>
          {' '}
          <MaskableText isToggleable text={user.email} />
        </TableCell>
      </Hidden>
      <TableCell>{user.restricted ? 'Limited' : 'Full'}</TableCell>
      {showChildAccountAccessCol && (
        <Hidden lgDown>
          <TableCell>
            {user.restricted && !grants?.global?.child_account_access
              ? 'Disabled'
              : 'Enabled'}
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
