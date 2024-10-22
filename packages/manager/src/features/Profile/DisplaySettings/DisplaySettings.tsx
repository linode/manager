import { styled, useTheme } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Avatar } from 'src/components/Avatar/Avatar';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile/profile';

import { AvatarColorPickerDialog } from './AvatarColorPickerDialog';
import { EmailForm } from './EmailForm';
import { TimezoneForm } from './TimezoneForm';
import { UsernameForm } from './UsernameForm';

export const DisplaySettings = () => {
  const theme = useTheme();
  const { data: profile } = useProfile();
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

  return (
    <Paper>
      <Stack divider={<Divider spacingBottom={0} spacingTop={0} />} spacing={3}>
        {!isProxyUser && (
          <Box
            sx={{
              gap: 2,
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
        )}
        <UsernameForm />
        <EmailForm />
        <TimezoneForm />
      </Stack>
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

export const displaySettingsLazyRoute = createLazyRoute('/profile/display')({
  component: DisplaySettings,
});
