import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

export const LinodeResizeAllocationError = () => {
  return (
    <Typography>
      The current disk size of your Linode is too large for the new service
      plan. Please resize your disk to accommodate the new plan. You can read
      our{' '}
      <Link to="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/">
        Resize Your Linode
      </Link>{' '}
      guide for more detailed instructions.
    </Typography>
  );
};
