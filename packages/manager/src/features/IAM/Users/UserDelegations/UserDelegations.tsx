import { NotificationBanner } from '@akamai/cds-components/react/NotificationBanner';
import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { usePermissions } from '../../hooks/usePermissions';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { NO_ACCOUNT_DELEGATIONS_TEXT } from '../../Shared/constants';
import { DocumentTitleSegment } from '../../Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from '../../Shared/ErrorState/ErrorState';
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
      <NotificationBanner
        text="You do not have permission to view this user's account delegations."
        type="error"
      />
    );
  }

  if (error) {
    return <ErrorState />;
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
