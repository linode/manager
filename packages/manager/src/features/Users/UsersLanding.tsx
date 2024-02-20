import * as React from 'react';

import AddNewLink from 'src/components/AddNewLink';
import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';

import CreateUserDrawer from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { UsersLandingProxyTableHead } from './UsersLandingProxyTableHead';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Filter } from '@linode/api-v4';

export const UsersLanding = () => {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');
  const flags = useFlags();
  const { data: profile } = useProfile();

  const pagination = usePagination(1, 'account-users');
  const order = useOrder();

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
  };

  if (flags.parentChildAccountAccess) {
    usersFilter['user_type'] = { '+neq': 'proxy' };
  }

  const { data: users, error, isLoading, refetch } = useAccountUsers({
    filters: usersFilter,
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
  });

  const {
    data: proxyUser,
    error: proxyUserError,
    isLoading: isLoadingProxyUser,
  } = useAccountUsers({
    enabled: flags.parentChildAccountAccess,
    filters: { user_type: 'proxy' },
  });

  const isRestrictedUser = profile?.restricted;

  const showProxyUserTable =
    flags.parentChildAccountAccess &&
    (profile?.user_type === 'child' || profile?.user_type === 'proxy');

  const showChildAccountAccessCol = Boolean(
    flags.parentChildAccountAccess && profile?.user_type === 'parent'
  );

  const numCols = showChildAccountAccessCol ? 6 : 5;

  const handleDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
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
              error={proxyUserError}
              isLoading={isLoadingProxyUser}
              numCols={numCols}
              onDelete={handleDelete}
              users={proxyUser?.data}
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
          <UsersLandingTableBody
            error={error}
            isLoading={isLoading}
            numCols={numCols}
            onDelete={handleDelete}
            users={users?.data}
          />
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
