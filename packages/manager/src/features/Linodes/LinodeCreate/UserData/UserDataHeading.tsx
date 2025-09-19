import { Notice, Stack, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { useGetLinodeCreateType } from '../Tabs/utils/useGetLinodeCreateType';

import type { LinodeCreateType } from '@linode/utilities';

export const UserDataHeading = () => {
  const createType = useGetLinodeCreateType();

  const warningMessageMap: Record<LinodeCreateType, null | string> = {
    Backups:
      'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.',
    'Clone Linode':
      'Existing user data is not cloned. You may add new user data now.',
    Images: null,
    OS: null,
    'One-Click': null,
    StackScripts: null,
  };

  const warningMessage = createType ? warningMessageMap[createType] : null;

  return (
    <Stack spacing={1}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h2">Add User Data</Typography>
        <Typography>
          User data is a feature of the Metadata service that enables you to
          perform system configuration tasks (such as adding users and
          installing software) by providing custom instructions or scripts to
          cloud-init. Any user data should be added at this step and cannot be
          modified after the the Linode has been created.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/overview-of-the-metadata-service">
            Learn more
          </Link>
          .
        </Typography>
      </Stack>
      {warningMessage && (
        <Notice spacingBottom={0} spacingTop={0} variant="warning">
          {warningMessage}
        </Notice>
      )}
    </Stack>
  );
};
