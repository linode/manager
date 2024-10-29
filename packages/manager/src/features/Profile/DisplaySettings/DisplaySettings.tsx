import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { useProfile } from 'src/queries/profile/profile';

import { AvatarForm } from './AvatarForm';
import { EmailForm } from './EmailForm';
import { TimezoneForm } from './TimezoneForm';
import { UsernameForm } from './UsernameForm';

export const DisplaySettings = () => {
  const { data: profile } = useProfile();

  const isProxyUser = profile?.user_type === 'proxy';

  return (
    <Paper>
      <Stack divider={<Divider spacingBottom={0} spacingTop={0} />} spacing={3}>
        {!isProxyUser && <AvatarForm />}
        <UsernameForm />
        <EmailForm />
        <TimezoneForm />
      </Stack>
    </Paper>
  );
};

export const displaySettingsLazyRoute = createLazyRoute('/profile/display')({
  component: DisplaySettings,
});
