import * as React from 'react';

import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';

export const UserDataAccordionHeading = () => {
  return (
    <Box display="flex">
      Add User Data
      <TooltipIcon
        text={
          <>
            User data allows you to provide additional custom data to cloud-init
            to further configure your system.{' '}
            <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
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
