import { deleteUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
  topMargin: {
    marginLeft: 0,
    marginTop: theme.spacing(2),
  },
  wrapper: {
    '&:not(:last-child)': {
      marginBottom: theme.spacing(3),
    },
    backgroundColor: theme.color.white,
    marginTop: theme.spacing(),
  },
}));

interface Props {
  accountErrors?: APIError[];
  accountSaving: boolean;
  accountSuccess: boolean;
  changeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeUsername: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  email?: string;
  originalEmail?: string;
  originalUsername?: string;
  profileErrors?: APIError[];
  profileSaving: boolean;
  profileSuccess: boolean;
  saveAccount: () => void;
  saveProfile: () => void;
  username: string;
}

const UserProfile: React.FC<Props> = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const { push } = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const {
    accountErrors,
    accountSaving,
    accountSuccess,
    changeEmail,
    changeUsername,
    email,
    originalEmail,
    originalUsername,
    profileErrors,
    profileSaving,
    profileSuccess,
    saveAccount,
    saveProfile,
    username,
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
        <Typography className={classes.title} variant="h2">
          User Profile
        </Typography>
        <Paper className={classes.wrapper}>
          {accountSuccess && (
            <Notice spacingBottom={0} variant="success">
              Username updated successfully
            </Notice>
          )}
          {generalAccountError && (
            <Notice
              spacingBottom={0}
              text={generalAccountError}
              variant="error"
            />
          )}
          <TextField
            data-qa-username
            errorText={hasAccountErrorFor('username')}
            label="Username"
            onBlur={changeUsername}
            onChange={changeUsername}
            trimmed
            value={username}
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: username === originalUsername,
              label: 'Save',
              loading: accountSaving,
              onClick: saveAccount,
            }}
          />
        </Paper>
        <Paper className={classes.wrapper}>
          {profileSuccess && (
            <Notice spacingBottom={0} variant="success">
              Email updated successfully
            </Notice>
          )}
          {generalProfileError && (
            <Notice
              spacingBottom={0}
              text={generalProfileError}
              variant="error"
            />
          )}
          <TextField
            tooltipText={
              profile?.username !== originalUsername
                ? "You can't change another user\u{2019}s email address"
                : ''
            }
            data-qa-email
            // This should be disabled if this is NOT the current user.
            disabled={profile?.username !== originalUsername}
            errorText={hasProfileErrorFor('email')}
            label="Email"
            onChange={changeEmail}
            trimmed
            type="email"
            value={email}
          />
          <ActionsPanel
            // This should be disabled if this is NOT the current user.
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled:
                profile?.username !== originalUsername ||
                email === originalEmail,
              label: 'Save',
              loading: profileSaving,
              onClick: saveProfile,
            }}
          />
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
        <Typography data-qa-delete-user-header variant="h2">
          Delete User
        </Typography>
        {userDeleteError && (
          <Notice
            className={classes.topMargin}
            text="Error when deleting user, please try again later"
            variant="error"
          />
        )}
        <Button
          buttonType="outlined"
          className={classes.topMargin}
          data-qa-confirm-delete
          disabled={profile?.username === originalUsername}
          onClick={onDelete}
        >
          Delete
        </Button>
        {profile?.username === originalUsername && (
          <TooltipIcon
            sxTooltipIcon={{
              marginLeft: 0,
              marginTop: theme.spacing(2),
            }}
            status="help"
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
            onCancel={onDeleteCancel}
            onDelete={() => onDeleteConfirm(username)}
            open={deleteConfirmDialogOpen}
            username={username}
          />
        </>
      ) : (
        <CircleProgress />
      )}
    </>
  );
};

export default UserProfile;
