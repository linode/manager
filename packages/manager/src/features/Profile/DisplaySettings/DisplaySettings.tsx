import { updateUser } from '@linode/api-v4/lib/account';
import { styled, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { v4 } from 'uuid';

import { Avatar } from 'src/components/Avatar/Avatar';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { SingleTextFieldForm } from 'src/components/SingleTextFieldForm/SingleTextFieldForm';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { RESTRICTED_FIELD_TOOLTIP } from 'src/features/Account/constants';
import { useNotificationsQuery } from 'src/queries/account/notifications';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';
import { checkForGravatar, getGravatarUrl } from 'src/utilities/gravatar';

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

  const [hasGravatar, setHasGravatar] = useState(false);
  checkForGravatar(getGravatarUrl(profile?.email ?? '')).then((res: boolean) =>
    setHasGravatar(res)
  );

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

  const tooltipIconText = (
    <>
      Go to <Link to="https://en.gravatar.com/">gravatar.com</Link> and register
      an account using the same email address as your Cloud Manager account.
      Upload your desired profile image to your Gravatar account and it will be
      automatically linked.
    </>
  );

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
            {hasGravatar ? (
              <GravatarByEmail
                email={profile?.email ?? ''}
                height={88}
                width={88}
              />
            ) : (
              <Avatar height={88} width={88} />
            )}
            <div>
              <Typography sx={{ fontSize: '1rem' }} variant="h2">
                Profile photo
                {hasGravatar && (
                  <StyledTooltipIcon
                    sxTooltipIcon={{
                      marginLeft: '6px',
                      marginTop: '-2px',
                      padding: 0,
                    }}
                    status="help"
                    text={tooltipIconText}
                  />
                )}
              </Typography>
              <StyledProfileCopy variant="body1">
                {hasGravatar
                  ? 'Create, upload, and manage your globally recognized avatar from a single place with Gravatar.'
                  : 'Your profile photo is automatically generated using the first character of your username.'}
              </StyledProfileCopy>
              {!hasGravatar && (
                <Button
                  buttonType="outlined"
                  onClick={() => setAvatarColorPickerDialogOpen(true)}
                >
                  Change Avatar Color
                </Button>
              )}
              {hasGravatar && (
                <StyledAddImageLink external to="https://en.gravatar.com/">
                  Manage photo
                </StyledAddImageLink>
              )}
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

const StyledAddImageLink = styled(Link, {
  label: 'StyledAddImageLink',
})(({ theme }) => ({
  '& svg': {
    height: '1rem',
    left: 6,
    position: 'relative',
    top: 3,
    width: '1rem',
  },
  fontFamily: theme.font.bold,
  fontSize: '1rem',
}));

const StyledProfileCopy = styled(Typography, {
  label: 'StyledProfileCopy',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: 4,
  maxWidth: 360,
}));

const StyledTooltipIcon = styled(TooltipIcon, {
  label: 'StyledTooltip',
})(() => ({
  '& .MuiTooltip-tooltip': {
    minWidth: 350,
  },
}));
