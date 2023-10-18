import { APIError } from '@linode/api-v4/lib/types';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import { StyledTitle, StyledWrapper } from './UserProfile.styles';

interface UserProfileProps {
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

export const UserProfile = (props: UserProfileProps) => {
  const theme = useTheme();
  const { push } = useHistory();
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

  const renderProfileSection = () => {
    const hasAccountErrorFor = getAPIErrorFor(
      { username: 'Username' },
      accountErrors
    );

    const hasProfileErrorFor = getAPIErrorFor(
      { email: 'Email' },
      profileErrors
    );

    const generalAccountError = hasAccountErrorFor('none');

    const generalProfileError = hasProfileErrorFor('none');

    return (
      <>
        <StyledTitle variant="h2">User Profile</StyledTitle>
        <StyledWrapper>
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
        </StyledWrapper>
        <StyledWrapper>
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
        </StyledWrapper>
      </>
    );
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
            sxTooltipIcon={{
              marginLeft: 0,
              marginTop: theme.spacing(2),
            }}
            status="help"
            text="You can't delete the currently active user"
          />
        )}
        <Typography
          sx={{
            marginLeft: 0,
            marginTop: theme.spacing(2),
          }}
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
            onSuccess={() => {
              push(`/account/users`);
            }}
            onClose={onDeleteCancel}
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
