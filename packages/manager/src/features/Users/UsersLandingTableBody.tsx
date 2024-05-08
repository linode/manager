import { APIError, User } from '@linode/api-v4';
import React from 'react';

import { RenderError } from 'src/components/RenderError';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { UserRow } from './UserRow';

interface Props {
  error: APIError[] | null;
  isLoading: boolean;
  numCols: number;
  onDelete: (username: string) => void;
  users: User[] | undefined;
}

export const UsersLandingTableBody = (props: Props) => {
  const { error, isLoading, numCols, onDelete, users } = props;

  if (isLoading) {
    return <TableRowLoading columns={numCols} rows={1} />;
  }

  if (error && error.length > 0) {
    return (
      <TableRowError
        colSpan={numCols}
        message={<RenderError error={error[0]} />}
      />
    );
  }

  if (!users || users.length === 0) {
    return <TableRowEmpty colSpan={numCols} />;
  }

  return (
    <>
      {users.map((user) => (
        <UserRow key={user.username} onDelete={onDelete} user={user} />
      ))}
    </>
  );
};
