import * as React from 'react';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import ExternalLink from 'src/components/ExternalLink';
import Link from 'src/components/Link';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { ApplicationState } from 'src/store';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { SingleTextFieldForm } from 'src/components/SingleTextFieldForm/SingleTextFieldForm';
import { TimezoneForm } from './TimezoneForm';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { updateUser } from '@linode/api-v4/lib/account';
import { useLocation } from 'react-router-dom';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useSelector } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { v4 } from 'uuid';

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
      an account using the same email address as your Linode account. Upload
      your desired profile image to your Gravatar account and it will be
      automatically linked.
    </>
  );

  return (
    <Paper>
      <Box
        display="flex"
        sx={{
          gap: 2,
          marginTop: theme.spacing(),
          marginBottom: theme.spacing(4),
        }}
      >
        <GravatarByEmail email={profile?.email ?? ''} height={88} width={88} />
        <div>
          <Typography variant="h2" sx={{ fontSize: '1rem' }}>
            Profile photo
            <StyledTooltipIcon
              interactive
              text={tooltipIconText}
              status="help"
              sxTooltipIcon={{
                marginTop: '-2px',
                marginLeft: '6px',
                padding: 0,
              }}
            />
          </Typography>
          <StyledProfileCopy variant="body1">
            Create, upload, and manage your globally recognized avatar from a
            single place with Gravatar.
          </StyledProfileCopy>
          <StyledAddImageLink
            link="https://en.gravatar.com/"
            text={'Manage photo'}
            fixedIcon
          />
        </div>
      </Box>
      <Divider />
      <SingleTextFieldForm
        key={usernameResetToken}
        label="Username"
        submitForm={updateUsername}
        initialValue={profile?.username}
        disabled={profile?.restricted}
        tooltipText={
          profile?.restricted
            ? 'Restricted users cannot update their username. Please contact an account administrator.'
            : undefined
        }
        successCallback={requestProfile}
      />
      <Divider spacingTop={24} />
      <SingleTextFieldForm
        key={emailResetToken}
        label="Email"
        submitForm={updateEmail}
        initialValue={profile?.email}
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
        inputRef={emailRef}
        type="email"
      />
      <Divider spacingTop={24} spacingBottom={16} />
      <TimezoneForm loggedInAsCustomer={loggedInAsCustomer} />
    </Paper>
  );
};

const StyledAddImageLink = styled(ExternalLink, {
  label: 'StyledAddImageLink',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  '& svg': {
    height: '1rem',
    width: '1rem',
    position: 'relative',
    top: 3,
    left: 6,
  },
}));

const StyledProfileCopy = styled(Typography, {
  label: 'StyledProfileCopy',
})(({ theme }) => ({
  marginTop: 4,
  marginBottom: theme.spacing(2),
  maxWidth: 360,
}));

const StyledTooltipIcon = styled(TooltipIcon, {
  label: 'StyledTooltip',
})(() => ({
  '& .MuiTooltip-tooltip': {
    minWidth: 350,
  },
}));
