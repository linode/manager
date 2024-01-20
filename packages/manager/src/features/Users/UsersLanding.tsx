import { User } from '@linode/api-v4/lib/account';
import * as React from 'react';

import AddNewLink from 'src/components/AddNewLink';
import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';

import CreateUserDrawer from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { UserRow } from './UserRow';

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
    flags.parentChildAccountAccess && profile?.user_type === 'child';
  const proxyUsers =
    users?.data.filter((user) => user.user_type === 'proxy') ?? [];
  const nonProxyUsers =
    users?.data.filter((user) => user.user_type !== 'proxy') ?? [];

  const showChildAccountAccessCol =
    flags.parentChildAccountAccess && profile?.user_type === 'parent';
  const numCols = showChildAccountAccessCol ? 6 : 5;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedUsername, setSelectedUsername] = React.useState('');

  const onDelete = (username: string) => {
    setIsDeleteDialogOpen(true);
    setSelectedUsername(username);
  };

  // TODO: Parent/Child - M3-7559 remove once feature is live in production.
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

  const renderProxyTableHeader = () => {
    return (
      <TableRow>
        <TableSortCell
          active={order.orderBy === 'username'}
          direction={order.order}
          handleClick={order.handleOrderChange}
          label="username"
        >
          Username
        </TableSortCell>
        <Hidden smDown>
          <TableSortCell
            active={order.orderBy === 'email'}
            direction={order.order}
            handleClick={order.handleOrderChange}
            label="email"
          >
            Email Address
          </TableSortCell>
        </Hidden>
        <TableCell>Account Access</TableCell>
        <TableCell />
      </TableRow>
    );
  };

  const renderTableHeader = () => {
    return (
      <TableRow>
        <TableSortCell
          active={order.orderBy === 'username'}
          direction={order.order}
          handleClick={order.handleOrderChange}
          label="username"
        >
          Username
        </TableSortCell>
        <Hidden smDown>
          <TableSortCell
            active={order.orderBy === 'email'}
            direction={order.order}
            handleClick={order.handleOrderChange}
            label="email"
          >
            Email Address
          </TableSortCell>
        </Hidden>
        <TableCell>Account Access</TableCell>
        {showChildAccountAccessCol && (
          <Hidden lgDown>
            <TableCell>Child Account Access</TableCell>
          </Hidden>
        )}
        <Hidden lgDown>
          <TableCell>Last Login</TableCell>
        </Hidden>
        <TableCell />
      </TableRow>
    );
  };

  const renderTableBody = (users: User[]) => {
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

    if (!users || users.length === 0) {
      return <TableRowEmpty colSpan={numCols} />;
    }

    return users.map((user) => (
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
          <TableHead>{renderProxyTableHeader()}</TableHead>
          <TableBody>{renderTableBody(proxyUsers)}</TableBody>
        </Table>
      )}
      <Box
        sx={(theme) => ({
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
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
        <TableHead>{renderTableHeader()}</TableHead>
        <TableBody>
          {flags.parentChildAccountAccess
            ? renderTableBody(nonProxyUsers)
            : renderTableContent()}
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
