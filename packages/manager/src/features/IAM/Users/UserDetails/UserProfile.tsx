import { CircleProgress, ErrorState, Stack } from '@linode/ui';
import React from 'react';
import { useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { NotFound } from 'src/components/NotFound';
import { useAccountUser } from '@linode/queries';
import { useAccountUserPermissions } from 'src/queries/iam/iam';

import { DeleteUserPanel } from './DeleteUserPanel';
import { UserDetailsPanel } from './UserDetailsPanel';
import { UserEmailPanel } from './UserEmailPanel';
import { UsernamePanel } from './UsernamePanel';

export const UserProfile = () => {
  const { username } = useParams<{ username: string }>();

  const { data: user, error, isLoading } = useAccountUser(username ?? '');
  const { data: assignedRoles } = useAccountUserPermissions(username ?? '');

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  if (!user) {
    return <NotFound />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - Profile`} />
      <Stack spacing={2} sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <UserDetailsPanel assignedRoles={assignedRoles} user={user} />
        <UsernamePanel user={user} />
        <UserEmailPanel user={user} />
        <DeleteUserPanel user={user} />
      </Stack>
    </>
  );
};
