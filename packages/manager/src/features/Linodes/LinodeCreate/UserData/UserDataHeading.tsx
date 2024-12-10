import { Notice, Stack, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';

import { useLinodeCreateQueryParams } from '../utilities';

import type { LinodeCreateType } from '../types';

export const UserDataHeading = () => {
  const { params } = useLinodeCreateQueryParams();

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

  const warningMessage = params.type ? warningMessageMap[params.type] : null;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Typography variant="h2">Add User Data</Typography>
        <TooltipIcon
          text={
            <>
              User data allows you to provide additional custom data to
              cloud-init to further configure your system.{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/overview-of-the-metadata-service">
                Learn more
              </Link>
              .
            </>
          }
          status="help"
          sxTooltipIcon={{ p: 0 }}
        />
      </Stack>
      {warningMessage && (
        <Notice spacingBottom={0} spacingTop={0} variant="warning">
          {warningMessage}
        </Notice>
      )}
    </Stack>
  );
};
