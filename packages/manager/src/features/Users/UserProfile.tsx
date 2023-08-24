import { deleteUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
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

interface UserProfileProps {
  accountErrors?: APIError[];
  accountSaving: boolean;
  accountSuccess: boolean;
  changeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

export const UserProfile = (props: UserProfileProps) => {
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
        <Typography
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            [theme.breakpoints.down('md')]: {
              marginLeft: theme.spacing(),
            },
          })}
          data-qa-profile-header
          variant="h2"
        >
          User Profile
        </Typography>
        <StyledWrapper>
          {accountSuccess && (
            <Notice spacingBottom={0} success>
              Username updated successfully
            </Notice>
          )}
          {generalAccountError && (
            <Notice error spacingBottom={0} text={generalAccountError} />
          )}
          <TextField
            data-qa-username
            errorText={hasAccountErrorFor('username')}
            label="Username"
            onChange={changeUsername}
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
        </StyledWrapper>
        <StyledWrapper>
          {profileSuccess && (
            <Notice spacingBottom={0} success>
              Email updated successfully
            </Notice>
          )}
          {generalProfileError && (
            <Notice error spacingBottom={0} text={generalProfileError} />
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
        </StyledWrapper>
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
      <StyledWrapper>
        <Typography data-qa-delete-user-header variant="h2">
          Delete User
        </Typography>
        {userDeleteError && (
          <Notice
            error
            sx={{ marginLeft: 0, marginTop: theme.spacing(2) }}
            text="Error when deleting user, please try again later"
          />
        )}
        <Button
          sx={{
            marginLeft: 0,
            marginTop: theme.spacing(2),
          }}
          buttonType="outlined"
          data-qa-confirm-delete
          disabled={profile?.username === originalUsername}
          onClick={onDelete}
        >
          Delete
        </Button>
        {profile?.username === originalUsername && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{ marginLeft: 0, marginTop: theme.spacing(2) }}
            text="You can't delete the currently active user"
          />
        )}
        <Typography
          sx={{ marginLeft: 0, marginTop: theme.spacing(2) }}
          variant="body1"
        >
          The user will be deleted permanently.
        </Typography>
      </StyledWrapper>
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

const StyledWrapper = styled(Paper, {
  label: 'StyledWrapper',
})(({ theme }) => ({
  '&:not(:last-child)': {
    marginBottom: theme.spacing(3),
  },
  backgroundColor: theme.color.white,
  marginTop: theme.spacing(),
}));
