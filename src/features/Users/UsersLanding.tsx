import { map as mapPromise } from 'bluebird';
import * as memoize from 'memoizee';
import { compose } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography';

import UserIcon from 'src/assets/icons/user.svg';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
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

type ClassNames = 'title' | 'avatar' | 'userButton' | 'emptyImage';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  userButton: {
    borderRadius: 30,
    fontFamily: 'LatoWeb',
    padding: 0,
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main,
    },
    [theme.breakpoints.up('md')]: {
      padding: 8,
    },
  },
  avatar: {
    borderRadius: '50%',
    width: 30,
    height: 30,
    marginRight: theme.spacing.unit * 2,
    animation: 'fadeIn 150ms linear forwards',
    [theme.breakpoints.up('md')]: {
      width: 50,
      height: 50,
    },
  },
  emptyImage: {
    display: 'inline',
    width: 30,
    height: 30,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up('md')]: {
      width: 50,
      height: 50,
    },
  }
});

interface State {
  createDrawerOpen: boolean;
  newUsername?: string;
  deleteConfirmDialogOpen: boolean;
  toDeleteUsername?: string;
  deletedUsername?: string;
  userDeleteError?: boolean;
}

type CombinedProps =
  WithStyles<ClassNames>
  & PaginationProps<Linode.User>
  & RouteComponentProps<{}>;

class UsersLanding extends React.Component<CombinedProps, State> {
  state: State = {
    createDrawerOpen: false,
    deleteConfirmDialogOpen: false,
  };

  static docs: Linode.Doc[] = [
    {
      title: 'Accounts and Password',
      src: 'https://www.linode.com/docs/platform/accounts-and-passwords/',
      body: `Maintaining your user Linode Manager accounts, passwords, and
      contact information is just as important as administering your Linode.
      This guide shows you how to control access to the Linode Manager,
      update your contact information, and modify account passwords. Note
      that the information in this guide applies to the Linode Manager only,
      except for the section on resetting the root password.`,
    },
    {
      title: 'Linode Manager Security Controls',
      src: 'https://www.linode.com/docs/security/linode-manager-security-controls/',
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
    const { location: { state: locationState } } = this.props;
    this.props.request();
    // this.setUserAvatars()

    if (locationState && locationState.deletedUsername) {
      this.setState({
        deletedUsername: locationState.deletedUsername,
      })
    }
  }

  addUser = () => {
    this.props.request();
  }

  openForCreate = () => {
    this.setState({
      createDrawerOpen: true,
    })
  }

  userCreateOnClose = () => {
    this.setState({
      createDrawerOpen: false,
    })
  }

  onDeleteConfirm = (username: string) => {
    this.setState({
      newUsername: undefined,
      deletedUsername: undefined,
      userDeleteError: false,
      deleteConfirmDialogOpen: false,
    });

    deleteUser(username)
      .then(() => {
        this.props.onDelete();
      })
      .catch(() => {
        this.setState({
          userDeleteError: true,
          toDeleteUsername: '',
        })
        scrollErrorIntoView();
      });
  }

  onDeleteCancel = () => {
    this.setState({
      deleteConfirmDialogOpen: false,
    });
  }

  onDelete = (username: string) => {
    this.setState({
      deleteConfirmDialogOpen: true,
      toDeleteUsername: username,
    })
  }

  renderUserRow = (user: Linode.User) => {
    const { classes } = this.props;
    return (
      <TableRow key={user.username} data-qa-user-row rowLink={`/account/users/${user.username}`}>
        <TableCell parentColumn="Username" data-qa-username>
          <Link to={`/account/users/${user.username}`} title={user.username}>
            <Button className={classes.userButton} tabIndex={-1}>
              {user.gravatarUrl === undefined
                ? <div className={classes.emptyImage} />
                : user.gravatarUrl === 'not found'
                  ? <UserIcon className={classes.avatar} />
                  : <img
                    alt={`user ${user.username}'s avatar`}
                    src={user.gravatarUrl}
                    className={classes.avatar}
                  />
              }
              {user.username}
            </Button>
          </Link>
        </TableCell>
        <TableCell parentColumn="Email Address" data-qa-user-email>{user.email}</TableCell>
        <TableCell parentColumn="Restricted" data-qa-user-restriction>
          {user.restricted ? 'Restricted' : 'Unrestricted'}
        </TableCell>
        <TableCell>
          <ActionMenu
            username={user.username}
            onDelete={this.onDelete}
          />
        </TableCell>
      </TableRow>
    )
  }

  render() {
    const { classes, data: users, error, loading } = this.props;
    const {
      createDrawerOpen,
      newUsername,
      toDeleteUsername,
      deleteConfirmDialogOpen,
      deletedUsername,
      userDeleteError
    } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Users" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography role="header" variant="headline" data-qa-title className={classes.title}>
              Users
                  </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={this.openForCreate}
                  label="Add a User"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {newUsername &&
          <Notice success text={`User ${newUsername} created successfully`} />
        }
        {deletedUsername &&
          <Notice
            style={{ marginTop: newUsername ? 16 : 0 }}
            success
            text={`User ${deletedUsername} deleted successfully`}
          />
        }
        {userDeleteError &&
          <Notice
            style={{ marginTop: (newUsername || deletedUsername) ? 16 : 0 }}
            error
            text={`Error when deleting user, please try again later`}
          />
        }
        <Paper>
          <Table aria-label="List of Users">
            <TableHead>
              <TableRow>
                <TableCell data-qa-username-column>Username</TableCell>
                <TableCell data-qa-email-column>Email Address</TableCell>
                <TableCell data-qa-restriction-column>Restricted</TableCell>
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

  renderTableContent = (loading: boolean, error?: Error, data?: Linode.User[]) => {

    if (loading) {
      return <TableRowLoading colSpan={4} />
    }

    if (error) {
      return <TableRowError colSpan={4} message={`Unable to load user data.`} />
    }

    if (!data || data.length === 0) {
      return <TableRowEmptyState colSpan={4} />
    }

    return data.map(user => this.renderUserRow(user));
  };
}

const styled = withStyles(styles, { withTheme: true });

const memoizedGetGravatarURL = memoize(getGravatarUrl);

const paginated = Pagey((ownProps, params, filters) => getUsers(params, filters)
  .then(({ data, page, pages, results }) =>
    mapPromise(
      data,
      (user) => memoizedGetGravatarURL(user.email)
        .then((gravatarUrl: string) => ({ ...user, gravatarUrl }))
    )
      .then((updatedUsers) => ({ page, pages, results, data: updatedUsers }))));

export default compose<any, any, any, any, any>(
  withRouter,
  setDocs(UsersLanding.docs),
  styled,
  paginated
)(UsersLanding);
