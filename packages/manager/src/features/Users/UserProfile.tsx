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
import { Typography } from 'src/components/Typography';
import { useAccountUser } from 'src/queries/account/users';
import { useProfile } from 'src/queries/profile/profile';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { PARENT_USER, RESTRICTED_FIELD_TOOLTIP } from '../Account/constants';
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
  const { data: currentUser } = useAccountUser(username);

  const [
    deleteConfirmDialogOpen,
    setDeleteConfirmDialogOpen,
  ] = React.useState<boolean>(false);

  const isProxyUserProfile = currentUser?.user_type === 'proxy';

  const tooltipForDisabledUsernameField = isProxyUserProfile
    ? RESTRICTED_FIELD_TOOLTIP
    : undefined;

  const tooltipForDisabledEmailField = isProxyUserProfile
    ? RESTRICTED_FIELD_TOOLTIP
    : profile?.username !== originalUsername
    ? 'You can\u{2019}t change another user\u{2019}s email address.'
    : undefined;

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
            disabled={isProxyUserProfile}
            errorText={hasAccountErrorFor('username')}
            label="Username"
            onBlur={changeUsername}
            onChange={changeUsername}
            tooltipText={tooltipForDisabledUsernameField}
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
            // This should be disabled if this is NOT the current user or if the proxy user is viewing their own profile.
            disabled={
              profile?.username !== originalUsername || isProxyUserProfile
            }
            data-qa-email
            errorText={hasProfileErrorFor('email')}
            label="Email"
            onChange={changeEmail}
            tooltipText={tooltipForDisabledEmailField}
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
          disabled={
            profile?.username === originalUsername || isProxyUserProfile
          }
          sx={{
            marginLeft: 0,
            marginTop: theme.spacing(2),
          }}
          tooltipText={
            profile?.username === originalUsername
              ? 'You can\u{2019}t delete the currently active user.'
              : isProxyUserProfile
              ? `You can\u{2019}t delete a ${PARENT_USER}.`
              : undefined
          }
          buttonType="outlined"
          data-qa-confirm-delete
          onClick={onDelete}
        >
          Delete
        </Button>
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
