import { clone, compose, lensPath, set } from 'ramda';
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
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { deleteUser, getUsers } from 'src/services/account';
import { getGravatarUrl } from 'src/utilities/gravatar';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import scrollToTop from 'src/utilities/scrollToTop';

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
    fontWeight: 400,
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
  users?: Linode.User[];
  error?: Error;
  createDrawerOpen: boolean;
  newUsername?: string;
  deleteConfirmDialogOpen: boolean;
  toDeleteUsername?: string;
  deletedUsername?: string;
  userDeleteError?: boolean;
}

type CombinedProps = WithStyles<ClassNames> & RouteComponentProps<{}>;

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
    getUsers()
      .then(({ data: users }) => {
        this.setState({
          users,
        }, this.setUserAvatars);
      })
      .catch((errResponse) => {
        this.setState({
          error: new Error('Error when fetching user list'),
        })
      })
    if (locationState && locationState.deletedUsername) {
      this.setState({
        deletedUsername: locationState.deletedUsername,
      })
    }
  }

  addUser = (user: Linode.User) => {
    if (this.state.users) {
      this.setState({
        users: [...this.state.users, user],
        newUsername: user.username,
      });
      this.setUserAvatars();
    }
  }

  setUserAvatars = () => {
    if (!this.state.users) { return; }
    this.state.users.map((user, idx) => {
      if (!user.gravatarUrl) {
        getGravatarUrl(user.email)
          .then((url) => {
            this.setState(set(lensPath(['users', idx, 'gravatarUrl']), url));
          })
      }
    })
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
        if (this.state.users) {
          const deletedUserIdx = this.state.users.findIndex(user => user.username === username);
          const newUsers = clone(this.state.users);
          newUsers.splice(deletedUserIdx, 1);
          this.setState({
            users: newUsers,
            deletedUsername: username,
            toDeleteUsername: '',
          })
        } else {
          this.setState({
            deletedUsername: username,
            toDeleteUsername: '',
          })
        }
        scrollToTop();
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
      <TableRow key={user.username} data-qa-user-row rowLink={`/users/${user.username}`}>
        <TableCell parentColumn="Username" data-qa-username>
          <Link to={`/users/${user.username}`} title={user.username}>
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
    const { classes } = this.props;
    const {
      users,
      error,
      createDrawerOpen,
      newUsername,
      toDeleteUsername,
      deleteConfirmDialogOpen,
      deletedUsername,
      userDeleteError
    } = this.state;

    if (error) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Users" />
          <ErrorState
            errorText="There was an error retrieving the user list. Please reload and try again."
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Users" />
        {users
          ? <React.Fragment>
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
                      <TableCell/>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => this.renderUserRow(user))}
                  </TableBody>
                </Table>
              </Paper>
            </React.Fragment>
          : <CircleProgress />
        }
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
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  withRouter,
  setDocs(UsersLanding.docs),
  styled,
)(UsersLanding);
