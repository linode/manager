import { map as mapPromise } from 'bluebird';
import { deleteUser, getUsers, User } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as memoize from 'memoizee';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import UserIcon from 'src/assets/icons/user.svg';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import {
  makeStyles,
  useTheme,
  Theme,
  useMediaQuery
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState/TableRowEmptyState_CMR';
import TableRowError from 'src/components/TableRowError/TableRowError_CMR';
import TableRowLoading from 'src/components/TableRowLoading/TableRowLoading_CMR';
import { getGravatarUrl } from 'src/utilities/gravatar';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import CreateUserDrawer from './CreateUserDrawer';
import UserDeleteConfirmationDialog from './UserDeleteConfirmationDialog';
import ActionMenu from './UsersActionMenu_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white
  },
  userLandingHeader: {
    margin: 0,
    width: '100%'
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem'
  },
  addNewWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
      padding: 5
    },
    '&.MuiGrid-item': {
      padding: 5
    }
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  avatar: {
    borderRadius: '50%',
    width: 30,
    height: 30,
    marginRight: theme.spacing(2),
    animation: '$fadeIn 150ms linear forwards'
  },
  emptyImage: {
    display: 'inline',
    width: 30,
    height: 30,
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      width: 40,
      height: 40
    }
  }
}));

interface Props {
  isRestrictedUser: boolean;
}

type CombinedProps = WithSnackbarProps &
  Props &
  PaginationProps<User> &
  RouteComponentProps<{}>;

const UsersLanding: React.FC<CombinedProps> = props => {
  const {
    request,
    onDelete,
    enqueueSnackbar,
    data: users,
    error,
    loading
  } = props;

  const [createDrawerOpen, setCreateDrawerOpen] = React.useState<boolean>(
    false
  );
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = React.useState<
    boolean
  >(false);
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

  React.useEffect(() => {
    request();
  }, [request]);

  const addUser = () => {
    request();
  };

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
        onDelete();
        enqueueSnackbar(`User ${username} has been deleted successfully.`, {
          variant: 'success'
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
        rowLink={`/account/users/${user.username}/profile`}
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
        <TableCell>
          <ActionMenu username={user.username} onDelete={onUsernameDelete} />
        </TableCell>
      </TableRow>
    );
  };

  const renderTableContent = (
    loading: boolean,
    error?: APIError[],
    data?: User[]
  ) => {
    if (loading) {
      return <TableRowLoading colSpan={4} oneLine hasEntityIcon />;
    }

    if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    }

    if (!data || data.length === 0) {
      return <TableRowEmptyState colSpan={4} />;
    }

    return data.map(user => renderUserRow(user));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users" />
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
          <TableBody>{renderTableContent(loading, error, users)}</TableBody>
        </Table>
      </div>

      <PaginationFooter
        count={props.count}
        page={props.page}
        pageSize={props.pageSize}
        handlePageChange={props.handlePageChange}
        handleSizeChange={props.handlePageSizeChange}
        eventCategory="users landing"
      />
      <CreateUserDrawer
        open={createDrawerOpen}
        onClose={userCreateOnClose}
        addUser={addUser}
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

const memoizedGetGravatarURL = memoize(getGravatarUrl);

const paginated = Pagey((ownProps, params, filters) =>
  getUsers(params, filters).then(({ data, page, pages, results }) =>
    mapPromise(data, user =>
      memoizedGetGravatarURL(user.email).then((gravatarUrl: string) => ({
        ...user,
        gravatarUrl
      }))
    ).then(updatedUsers => ({ page, pages, results, data: updatedUsers }))
  )
);

export default compose<CombinedProps, Props>(
  withRouter,
  paginated,
  withSnackbar
)(UsersLanding);
