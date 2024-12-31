import { Box, Button, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { PARENT_USER } from 'src/features/Account/constants';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAccountUsers } from 'src/queries/account/users';
import { useProfile } from 'src/queries/profile/profile';

import CreateUserDrawer from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { UsersLandingProxyTableHead } from './UsersLandingProxyTableHead';
import { UsersLandingTableBody } from './UsersLandingTableBody';
import { UsersLandingTableHead } from './UsersLandingTableHead';

import type { Filter } from '@linode/api-v4';

export const UsersLanding = () => {
  const theme = useTheme();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');
  const { data: profile } = useProfile();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const pagination = usePagination(1, 'account-users');
  const order = useOrder();

  const showProxyUserTable =
    profile?.user_type === 'child' || profile?.user_type === 'proxy';

  const usersFilter: Filter = {
    ['+order']: order.order,
    ['+order_by']: order.orderBy,
    ['user_type']: showProxyUserTable ? 'child' : undefined,
  };

  // Since this query is disabled for restricted users, use isInitialLoading.
  const { data: users, error, isInitialLoading, refetch } = useAccountUsers({
    filters: usersFilter,
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
  });

  const isRestrictedUser = profile?.restricted;

  // Since this query is disabled for restricted users, use isInitialLoading.
  const {
    data: proxyUser,
    error: proxyUserError,
    isInitialLoading: isLoadingProxyUser,
  } = useAccountUsers({
    enabled: showProxyUserTable && !isRestrictedUser,
    filters: { user_type: 'proxy' },
  });

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const showChildAccountAccessCol = Boolean(
    profile?.user_type === 'parent' && !isChildAccountAccessRestricted
  );

  // Parent/Child accounts include additional "child account access" column.
  const numCols = matchesLgUp
    ? showChildAccountAccessCol
      ? 6
      : 5
    : matchesSmDown
    ? 3
    : 4;

  // "last login" column omitted for proxy table.
  const proxyNumCols = matchesLgUp ? 4 : numCols;

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
            textTransform: 'capitalize',
            [theme.breakpoints.down('md')]: {
              marginLeft: theme.spacing(1),
            },
          })}
          variant="h3"
        >
          {PARENT_USER} Settings
        </Typography>
      )}
      {showProxyUserTable && (
        <Table aria-label="List of Parent Users">
          <UsersLandingProxyTableHead order={order} />
          <TableBody>
            <UsersLandingTableBody
              error={proxyUserError}
              isLoading={isLoadingProxyUser}
              numCols={proxyNumCols}
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
            User Settings
          </Typography>
        )}
        <Button
          tooltipText={
            isRestrictedUser
              ? 'You cannot create other users as a restricted user.'
              : undefined
          }
          buttonType="primary"
          disabled={isRestrictedUser}
          onClick={() => setIsCreateDrawerOpen(true)}
        >
          Add a User
        </Button>
      </Box>
      <Table aria-label="List of Users">
        <UsersLandingTableHead
          order={order}
          showChildAccountAccessCol={showChildAccountAccessCol}
        />
        <TableBody>
          <UsersLandingTableBody
            error={error}
            isLoading={isInitialLoading}
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
