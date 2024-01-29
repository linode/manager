import { User } from '@linode/api-v4';
import * as React from 'react';

import AddNewLink from 'src/components/AddNewLink';
import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';

import CreateUserDrawer from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { UserRow } from './UserRow';
import { UsersLandingProxyTableHead } from './UsersLandingProxyTableHead';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

export const UsersLanding = () => {
  const flags = useFlags();
  const { data: profile } = useProfile();

  const pagination = usePagination(1, 'account-users');
  const order = useOrder();

  const { data: users, error, isLoading, refetch } = useAccountUsers(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      '+order': order.order,
      '+order_by': order.orderBy,
    }
  );

  const isRestrictedUser = profile?.restricted;

  const showProxyUserTable =
    flags.parentChildAccountAccess &&
    (profile?.user_type === 'child' || profile?.user_type === 'proxy');
  const showChildAccountAccessCol = Boolean(
    flags.parentChildAccountAccess && profile?.user_type === 'parent'
  );
  const numCols = showChildAccountAccessCol ? 6 : 5;

  const { nonProxyUsers, proxyUsers } = users?.data.reduce(
    (acc: { nonProxyUsers: User[]; proxyUsers: User[] }, user: User) => {
      if (user.user_type === 'proxy') {
        acc.proxyUsers.push(user);
      } else {
        acc.nonProxyUsers.push(user);
      }
      return acc;
    },
    { nonProxyUsers: [], proxyUsers: [] }
  ) ?? { nonProxyUsers: [], proxyUsers: [] };

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');

  const onDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
  };

  // TODO: Parent/Child - M3-7559 remove this function once feature is live in production.
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          columns={numCols}
          responsive={{ 1: { smDown: true }, 3: { lgDown: true } }}
          rows={1}
        />
      );
    }

    if (error) {
      return <TableRowError colSpan={numCols} message={error[0].reason} />;
    }

    if (!users || users.results === 0) {
      return <TableRowEmpty colSpan={numCols} />;
    }

    return users.data.map((user) => (
      <UserRow key={user.username} onDelete={onDelete} user={user} />
    ));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
      {showProxyUserTable && (
        <Typography
          sx={(theme) => ({
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(3),
            [theme.breakpoints.down('md')]: {
              marginLeft: theme.spacing(1),
            },
          })}
          variant="h3"
        >
          Business partner settings
        </Typography>
      )}
      {showProxyUserTable && (
        <Table aria-label="List of Business Partners">
          <UsersLandingProxyTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading}
              numCols={numCols}
              onDelete={onDelete}
              users={proxyUsers}
            />
          </TableBody>
        </Table>
      )}
      <Box
        sx={(theme) => ({
          alignItems: 'center',
          display: 'flex',
          justifyContent: showProxyUserTable ? 'space-between' : 'flex-end',
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(3),
        })}
      >
        {showProxyUserTable && (
          <Typography
            sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                marginLeft: theme.spacing(1),
              },
            })}
            variant="h3"
          >
            User settings
          </Typography>
        )}
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
        <UsersLandingTableHead
          order={order}
          showChildAccountAccessCol={showChildAccountAccessCol}
        />
        <TableBody>
          {flags.parentChildAccountAccess ? (
            <UsersLandingTableBody
              error={error}
              isLoading={isLoading}
              numCols={numCols}
              onDelete={onDelete}
              users={nonProxyUsers}
            />
          ) : (
            renderTableContent()
          )}
        </TableBody>
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
