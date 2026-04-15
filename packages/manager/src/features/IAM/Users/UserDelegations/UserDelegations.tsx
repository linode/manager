import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import { ErrorState, Notice } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { usePermissions } from '../../hooks/usePermissions';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import {
  ERROR_STATE_TEXT,
  NO_ACCOUNT_DELEGATIONS_TEXT,
} from '../../Shared/constants';
import { NoAssignedRoles } from '../../Shared/NoAssignedRoles/NoAssignedRoles';
import { UserDelegationsTable } from './UserDelegationsTable';

export const UserDelegations = () => {
  const { username } = useParams({ from: '/iam/users/$username' });

  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['list_user_delegate_accounts']
  );

  const {
    data: allDelegatedChildAccounts,
    isLoading,
    error,
  } = useGetDelegatedChildAccountsForUserQuery({
    username,
    enabled: permissions?.list_user_delegate_accounts,
  });

  const hasDelegatedChildAccounts = allDelegatedChildAccounts
    ? allDelegatedChildAccounts.data.length > 0
    : false;

  if (isLoading || isPermissionsLoading) {
    return <CircleProgress />;
  }

  if (!permissions?.list_user_delegate_accounts) {
    return (
      <Notice variant="error">
        You do not have permission to view this user&apos;s account delegations.
      </Notice>
    );
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
