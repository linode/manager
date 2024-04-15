import React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import { useLinodeCreateQueryParams } from '../utilities';

import type { LinodeCreateType } from '../../LinodesCreate/types';

export const UserDataHeading = () => {
  const { params } = useLinodeCreateQueryParams();

  const warningMessageMap: Record<LinodeCreateType, null | string> = {
    Backups:
      'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.',
    'Clone Linode':
      'Existing user data is not cloned. You may add new user data now.',
    Distributions: null,
    Images: null,
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
              <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
                Learn more
              </Link>
              .
            </>
          }
          interactive
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
