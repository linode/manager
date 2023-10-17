import Stack from '@mui/material/Stack';
import React from 'react';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

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
          {user.tfa_enabled && <Chip label="2FA" color='success' />}
        </Stack>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.restricted ? 'Limited' : 'Full'}</TableCell>
      <TableCell actionCell>
        <UsersActionMenu onDelete={onDelete} username={user.username} />
      </TableCell>
    </TableRow>
  );
};
