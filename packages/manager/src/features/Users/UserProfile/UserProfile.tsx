import { useAccountUser } from '@linode/queries';
import { CircleProgress, ErrorState, NotFound, Stack } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useFlags } from 'src/hooks/useFlags';

import { DeleteUserPanel } from './DeleteUserPanel';
import { UserDetailsPanel } from './UserDetailsPanel';
import { UserEmailPanel } from './UserEmailPanel';
import { UsernamePanel } from './UsernamePanel';

export const UserProfile = () => {
  const { iamRbacPrimaryNavChanges } = useFlags();

  const { username } = useParams({
    from: iamRbacPrimaryNavChanges
      ? '/users/$username'
      : '/account/users/$username',
  });

  const { data: user, error, isLoading } = useAccountUser(username ?? '');

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
      <Stack spacing={2}>
        <UserDetailsPanel user={user} />
        <UsernamePanel user={user} />
        <UserEmailPanel user={user} />
        <DeleteUserPanel user={user} />
      </Stack>
    </>
  );
};
