import { deleteUser, User } from '@linode/api-v4/lib/account';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import UserIcon from 'src/assets/icons/user.svg';
import AddNewLink from 'src/components/AddNewLink';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PaginationFooter from 'src/components/PaginationFooter';
import usePagination from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import CreateUserDrawer from './CreateUserDrawer';
import UserDeleteConfirmationDialog from './UserDeleteConfirmationDialog';
import ActionMenu from './UsersActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white,
  },
  userLandingHeader: {
    margin: 0,
    width: '100%',
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem',
  },
  addNewWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
      padding: 5,
    },
    '&.MuiGrid-item': {
      padding: 5,
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  avatar: {
    borderRadius: '50%',
    width: 30,
    height: 30,
    marginRight: theme.spacing(2),
    animation: '$fadeIn 150ms linear forwards',
  },
  emptyImage: {
    display: 'inline',
    width: 30,
    height: 30,
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      width: 40,
      height: 40,
    },
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
    /*
      Explicitly stating this as the theme file is automatically adding padding to the last cell
      We can remove once we make the full switch to CMR styling
      */
    paddingRight: '0 !important',
  },
}));

interface Props {
  isRestrictedUser: boolean;
}

const UsersLanding: React.FC<Props> = (props) => {
  const pagination = usePagination(1, 'account-users');
  const { data: users, isLoading, error, refetch } = useAccountUsers(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    true
  );
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

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

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
        key={user.username}
        data-qa-user-row
        ariaLabel={`User ${user.username}`}
      >
        <TableCell data-qa-username>
          <Grid container alignItems="center">
            <Grid item style={{ display: 'flex' }}>
              {user.gravatarUrl === undefined ? (
                <div className={classes.emptyImage} />
              ) : user.gravatarUrl === 'not found' ? (
                <UserIcon className={classes.avatar} />
              ) : (
                <img
                  alt={`user ${user.username}'s avatar`}
                  src={user.gravatarUrl}
                  className={classes.avatar}
                />
              )}
            </Grid>
            <Grid item className="px0">
              {user.username}
            </Grid>
          </Grid>
        </TableCell>
        {!matchesSmDown && (
          <TableCell data-qa-user-email>{user.email}</TableCell>
        )}
        <TableCell data-qa-user-restriction>
          {user.restricted ? 'Limited' : 'Full'}
        </TableCell>
        <TableCell className={classes.actionCell}>
          <ActionMenu username={user.username} onDelete={onUsernameDelete} />
        </TableCell>
      </TableRow>
    );
  };

  const renderTableContent = () => {
    if (isLoading) {
      return <TableRowLoading colSpan={4} oneLine hasEntityIcon />;
    }

    if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    }

    if (!users || users.results === 0) {
      return <TableRowEmptyState colSpan={4} />;
    }

    return users.data.map((user) => renderUserRow(user));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
      {newUsername && (
        <Notice success text={`User ${newUsername} created successfully`} />
      )}
      {userDeleteError && (
        <Notice
          style={{ marginTop: newUsername ? 16 : 0 }}
          error
          text={`Error when deleting user, please try again later`}
        />
      )}
      <div className={classes.root}>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          className={classes.userLandingHeader}
        >
          <Grid item className="p0">
            <Typography variant="h3" data-qa-title className={classes.headline}>
              Users
            </Typography>
          </Grid>
          <Grid item className={classes.addNewWrapper}>
            <AddNewLink
              disabled={props.isRestrictedUser}
              disabledReason={
                props.isRestrictedUser
                  ? 'You cannot create other users as a restricted user.'
                  : undefined
              }
              onClick={openForCreate}
              label="Add a User"
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
      </div>
      <PaginationFooter
        count={users?.results || 0}
        page={pagination.page}
        pageSize={pagination.pageSize}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="users landing"
      />
      <CreateUserDrawer
        open={createDrawerOpen}
        onClose={userCreateOnClose}
        refetch={refetch}
      />
      <UserDeleteConfirmationDialog
        username={toDeleteUsername || ''}
        open={deleteConfirmDialogOpen}
        onDelete={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </React.Fragment>
  );
};

export default UsersLanding;
