import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';

import { PARENT_USER } from 'src/features/Account/constants';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { UserDeleteConfirmation } from './UserDeleteConfirmation';

import type { User } from '@linode/api-v4';

interface Props {
  activeUser: User;
  canDeleteUser: boolean;
}

export const DeleteUserPanel = ({ canDeleteUser, activeUser }: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { profileUserName } = useDelegationRole();

  const isProxyUser = activeUser.user_type === 'proxy';

  const tooltipText =
    profileUserName === activeUser.username
      ? 'You can\u{2019}t delete the currently active user.'
      : isProxyUser
        ? `You can\u{2019}t delete a ${PARENT_USER}.`
        : undefined;

  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h2">Delete User</Typography>
        <Box>
          <Button
            buttonType="outlined"
            disabled={
              profileUserName === activeUser.username ||
              isProxyUser ||
              !canDeleteUser
            }
            onClick={() => setIsDeleteDialogOpen(true)}
            tooltipText={
              !canDeleteUser
                ? 'You do not have permission to delete this user.'
                : tooltipText
            }
          >
            Delete
          </Button>
        </Box>
        <Typography variant="body1">
          The user will be deleted permanently.
        </Typography>
        <UserDeleteConfirmation
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={() => navigate({ to: '/iam/users' })}
          open={isDeleteDialogOpen}
          username={activeUser.username}
        />
      </Stack>
    </Paper>
  );
};
