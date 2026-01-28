import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import {
  ERROR_STATE_TEXT,
  NO_ACCOUNT_DELEGATIONS_TEXT,
} from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { UserDelegationsTable } from './UserDelegationsTable';

export const UserDelegations = () => {
  const { username } = useParams({ from: '/iam/users/$username' });

  const {
    data: allDelegatedChildAccounts,
    isLoading,
    error,
  } = useGetDelegatedChildAccountsForUserQuery({
    username,
  });

  const hasDelegatedChildAccounts = allDelegatedChildAccounts
    ? allDelegatedChildAccounts.data.length > 0
    : false;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={ERROR_STATE_TEXT} />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${username} - User Delegations`} />
      {hasDelegatedChildAccounts ? (
        <UserDelegationsTable />
      ) : (
        <NoAssignedRoles
          hasAssignNewRoleDrawer={false}
          text={NO_ACCOUNT_DELEGATIONS_TEXT}
        />
      )}
    </>
  );
};
