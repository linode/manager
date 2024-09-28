import { updateUser } from '@linode/api-v4/lib/account';
import { styled, useTheme } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { v4 } from 'uuid';

import { Avatar } from 'src/components/Avatar/Avatar';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { SingleTextFieldForm } from 'src/components/SingleTextFieldForm/SingleTextFieldForm';
import { Typography } from 'src/components/Typography';
import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';
import { useNotificationsQuery } from 'src/queries/account/notifications';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';

import { AvatarColorPickerDialog } from './AvatarColorPickerDialog';
import { TimezoneForm } from './TimezoneForm';

import type { ApplicationState } from 'src/store';

export const DisplaySettings = () => {
  const theme = useTheme();
  const { mutateAsync: updateProfile } = useMutateProfile();
  const { data: profile, refetch: requestProfile } = useProfile();
  const { data: notifications, refetch } = useNotificationsQuery();
  const loggedInAsCustomer = useSelector(
    (state: ApplicationState) => state.authentication.loggedInAsCustomer
  );
  const location = useLocation<{ focusEmail: boolean }>();
  const emailRef = React.createRef<HTMLInputElement>();

  const isProxyUser = profile?.user_type === 'proxy';

  const [
    isColorPickerDialogOpen,
    setAvatarColorPickerDialogOpen,
  ] = React.useState(false);

  React.useEffect(() => {
    if (location.state?.focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, [emailRef, location.state]);

  // Used as React keys to force-rerender forms.
  const [emailResetToken, setEmailResetToken] = React.useState(v4());
  const [usernameResetToken, setUsernameResetToken] = React.useState(v4());

  const updateUsername = (newUsername: string) => {
    setEmailResetToken(v4());
    // Default to empty string... but I don't believe this is possible.
    return updateUser(profile?.username ?? '', {
      username: newUsername,
    });
  };

  const updateEmail = (newEmail: string) => {
    setUsernameResetToken(v4());
    return updateProfile({ email: newEmail });
  };

  const tooltipForDisabledUsernameField = profile?.restricted
    ? 'Restricted users cannot update their username. Please contact an account administrator.'
    : isProxyUser
    ? RESTRICTED_FIELD_TOOLTIP
    : undefined;

  const tooltipForDisabledEmailField = isProxyUser
    ? RESTRICTED_FIELD_TOOLTIP
    : undefined;

  return (
    <Paper>
      {!isProxyUser && (
        <>
          <Box
            sx={{
              gap: 2,
              marginBottom: theme.spacing(4),
              marginTop: theme.spacing(),
            }}
            display="flex"
          >
            <Avatar height={88} width={88} />
            <div>
              <Typography sx={{ fontSize: '1rem' }} variant="h2">
                Avatar
              </Typography>
              <StyledProfileCopy variant="body1">
                Your avatar is automatically generated using the first character
                of your username.
              </StyledProfileCopy>

              <Button
                buttonType="outlined"
                onClick={() => setAvatarColorPickerDialogOpen(true)}
              >
                Change Avatar Color
              </Button>
            </div>
          </Box>
          <Divider />
        </>
      )}

      <SingleTextFieldForm
        disabled={profile?.restricted || isProxyUser}
        initialValue={profile?.username}
        key={usernameResetToken}
        label="Username"
        submitForm={updateUsername}
        successCallback={requestProfile}
        tooltipText={tooltipForDisabledUsernameField}
        trimmed
      />
      <Divider spacingTop={24} />
      <SingleTextFieldForm
        successCallback={() => {
          // If there's a "user_email_bounce" notification for this user, and
          // the user has just updated their email, re-request notifications to
          // potentially clear the email bounce notification.
          const hasUserEmailBounceNotification = notifications?.find(
            (thisNotification) => thisNotification.type === 'user_email_bounce'
          );
          if (hasUserEmailBounceNotification) {
            refetch();
          }
        }}
        disabled={isProxyUser}
        initialValue={profile?.email}
        inputRef={emailRef}
        key={emailResetToken}
        label="Email"
        submitForm={updateEmail}
        tooltipText={tooltipForDisabledEmailField}
        trimmed
        type="email"
      />
      <Divider spacingBottom={8} spacingTop={24} />
      <TimezoneForm loggedInAsCustomer={loggedInAsCustomer} />
      <AvatarColorPickerDialog
        handleClose={() => setAvatarColorPickerDialogOpen(false)}
        open={isColorPickerDialogOpen}
      />
    </Paper>
  );
};

const StyledProfileCopy = styled(Typography, {
  label: 'StyledProfileCopy',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: 4,
  maxWidth: 360,
}));

export const DisplaySettingsLazyRoute = createLazyRoute('/profile/display')({
  component: DisplaySettings,
});
