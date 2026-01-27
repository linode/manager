import { useProfile } from '@linode/queries';
import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';

import { PARENT_USER } from 'src/features/Account/constants';
import { useFlags } from 'src/hooks/useFlags';

import { UserDeleteConfirmationDialog } from '../UserDeleteConfirmationDialog';

import type { User } from '@linode/api-v4';

interface Props {
  user: User;
}

export const DeleteUserPanel = ({ user }: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: profile } = useProfile();

  const { iamRbacPrimaryNavChanges } = useFlags();

  const isProxyUserProfile = user.user_type === 'proxy';

  const tooltipText =
    profile?.username === user.username
      ? 'You can\u{2019}t delete the currently active user.'
      : isProxyUserProfile
        ? `You can\u{2019}t delete a ${PARENT_USER}.`
        : undefined;

  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h2">Delete User</Typography>
        <Box>
          <Button
            buttonType="outlined"
            disabled={profile?.username === user.username || isProxyUserProfile}
            onClick={() => setIsDeleteDialogOpen(true)}
            tooltipText={tooltipText}
          >
            Delete
          </Button>
        </Box>
        <Typography variant="body1">
          The user will be deleted permanently.
        </Typography>
        <UserDeleteConfirmationDialog
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={() =>
            navigate({
              to: iamRbacPrimaryNavChanges ? '/users' : '/account/users',
            })
          }
          open={isDeleteDialogOpen}
          username={user.username}
        />
      </Stack>
    </Paper>
  );
};
