import { map as mapPromise } from 'bluebird';
import * as memoize from 'memoizee';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import UserIcon from 'src/assets/icons/user.svg';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { deleteUser, getUsers } from 'src/services/account';
import { getGravatarUrl } from 'src/utilities/gravatar';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import CreateUserDrawer from './CreateUserDrawer';
import UserDeleteConfirmationDialog from './UserDeleteConfirmationDialog';
import ActionMenu from './UsersActionMenu';

type ClassNames = 'title' | 'avatar' | 'emptyImage';

const styles = (theme: Theme) =>
  createStyles({
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
      animation: '$fadeIn 150ms linear forwards',
      [theme.breakpoints.up('md')]: {
        width: 40,
        height: 40
      }
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
  });

interface State {
  createDrawerOpen: boolean;
  newUsername?: string;
  deleteConfirmDialogOpen: boolean;
  toDeleteUsername?: string;
  userDeleteError?: boolean;
}

interface Props {
  isRestrictedUser: boolean;
}

type CombinedProps = WithStyles<ClassNames> &
  WithSnackbarProps &
  Props &
  PaginationProps<Linode.User> &
  RouteComponentProps<{}>;

class UsersLanding extends React.Component<CombinedProps, State> {
  state: State = {
    createDrawerOpen: false,
    deleteConfirmDialogOpen: false
  };

  static docs: Linode.Doc[] = [
    {
      title: 'Accounts and Password',
      src:
        'https://www.linode.com/docs/platform/manager/accounts-and-passwords-new-manager/',
      body: `Maintaining your user Linode Manager accounts, passwords, and
      contact information is just as important as administering your Linode.
      This guide shows you how to control access to the Linode Manager,
      update your contact information, and modify account passwords. Note
      that the information in this guide applies to the Linode Manager only,
      except for the section on resetting the root password.`
    },
    {
      title: 'Linode Manager Security Controls',
      src:
        'https://www.linode.com/docs/security/linode-manager-security-controls-new-manager/',
      body: `The Linode Manager is the gateway to all of your Linode products
      and services, and you should take steps to protect it from unauthorized
      access. This guide documents several of Linode Manager’s features that
      can help mitigate your risk. Whether you’re worried about malicious
      users gaining access to your username and password, or authorized users
      abusing their access privileges, Linode Manager’s built-in security
      tools can help.`
    }
  ];

  componentDidMount() {
    this.props.request();
  }

  addUser = () => {
    this.props.request();
  };

  openForCreate = () => {
    this.setState({
      createDrawerOpen: true
    });
  };

  userCreateOnClose = () => {
    this.setState({
      createDrawerOpen: false
    });
  };

  onDeleteConfirm = (username: string) => {
    this.setState({
      newUsername: undefined,
      userDeleteError: false,
      deleteConfirmDialogOpen: false
    });

    deleteUser(username)
      .then(() => {
        this.props.onDelete();
        this.props.enqueueSnackbar(
          `User ${username} has been deleted successfully.`,
          { variant: 'success' }
        );
      })
      .catch(() => {
        this.setState({
          userDeleteError: true,
          toDeleteUsername: ''
        });
        scrollErrorIntoView();
      });
  };

  onDeleteCancel = () => {
    this.setState({
      deleteConfirmDialogOpen: false
    });
  };

  onDelete = (username: string) => {
    this.setState({
      deleteConfirmDialogOpen: true,
      toDeleteUsername: username
    });
  };

  renderUserRow = (user: Linode.User) => {
    const { classes } = this.props;
    return (
      <TableRow
        key={user.username}
        data-qa-user-row
        rowLink={`/account/users/${user.username}/profile`}
      >
        <TableCell parentColumn="Username" data-qa-username>
          <Grid container alignItems="center">
            <Grid item>
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
        <TableCell parentColumn="Email Address" data-qa-user-email>
          {user.email}
        </TableCell>
        <TableCell parentColumn="Account Access" data-qa-user-restriction>
          {user.restricted ? 'Limited' : 'Full'}
        </TableCell>
        <TableCell>
          <ActionMenu username={user.username} onDelete={this.onDelete} />
        </TableCell>
      </TableRow>
    );
  };

  render() {
    const { classes, data: users, error, loading } = this.props;
    const {
      createDrawerOpen,
      newUsername,
      toDeleteUsername,
      deleteConfirmDialogOpen,
      userDeleteError
    } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Users" />
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography variant="h2" data-qa-title className={classes.title}>
              Users
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  disabled={this.props.isRestrictedUser}
                  disabledReason={
                    this.props.isRestrictedUser
                      ? 'You cannot create other users as a restricted user.'
                      : undefined
                  }
                  onClick={this.openForCreate}
                  label="Add a User"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
        <Paper>
          <Table aria-label="List of Users">
            <TableHead>
              <TableRow>
                <TableCell data-qa-username-column>Username</TableCell>
                <TableCell data-qa-email-column>Email Address</TableCell>
                <TableCell data-qa-restriction-column>Account Access</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderTableContent(loading, error, users)}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          count={this.props.count}
          page={this.props.page}
          pageSize={this.props.pageSize}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
          eventCategory="users landing"
        />
        <CreateUserDrawer
          open={createDrawerOpen}
          onClose={this.userCreateOnClose}
          addUser={this.addUser}
        />
        <UserDeleteConfirmationDialog
          username={toDeleteUsername || ''}
          open={deleteConfirmDialogOpen}
          onDelete={this.onDeleteConfirm}
          onCancel={this.onDeleteCancel}
        />
      </React.Fragment>
    );
  }

  renderTableContent = (
    loading: boolean,
    error?: Linode.ApiFieldError[],
    data?: Linode.User[]
  ) => {
    if (loading) {
      return <TableRowLoading colSpan={4} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={4}
          message={
            error[0].reason.match(/not auth/i)
              ? 'You do not have permission to view other users.'
              : `Unable to load user data.`
          }
        />
      );
    }

    if (!data || data.length === 0) {
      return <TableRowEmptyState colSpan={4} />;
    }

    return data.map(user => this.renderUserRow(user));
  };
}

const styled = withStyles(styles);

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
  setDocs(UsersLanding.docs),
  styled,
  paginated,
  withSnackbar
)(UsersLanding);
