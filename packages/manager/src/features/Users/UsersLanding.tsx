import * as React from 'react';

import AddNewLink from 'src/components/AddNewLink';
import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';

import CreateUserDrawer from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { UserRow } from './UserRow';

export const UsersLanding = () => {
  const { data: profile } = useProfile();

  const pagination = usePagination(1, 'account-users');

  const { data: users, error, isLoading, refetch } = useAccountUsers({
    page: pagination.page,
    page_size: pagination.pageSize,
  });

  const isRestrictedUser = profile?.restricted;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');

  const onDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          columns={4}
          responsive={{ 1: { smDown: true } }}
          rows={1}
        />
      );
    }

    if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    }

    if (!users || users.results === 0) {
      return <TableRowEmpty colSpan={4} />;
    }

    return users.data.map((user) => (
      <UserRow key={user.username} onDelete={onDelete} user={user} />
    ));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
      <Box display="flex" justifyContent="flex-end" sx={{ marginBottom: 1 }}>
        <AddNewLink
          disabledReason={
            isRestrictedUser
              ? 'You cannot create other users as a restricted user.'
              : undefined
          }
          disabled={isRestrictedUser}
          label="Add a User"
          onClick={() => setIsCreateDrawerOpen(true)}
        />
      </Box>
      <Table aria-label="List of Users">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email Address</TableCell>
            <TableCell>Account Access</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={users?.results || 0}
        eventCategory="users landing"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <CreateUserDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
        refetch={refetch}
      />
      <UserDeleteConfirmationDialog
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        username={selectedUsername}
      />
    </React.Fragment>
  );
};
