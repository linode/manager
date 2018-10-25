import { path } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { deleteUser } from 'src/services/account';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import UserDeleteConfirmationDialog from './UserDeleteConfirmationDialog';

type ClassNames = 'root' | 'inner' | 'field' | 'deleteRoot' | 'topMargin';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit,
    backgroundColor: theme.color.white,
  },
  deleteRoot: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  field: {
    marginTop: theme.spacing.unit * 3,
  },
  topMargin: {
    marginTop: theme.spacing.unit * 2,
  }
});

interface Props {
  username: string;
  email?: string;
  changeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
  save: () => void;
  reset: () => void;
  saving: boolean;
  success: boolean;
  errors?: Linode.ApiFieldError[];
}

interface State {
  deleteConfirmDialogOpen: boolean;
  toDeleteUsername: string;
  userDeleteError: boolean;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames> & RouteComponentProps<{}>;

class UserProfile extends React.Component<CombinedProps> {
  state: State = {
    deleteConfirmDialogOpen: false,
    toDeleteUsername: this.props.username,
    userDeleteError: false,
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (this.props.username && !prevProps.username) {
      this.setState({
        toDeleteUsername: this.props.username,
      })
    }
  }

  renderProfileSection = () => {
    const {
      classes,
      username,
      email,
      changeUsername,
      save,
      reset,
      saving,
      success,
      errors
    } = this.props;
    const hasErrorFor = getAPIErrorsFor({ username: "Username" }, errors,)
    const generalError = hasErrorFor('none');
    return (
      <Paper className={classes.root}>
        <div className={classes.inner}>
          {success &&
            <Notice success>User Profile updated successfully</Notice>
          }
          {generalError &&
            <Notice error>Error when updating user profile</Notice>
          }
          <Typography variant="title" data-qa-profile-header>
            User Profile
          </Typography>
          <TextField
            className={classes.field}
            label="Username"
            value={username}
            onChange={changeUsername}
            errorText={hasErrorFor('username')}
            data-qa-username
          />
          <TextField
            disabled /* API doesn't allow changing user email address */
            className={classes.field}
            label="Email Address"
            value={email}
            data-qa-email
          />
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              type="primary"
              loading={saving}
              onClick={save}
              data-qa-submit
            >
              Save
            </Button>
            <Button
              type="cancel"
              onClick={reset}
              data-qa-cancel
            >
              Cancel
            </Button>
          </ActionsPanel>
        </div>
      </Paper>
    )
  }

  onDeleteConfirm = (username: string) => {
    const { history: { push } } = this.props;
    this.setState({
      userDeleteError: false,
      deleteConfirmDialogOpen: false,
    });
    deleteUser(username)
      .then(() => {
        push(`/users`, { deletedUsername: username });
      })
      .catch(() => {
        this.setState({
          userDeleteError: true,
        })
        scrollErrorIntoView();
      });
  }

  onDelete = () => {
    this.setState({
      deleteConfirmDialogOpen: true,
    })
  }

  onDeleteCancel = () => {
    this.setState({
      deleteConfirmDialogOpen: false,
    });
  }

  renderDeleteSection() {
    const { classes, profileUsername } = this.props;
    const { userDeleteError, toDeleteUsername } = this.state;
    return (
      <Paper className={classes.deleteRoot}>
        <div className={classes.inner}>
          <Typography variant="title" data-qa-delete-user-header>
            Delete User
          </Typography>
          {userDeleteError &&
            <Notice
              className={classes.topMargin}
              error
              text="Error when deleting user, please try again later"
            />
          }
          <Button
            disabled={profileUsername === toDeleteUsername}
            className={classes.topMargin}
            variant="raised"
            type="secondary"
            destructive
            onClick={this.onDelete}
            data-qa-confirm-delete
          >
            Delete
          </Button>
          {profileUsername === toDeleteUsername &&
            <HelpIcon
              className={classes.topMargin}
              text="You can't delete the currently active user"
            />
          }
          <Typography className={classes.topMargin} variant="caption">
            The user will be deleted permanently.
          </Typography>
        </div>
      </Paper>
    )
  }

  render() {
    const { username } = this.props;
    const { toDeleteUsername, deleteConfirmDialogOpen } = this.state;

    return (
      <React.Fragment>
        {username !== undefined
          ? (
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
          )
          : <CircleProgress />
        }
      </React.Fragment>
    );
  }
}

interface StateProps {
  profileUsername?: string;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => ({
  profileUsername: path(['data', 'username'], state.__resources.profile),
});

export const connected = connect(mapStateToProps);

const styled = withStyles(styles, { withTheme: true });

export default withRouter(connected(styled(UserProfile)));
