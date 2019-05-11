import { withSnackbar, WithSnackbarProps } from 'notistack';
import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { deleteUser } from 'src/services/account';
import { MapState } from 'src/store/types';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import UserDeleteConfirmationDialog from './UserDeleteConfirmationDialog';

type ClassNames =
  | 'root'
  | 'inner'
  | 'field'
  | 'deleteRoot'
  | 'topMargin'
  | 'emailField'
  | 'emailAddress';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
    backgroundColor: theme.color.white
  },
  deleteRoot: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white
  },
  inner: {
    padding: theme.spacing.unit * 3
  },
  field: {
    marginTop: theme.spacing.unit * 3
  },
  topMargin: {
    marginTop: theme.spacing.unit * 2
  },
  emailField: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2
  },
  emailAddress: {
    marginTop: theme.spacing.unit
  }
});

interface Props {
  username: string;
  email?: string;
  changeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveAccount: () => void;
  accountSaving: boolean;
  accountSuccess: boolean;
  accountErrors?: Linode.ApiFieldError[];
  saveProfile: () => void;
  profileSaving: boolean;
  profileSuccess: boolean;
  profileErrors?: Linode.ApiFieldError[];
  originalUsername?: string;
}

interface State {
  deleteConfirmDialogOpen: boolean;
  toDeleteUsername: string;
  userDeleteError: boolean;
}

type CombinedProps = Props &
  WithSnackbarProps &
  StateProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}>;

class UserProfile extends React.Component<CombinedProps> {
  state: State = {
    deleteConfirmDialogOpen: false,
    toDeleteUsername: this.props.username,
    userDeleteError: false
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (this.props.username && !prevProps.username) {
      this.setState({
        toDeleteUsername: this.props.username
      });
    }
  }

  renderProfileSection = () => {
    const {
      classes,
      username,
      email,
      changeUsername,
      changeEmail,
      saveAccount,
      accountSaving,
      accountSuccess,
      accountErrors,
      saveProfile,
      profileSaving,
      profileSuccess,
      profileErrors,
      profileUsername,
      originalUsername
    } = this.props;

    const hasAccountErrorFor = getAPIErrorsFor(
      { username: 'Username' },
      accountErrors
    );

    const hasProfileErrorFor = getAPIErrorsFor(
      { email: 'Email' },
      profileErrors
    );

    const generalAccountError = hasAccountErrorFor('none');

    const generalProfileError = hasProfileErrorFor('none');

    return (
      <React.Fragment>
        <Typography variant="h2" data-qa-profile-header>
          User Profile
        </Typography>
        <Paper className={classes.root}>
          <div className={classes.inner}>
            {accountSuccess && (
              <Notice success spacingBottom={0}>
                Username updated successfully
              </Notice>
            )}
            {generalAccountError && (
              <Notice error text={generalAccountError} spacingBottom={0} />
            )}
            <TextField
              className={classes.field}
              label="Username"
              value={username}
              onChange={changeUsername}
              errorText={hasAccountErrorFor('username')}
              data-qa-username
            />
            <ActionsPanel>
              <Button
                type="primary"
                loading={accountSaving}
                onClick={saveAccount}
                data-qa-submit
              >
                Save
              </Button>
            </ActionsPanel>
          </div>
        </Paper>
        <Paper className={classes.root}>
          <div className={classes.inner}>
            {profileSuccess && (
              <Notice success spacingBottom={0}>
                Email updated successfully
              </Notice>
            )}
            {generalProfileError && (
              <Notice error text={generalProfileError} spacingBottom={0} />
            )}
            <TextField
              // This should be disabled if this is NOT the current user.
              disabled={profileUsername !== originalUsername}
              className={classes.field}
              label="Email"
              value={email}
              onChange={changeEmail}
              errorText={hasProfileErrorFor('email')}
              data-qa-username
            />
            <ActionsPanel>
              <Button
                // This should be disabled if this is NOT the current user.
                disabled={profileUsername !== originalUsername}
                type="primary"
                loading={profileSaving}
                onClick={saveProfile}
                data-qa-submit
              >
                Save
              </Button>
            </ActionsPanel>
          </div>
        </Paper>
      </React.Fragment>
    );
  };

  onDeleteConfirm = (username: string) => {
    const {
      history: { push }
    } = this.props;
    this.setState({
      userDeleteError: false,
      deleteConfirmDialogOpen: false
    });
    deleteUser(username)
      .then(() => {
        this.props.enqueueSnackbar(
          `User ${username} has been deleted successfully.`,
          { variant: 'success' }
        );
        push(`/account/users`, { deletedUsername: username });
      })
      .catch(() => {
        this.setState({
          userDeleteError: true
        });
        scrollErrorIntoView();
      });
  };

  onDelete = () => {
    this.setState({
      deleteConfirmDialogOpen: true
    });
  };

  onDeleteCancel = () => {
    this.setState({
      deleteConfirmDialogOpen: false
    });
  };

  renderDeleteSection() {
    const { classes, profileUsername } = this.props;
    const { userDeleteError, toDeleteUsername } = this.state;
    return (
      <Paper className={classes.deleteRoot}>
        <div className={classes.inner}>
          <Typography variant="h2" data-qa-delete-user-header>
            Delete User
          </Typography>
          {userDeleteError && (
            <Notice
              className={classes.topMargin}
              error
              text="Error when deleting user, please try again later"
            />
          )}
          <Button
            disabled={profileUsername === toDeleteUsername}
            className={classes.topMargin}
            type="secondary"
            destructive
            onClick={this.onDelete}
            data-qa-confirm-delete
          >
            Delete
          </Button>
          {profileUsername === toDeleteUsername && (
            <HelpIcon
              className={classes.topMargin}
              text="You can't delete the currently active user"
            />
          )}
          <Typography className={classes.topMargin} variant="body1">
            The user will be deleted permanently.
          </Typography>
        </div>
      </Paper>
    );
  }

  render() {
    const { username } = this.props;
    const { toDeleteUsername, deleteConfirmDialogOpen } = this.state;

    return (
      <React.Fragment>
        {username !== undefined ? (
          <React.Fragment>
            <DocumentTitleSegment segment={`${username} - Profile`} />
            {this.renderProfileSection()}
            {this.renderDeleteSection()}
            <UserDeleteConfirmationDialog
              username={toDeleteUsername || ''}
              open={deleteConfirmDialogOpen}
              onDelete={this.onDeleteConfirm}
              onCancel={this.onDeleteCancel}
            />
          </React.Fragment>
        ) : (
          <CircleProgress />
        )}
      </React.Fragment>
    );
  }
}

interface StateProps {
  profileUsername?: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  profileUsername: path(['data', 'username'], state.__resources.profile)
});

export const connected = connect(mapStateToProps);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withRouter,
  connected,
  withSnackbar
);

export default enhanced(UserProfile);
