import { User, deleteUser } from '@linode/api-v4/lib/account';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import AddNewLink from 'src/components/AddNewLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Notice } from 'src/components/Notice/Notice';
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
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { GravatarByEmail } from '../../components/GravatarByEmail';
import { CreateUserDrawer } from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { UsersActionMenu } from './UsersActionMenu';

export const UsersLanding = () => {
  const { data: profile } = useProfile();
  const pagination = usePagination(1, 'account-users');
  const { data: users, error, isLoading, refetch } = useAccountUsers({
    page: pagination.page,
    page_size: pagination.pageSize,
  });
  const isRestrictedUser = profile?.restricted;
  const { enqueueSnackbar } = useSnackbar();
  const [createDrawerOpen, setCreateDrawerOpen] = React.useState<boolean>(
    false
  );
  const [
    deleteConfirmDialogOpen,
    setDeleteConfirmDialogOpen,
  ] = React.useState<boolean>(false);
  const [newUsername, setNewUsername] = React.useState<string | undefined>(
    undefined
  );
  const [userDeleteError, setUserDeleteError] = React.useState<
    boolean | undefined
  >(false);
  const [toDeleteUsername, setToDeleteUsername] = React.useState<
    string | undefined
  >('');

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const openForCreate = () => {
    setCreateDrawerOpen(true);
  };

  const userCreateOnClose = () => {
    setCreateDrawerOpen(false);
  };

  const onDeleteConfirm = (username: string) => {
    setNewUsername(undefined);
    setUserDeleteError(false);
    setDeleteConfirmDialogOpen(false);

    deleteUser(username)
      .then(() => {
        refetch();
        enqueueSnackbar(`User ${username} has been deleted successfully.`, {
          variant: 'success',
        });
      })
      .catch(() => {
        setUserDeleteError(true);
        setToDeleteUsername('');

        scrollErrorIntoView();
      });
  };

  const onDeleteCancel = () => {
    setDeleteConfirmDialogOpen(false);
  };

  const onUsernameDelete = (username: string) => {
    setDeleteConfirmDialogOpen(true);
    setToDeleteUsername(username);
  };

  const renderUserRow = (user: User) => {
    return (
      <TableRow
        ariaLabel={`User ${user.username}`}
        data-qa-user-row
        key={user.username}
      >
        <TableCell data-qa-username>
          <Grid alignItems="center" container spacing={2}>
            <Grid style={{ display: 'flex' }}>
              <GravatarByEmail email={user.email} />
            </Grid>
            <Grid className="px0">{user.username}</Grid>
          </Grid>
        </TableCell>
        {!matchesSmDown && (
          <TableCell data-qa-user-email>{user.email}</TableCell>
        )}
        <TableCell data-qa-user-restriction>
          {user.restricted ? 'Limited' : 'Full'}
        </TableCell>
        <TableCell actionCell>
          <UsersActionMenu
            onDelete={onUsernameDelete}
            username={user.username}
          />
        </TableCell>
      </TableRow>
    );
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
    } else if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    } else if (!users || users.results === 0) {
      return <TableRowEmpty colSpan={4} />;
    } else {
      return users.data.map((user) => renderUserRow(user));
    }
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
      {newUsername && (
        <Notice success text={`User ${newUsername} created successfully`} />
      )}
      {userDeleteError && (
        <Notice
          error
          style={{ marginTop: newUsername ? 16 : 0 }}
          text={`Error when deleting user, please try again later`}
        />
      )}
      <Grid
        alignItems="flex-end"
        container
        justifyContent="flex-end"
        spacing={2}
        sx={{ margin: 0, width: '100%' }}
      >
        <Grid
          sx={{
            '&.MuiGrid-item': {
              paddingRight: 0,
              paddingTop: 0,
            },
            [theme.breakpoints.down('md')]: {
              marginRight: theme.spacing(),
            },
          }}
        >
          <AddNewLink
            disabledReason={
              isRestrictedUser
                ? 'You cannot create other users as a restricted user.'
                : undefined
            }
            disabled={isRestrictedUser}
            label="Add a User"
            onClick={openForCreate}
          />
        </Grid>
      </Grid>
      <Table aria-label="List of Users">
        <TableHead>
          <TableRow>
            <TableCell data-qa-username-column>Username</TableCell>
            {!matchesSmDown && (
              <TableCell data-qa-email-column>Email Address</TableCell>
            )}
            <TableCell data-qa-restriction-column>Account Access</TableCell>
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
        onClose={userCreateOnClose}
        open={createDrawerOpen}
        refetch={refetch}
      />
      <UserDeleteConfirmationDialog
        onCancel={onDeleteCancel}
        onDelete={() => onDeleteConfirm(toDeleteUsername ?? '')}
        open={deleteConfirmDialogOpen}
        username={toDeleteUsername || ''}
      />
    </React.Fragment>
  );
};
