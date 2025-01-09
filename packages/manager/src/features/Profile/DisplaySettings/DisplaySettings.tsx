import { Divider, Paper, Stack } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useProfile } from 'src/queries/profile/profile';

import { AvatarForm } from './AvatarForm';
import { EmailForm } from './EmailForm';
import { TimezoneForm } from './TimezoneForm';
import { UsernameForm } from './UsernameForm';

export const DisplaySettings = () => {
  const { data: profile } = useProfile();

  const isProxyUser = profile?.user_type === 'proxy';

  return (
    <>
      <DocumentTitleSegment segment="Display" />
      <Paper>
        <Stack
          divider={<Divider spacingBottom={0} spacingTop={0} />}
          spacing={3}
        >
          {!isProxyUser && <AvatarForm />}
          <UsernameForm />
          <EmailForm />
          <TimezoneForm />
        </Stack>
      </Paper>
    </>
  );
};

export const displaySettingsLazyRoute = createLazyRoute('/profile/display')({
  component: DisplaySettings,
});
