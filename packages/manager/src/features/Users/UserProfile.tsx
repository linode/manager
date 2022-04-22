import { deleteUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { makeStyles } from '@material-ui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { useProfile } from 'src/queries/profile';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import UserDeleteConfirmationDialog from './UserDeleteConfirmationDialog';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(),
    },
  },
  wrapper: {
    backgroundColor: theme.color.white,
    marginTop: theme.spacing(),
    '&:not(:last-child)': {
      marginBottom: theme.spacing(3),
    },
  },
  topMargin: {
    marginTop: theme.spacing(2),
    marginLeft: 0,
  },
}));

interface Props {
  username: string;
  email?: string;
  changeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveAccount: () => void;
  accountSaving: boolean;
  accountSuccess: boolean;
  accountErrors?: APIError[];
  saveProfile: () => void;
  profileSaving: boolean;
  profileSuccess: boolean;
  profileErrors?: APIError[];
  originalUsername?: string;
  originalEmail?: string;
}

const UserProfile: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { push } = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const {
    username,
    email,
    changeUsername,
    changeEmail,
    saveAccount,
    accountSaving,
    accountSuccess,
    accountErrors,
    profileSaving,
    profileSuccess,
    profileErrors,
    saveProfile,
    originalUsername,
    originalEmail,
  } = props;

  const { data: profile } = useProfile();

  const [
    deleteConfirmDialogOpen,
    setDeleteConfirmDialogOpen,
  ] = React.useState<boolean>(false);
  const [userDeleteError, setUserDeleteError] = React.useState<boolean>(false);

  const renderProfileSection = () => {
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
      <>
        <Typography
          className={classes.title}
          variant="h2"
          data-qa-profile-header
        >
          User Profile
        </Typography>
        <Paper className={classes.wrapper}>
          {accountSuccess && (
            <Notice success spacingBottom={0}>
              Username updated successfully
            </Notice>
          )}
          {generalAccountError && (
            <Notice error text={generalAccountError} spacingBottom={0} />
          )}
          <TextField
            label="Username"
            value={username}
            onChange={changeUsername}
            errorText={hasAccountErrorFor('username')}
            data-qa-username
          />
          <ActionsPanel>
            <Button
              buttonType="primary"
              disabled={username === originalUsername}
              loading={accountSaving}
              onClick={saveAccount}
              data-qa-submit
            >
              Save
            </Button>
          </ActionsPanel>
        </Paper>
        <Paper className={classes.wrapper}>
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
            disabled={profile?.username !== originalUsername}
            label="Email"
            value={email}
            onChange={changeEmail}
            tooltipText={
              profile?.username !== originalUsername
                ? "You can't change another user\u{2019}s email address"
                : ''
            }
            errorText={hasProfileErrorFor('email')}
            data-qa-email
          />
          <ActionsPanel>
            <Button
              // This should be disabled if this is NOT the current user.
              disabled={
                profile?.username !== originalUsername ||
                email === originalEmail
              }
              buttonType="primary"
              loading={profileSaving}
              onClick={saveProfile}
              data-qa-submit
            >
              Save
            </Button>
          </ActionsPanel>
        </Paper>
      </>
    );
  };

  const onDeleteConfirm = (username: string) => {
    setUserDeleteError(false);
    setDeleteConfirmDialogOpen(false);
    deleteUser(username)
      .then(() => {
        enqueueSnackbar(`User ${username} has been deleted successfully.`, {
          variant: 'success',
        });
        push(`/account/users`, { deletedUsername: username });
      })
      .catch(() => {
        setUserDeleteError(true);
        scrollErrorIntoView();
      });
  };

  const onDelete = () => {
    setDeleteConfirmDialogOpen(true);
  };

  const onDeleteCancel = () => {
    setDeleteConfirmDialogOpen(false);
  };

  const renderDeleteSection = () => {
    return (
      <Paper className={classes.wrapper}>
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
          disabled={profile?.username === originalUsername}
          buttonType="outlined"
          className={classes.topMargin}
          onClick={onDelete}
          data-qa-confirm-delete
        >
          Delete
        </Button>
        {profile?.username === originalUsername && (
          <HelpIcon
            className={classes.topMargin}
            text="You can't delete the currently active user"
          />
        )}
        <Typography className={classes.topMargin} variant="body1">
          The user will be deleted permanently.
        </Typography>
      </Paper>
    );
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {username !== undefined ? (
        <>
          <DocumentTitleSegment segment={`${username} - Profile`} />
          {renderProfileSection()}
          {renderDeleteSection()}
          <UserDeleteConfirmationDialog
            username={username}
            open={deleteConfirmDialogOpen}
            onDelete={onDeleteConfirm}
            onCancel={onDeleteCancel}
          />
        </>
      ) : (
        <CircleProgress />
      )}
    </>
  );
};

export default UserProfile;
