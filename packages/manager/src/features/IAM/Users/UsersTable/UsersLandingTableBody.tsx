import { useProfile } from '@linode/queries';
import { WarningIcon } from '@linode/ui';
import React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { UserRow } from './UserRow';

import type { APIError, User } from '@linode/api-v4';

interface Props {
  error: APIError[] | null;
  isChildWithDelegationEnabled?: boolean;
  isLoading: boolean;
  numCols: number;
  onDelete: (username: string) => void;
  users: undefined | User[];
}

export const UsersLandingTableBody = (props: Props) => {
  const {
    error,
    isLoading,
    numCols,
    onDelete,
    users,
    isChildWithDelegationEnabled,
  } = props;
  const { data: profile } = useProfile();

  if (isLoading) {
    return <TableRowLoading columns={numCols} rows={1} />;
  }

  if (error) {
    return <TableRowError colSpan={numCols} message={error[0].reason} />;
  }

  if (!users || users.length === 0) {
    return (
      <TableRowEmpty
        colSpan={numCols}
        message={
          profile?.restricted ? (
            <>
              <WarningIcon
                style={{ position: 'relative', top: 2, marginRight: 4 }}
                width={16}
              />{' '}
              You do not have permission to list users.
            </>
          ) : (
            'No users found'
          )
        }
      />
    );
  }

  return (
    <>
      {users.map((user) => (
        <UserRow
          isChildWithDelegationEnabled={isChildWithDelegationEnabled}
          key={user.username}
          onDelete={onDelete}
          user={user}
        />
      ))}
    </>
  );
};
