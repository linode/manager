import { Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

export const LinodeResizeAllocationError = () => {
  return (
    <Typography>
      The current disk size of your Linode is too large for the new service
      plan. Please resize your disk to accommodate the new plan. You can read
      our{' '}
      <Link to="https://techdocs.akamai.com/cloud-computing/docs/resize-a-compute-instance">
        Resize Your Linode
      </Link>{' '}
      guide for more detailed instructions.
    </Typography>
  );
};
