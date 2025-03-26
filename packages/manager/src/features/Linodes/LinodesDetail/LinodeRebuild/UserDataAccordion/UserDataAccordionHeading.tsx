import { Box, TooltipIcon } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

export const UserDataAccordionHeading = () => {
  return (
    <Box display="flex">
      Add User Data
      <TooltipIcon
        text={
          <>
            User data allows you to provide additional custom data to cloud-init
            to further configure your system.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/overview-of-the-metadata-service">
              Learn more.
            </Link>
          </>
        }
        status="help"
        sxTooltipIcon={{ alignItems: 'baseline', padding: '0 8px' }}
      />
    </Box>
  );
};
