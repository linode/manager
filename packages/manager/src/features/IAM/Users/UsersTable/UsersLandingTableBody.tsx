import { Icon, TableCell, TableRow } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useProfile } from '@linode/queries';
import React from 'react';

import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { UserRow } from './UserRow';

import type { APIError, User } from '@linode/api-v4';

interface Props {
  error: APIError[] | null;
  isLoading: boolean;
  onDelete: (username: string) => void;
  users: undefined | User[];
}

export const UsersLandingTableBody = (props: Props) => {
  const { error, isLoading, onDelete, users } = props;
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <TableRow
        aria-label="Table content is loading"
        data-testid="table-row-loading"
      >
        <TableCell style={{ height: 50, paddingTop: Spacing.S16 }}>
          <CircleProgress size="medium" />
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow data-testid="table-row-error">
        <TableCell style={{ textAlign: 'center', flexBasis: '100%' }}>
          <p style={{ width: '100%' }}>{error[0].reason}</p>
        </TableCell>
      </TableRow>
    );
  }

  if (!users || users.length === 0) {
    return (
      <TableRow>
        <TableCell style={{ textAlign: 'center', flexBasis: '100%' }}>
          <p style={{ width: '100%' }}>
            {profile?.restricted ? (
              <>
                <Icon
                  icon="status-alert-filled"
                  size="s"
                  style={{ verticalAlign: 'sub' }}
                />{' '}
                You do not have permission to list users.
              </>
            ) : (
              'No users found'
            )}
          </p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {users.map((user) => (
        <UserRow key={user.username} onDelete={onDelete} user={user} />
      ))}
    </>
  );
};
