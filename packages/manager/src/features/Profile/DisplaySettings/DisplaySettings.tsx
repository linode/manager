import { Divider, Paper, Stack } from '@linode/ui';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useDelegationRole } from 'src/features/IAM/hooks/useDelegationRole';

import { AvatarForm } from './AvatarForm';
import { EmailForm } from './EmailForm';
import { TimezoneForm } from './TimezoneForm';
import { UsernameForm } from './UsernameForm';

export const DisplaySettings = () => {
  const { isProxyOrDelegateUserType } = useDelegationRole();

  return (
    <>
      <DocumentTitleSegment segment="Display" />
      <Paper>
        <Stack
          divider={<Divider spacingBottom={0} spacingTop={0} />}
          spacing={3}
        >
          {!isProxyOrDelegateUserType && <AvatarForm />}
          <UsernameForm />
          <EmailForm />
          <TimezoneForm />
        </Stack>
      </Paper>
    </>
  );
};
