import Stack from '@mui/material/Stack';
import React from 'react';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import { capitalize } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';

import { UsersActionMenu } from './UsersActionMenu';

import type { User } from '@linode/api-v4';

interface Props {
  onDelete: (username: string) => void;
  user: User;
}

export const UserRow = ({ onDelete, user }: Props) => {
  return (
    <TableRow
      ariaLabel={`User ${user.username}`}
      data-qa-user-row
      key={user.username}
    >
      <TableCell>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <GravatarByEmail email={user.email} />
          <Typography>{user.username}</Typography>
          <Box display="flex" flexGrow={1} />
          {user.tfa_enabled && <Chip color="success" label="2FA" />}
        </Stack>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.restricted ? 'Limited' : 'Full'}</TableCell>
      <TableCell>
        <LastLogin user={user} />
      </TableCell>
      <TableCell actionCell>
        <UsersActionMenu onDelete={onDelete} username={user.username} />
      </TableCell>
    </TableRow>
  );
};

const LastLogin = ({ user }: { user: User }) => {
  const { data: profile } = useProfile();

  if (user.last_login === null) {
    return <Typography>Never</Typography>;
  }

  const date = formatDate(user.last_login.login_datetime, {
    timezone: profile?.timezone,
  });

  if (user.last_login.status === 'successful') {
    return <Typography>{date}</Typography>;
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <Typography>{date}</Typography>
      <Typography>&#8212;</Typography>
      <StatusIcon status="error" />
      <Typography>{capitalize(user.last_login.status)}</Typography>
    </Stack>
  );
};
